import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const readSource = (relativePath) => readFile(new URL(relativePath, import.meta.url), 'utf8')

test('product page calls every React hook before its conditional exits', async () => {
  const source = await readSource('./pages/Product.jsx')
  const componentStart = source.indexOf('export default function Product()')
  const componentEnd = source.indexOf('\nfunction PrerenderContent')
  const component = source.slice(componentStart, componentEnd)
  const pageStateIndex = component.indexOf('const pageState =')

  assert.ok(componentStart >= 0 && componentEnd > componentStart, 'Product component must be found')
  assert.ok(pageStateIndex >= 0, 'Product page readiness guards must be found')
  assert.doesNotMatch(
    component.slice(pageStateIndex),
    /\buse[A-Z][A-Za-z0-9]*\s*\(/,
    'React hooks after a conditional page exit break the loading-to-ready render transition',
  )
})

test('cart drawer defines every restored-cart delivery value it renders', async () => {
  const source = await readSource('./components/CartDrawer.jsx')
  const renderIndex = source.indexOf('\n  return (')

  assert.match(source, /import BundleProgress from ['"]\.\/BundleProgress\.jsx['"]/)
  assert.ok(renderIndex >= 0, 'CartDrawer render must be found')
  for (const name of ['freeShippingThreshold', 'remainingForFreeShipping', 'freeShippingPct']) {
    const declarationIndex = source.indexOf(`const ${name} =`)
    assert.ok(declarationIndex >= 0, `${name} must be declared`)
    assert.ok(declarationIndex < renderIndex, `${name} must be declared before CartDrawer renders`)
  }
})

test('product page does not render an undeclared urgency countdown', async () => {
  const source = await readSource('./pages/Product.jsx')

  assert.doesNotMatch(source, /\bshippingCountdown\b/)
})
