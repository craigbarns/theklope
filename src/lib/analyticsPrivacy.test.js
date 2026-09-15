import assert from 'node:assert/strict'
import test from 'node:test'
import {
  buildAnalyticsPageContext,
  captureAcquisition,
  filterVercelAnalyticsEvent,
  getStoredAcquisition,
  loadGoogleAnalytics,
  revokeOptionalServices,
  setOptionalServicesConsent,
  trackEvent,
  trackEventWhenReady,
  trackPageView,
} from './analytics.js'

const createStorage = () => {
  const data = new Map()
  return {
    get length() { return data.size },
    key: (index) => [...data.keys()][index] ?? null,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: (key) => data.delete(key),
  }
}

async function inBrowser(href, callback) {
  const previous = { window: global.window, document: global.document }
  const scripts = new Map()
  const calls = []
  global.window = {
    location: new URL(href),
    localStorage: createStorage(),
    sessionStorage: createStorage(),
    gtag: (...args) => calls.push(args),
  }
  global.document = {
    title: 'Contact', referrer: '', cookie: '',
    getElementById: (id) => scripts.get(id),
    createElement: () => ({ remove() { scripts.delete(this.id) } }),
    head: { appendChild: (script) => scripts.set(script.id, script) },
  }
  setOptionalServicesConsent({ analytics: true, reviews: false, analyticsDecision: 'accepted' })
  try {
    await callback({ scripts, calls })
  } finally {
    setOptionalServicesConsent({ analytics: false, reviews: false, analyticsDecision: 'refused' })
    revokeOptionalServices({ analyticsDecision: 'refused' })
    global.window = previous.window
    global.document = previous.document
  }
}

test('accepted consent never loads or emits analytics on administration and previews', async () => {
  for (const href of [
    'https://www.theklope.com/admin',
    'https://www.theklope.com/ADMIN',
    'https://www.theklope.com/admin123legacy/index.php/sell/orders',
    'https://theklope.vercel.app/contact',
    'http://localhost:5173/contact',
  ]) await inBrowser(href, async ({ scripts, calls }) => {
    assert.equal(await loadGoogleAnalytics(), false)
    assert.equal(trackPageView(window.location.pathname), false)
    assert.equal(trackEvent('search', { result_count: 0 }), false)
    assert.equal(await trackEventWhenReady('page_view'), false)
    assert.equal(captureAcquisition({ referrer: 'https://www.google.com/' }), null)
    assert.equal(getStoredAcquisition(), null)
    assert.equal(filterVercelAnalyticsEvent({ type: 'pageview', url: href }), null)
    assert.equal(scripts.size, 0)
    assert.deepEqual(calls, [])
  })
})

test('page-view arguments cannot smuggle an administrative route from a public page', async () => {
  await inBrowser('https://www.theklope.com/contact', ({ calls }) => {
    assert.equal(trackPageView('/ADMIN?tab=orders'), false)
    assert.equal(trackPageView('/contact'), true)
    assert.equal(trackPageView('/contact'), false)
    assert.equal(calls.length, 1)
  })
})

test('Vercel callbacks redact URLs and obey later navigation and refusal', async () => {
  await inBrowser('https://www.theklope.com/contact', () => {
    const event = { type: 'pageview', url: 'https://www.theklope.com/contact?email=private#secret' }
    assert.deepEqual(filterVercelAnalyticsEvent(event), {
      type: 'pageview', url: 'https://www.theklope.com/contact',
    })
    assert.match(event.url, /email=/)
    assert.equal(filterVercelAnalyticsEvent({ ...event, url: 'https://www.theklope.com/admin' }), null)
    assert.equal(filterVercelAnalyticsEvent(null), null)

    window.location = new URL('https://www.theklope.com/admin')
    assert.equal(filterVercelAnalyticsEvent(event), null)
    window.location = new URL('https://www.theklope.com/contact')
    setOptionalServicesConsent({ analytics: false, reviews: false, analyticsDecision: 'refused' })
    assert.equal(filterVercelAnalyticsEvent(event), null)
  })
})

test('an event waiting for Google is dropped if consent is revoked before the script loads', async () => {
  await inBrowser('https://www.theklope.com/contact', async ({ scripts, calls }) => {
    const pending = trackEventWhenReady('page_view')
    const script = scripts.get('theklope-google-analytics')
    assert.ok(script)
    setOptionalServicesConsent({ analytics: false, reviews: false, analyticsDecision: 'refused' })
    revokeOptionalServices({ analyticsDecision: 'refused' })
    script.onload()
    assert.equal(await pending, false)
    assert.equal(window['ga-disable-G-SF5BGR7ZXQ'], true)
    assert.equal(calls.some(([command]) => command === 'event'), false)
  })
})

test('an event waiting for Google never follows the user to another page', async () => {
  for (const path of ['/admin', '/faq']) {
    await inBrowser('https://www.theklope.com/contact', async ({ scripts, calls }) => {
      const pending = trackEventWhenReady('page_view')
      window.location = new URL(`https://www.theklope.com${path}`)
      scripts.get('theklope-google-analytics').onload()
      assert.equal(await pending, false)
      assert.equal(calls.some(([command]) => command === 'event'), false)
    })
  }
})

test('public page measurement still works after an administration visit', async () => {
  await inBrowser('https://www.theklope.com/admin', async ({ scripts, calls }) => {
    revokeOptionalServices({ analyticsDecision: 'accepted' })
    assert.equal(await loadGoogleAnalytics(), false)
    window.location = new URL('https://www.theklope.com/contact')
    const pending = trackEventWhenReady('page_view')
    scripts.get('theklope-google-analytics').onload()
    assert.equal(await pending, true)
    assert.equal(window['ga-disable-G-SF5BGR7ZXQ'], false)
    assert.equal(calls.filter(([command]) => command === 'event').length, 1)
  })
})

test('a synchronous public event re-enables the tag after administration suspension', async () => {
  await inBrowser('https://www.theklope.com/admin', ({ calls }) => {
    revokeOptionalServices({ analyticsDecision: 'accepted' })
    window.location = new URL('https://www.theklope.com/contact')
    assert.equal(trackPageView('/contact'), true)
    assert.equal(window['ga-disable-G-SF5BGR7ZXQ'], false)
    const configIndex = calls.findIndex(([command]) => command === 'config')
    const eventIndex = calls.findIndex(([command]) => command === 'event')
    assert.ok(configIndex >= 0 && eventIndex > configIndex)
  })
})

test('private administration paths are not exposed as referrers on public pages', () => {
  assert.deepEqual(buildAnalyticsPageContext({
    href: 'https://www.theklope.com/contact',
    referrer: 'https://www.theklope.com/ADMIN?tab=orders',
  }), { page_location: 'https://www.theklope.com/contact', page_referrer: '' })
})
