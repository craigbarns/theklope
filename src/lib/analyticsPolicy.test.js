import assert from 'node:assert/strict'
import test from 'node:test'
import { isAnalyticsPageAllowed, sanitizeAnalyticsUrl } from './analyticsPolicy.js'

test('only public HTTPS production URLs are eligible for analytics', () => {
  for (const href of [
    'https://theklope.com/',
    'https://www.theklope.com/contact',
    'https://www.theklope.com/guides?section=admin',
  ]) assert.equal(isAnalyticsPageAllowed(href), true, href)

  for (const href of [
    undefined, '', '/contact', 'not a url',
    'http://www.theklope.com/',
    'http://localhost:5173/',
    'https://theklope.vercel.app/',
    'https://theklope-preview-gregorybaranes-projects.vercel.app/',
    'https://preview.theklope.com/',
    'https://www.theklope.com.example.com/',
    'https://www.theklope.com:5173/',
    'https://user:password@www.theklope.com/',
  ]) assert.equal(isAnalyticsPageAllowed(href), false, String(href))
})

test('administration and API URLs are excluded, including legacy and encoded paths', () => {
  for (const path of [
    '/admin', '/ADMIN?tab=orders', '/admin/orders',
    '/admin123legacy/index.php/sell/orders',
    '/%61dmin', '/%41DMIN', '/%2fadmin', '//admin',
    '/api', '/API/payment-status', '/%E0%A4%A',
  ]) assert.equal(isAnalyticsPageAllowed(`https://www.theklope.com${path}`), false, path)
})

test('analytics URLs drop query strings and fragments without mutating public paths', () => {
  assert.equal(
    sanitizeAnalyticsUrl('https://www.theklope.com/checkout/retour?order=private&token=secret#email'),
    'https://www.theklope.com/checkout/retour',
  )
  assert.equal(sanitizeAnalyticsUrl('https://www.theklope.com/admin?tab=orders'), null)
  assert.equal(sanitizeAnalyticsUrl('https://theklope.vercel.app/contact'), null)
})
