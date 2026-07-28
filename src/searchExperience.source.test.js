import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const readSource = (relativePath) => readFile(new URL(relativePath, import.meta.url), 'utf8')

test('search waits for a complete remote or fallback catalog, not the partial SEO bootstrap', async () => {
  const store = await readSource('./context/StoreContext.jsx')
  const overlay = await readSource('./components/SearchOverlay.jsx')
  const shop = await readSource('./pages/Shop.jsx')

  assert.match(store, /const \[catalogSearchReady, setCatalogSearchReady\] = useState\(false\)/)
  assert.match(store, /setProducts\(catalog\.map\(normalizeProduct\)\)\s+setCatalogSearchReady\(true\)/)
  assert.match(store, /setSyncStatus\('online'\)\s+setCatalogReady\(true\)\s+setCatalogSearchReady\(true\)/)
  assert.match(overlay, /const catalogLoading = !catalogSearchReady/)
  assert.doesNotMatch(overlay, /catalogLoading\s*=\s*!catalogReady\s*&&\s*products\.length/)
  assert.match(shop, /const searchLoading = hasSearch && !catalogSearchReady/)
  assert.match(shop, /\{searchLoading \? \(/)
  assert.match(shop, /if \(searchLoading \|\| visibleProducts\.length === 0\) return/)
})
