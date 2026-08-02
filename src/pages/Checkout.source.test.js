import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

test('checkout imports every icon component it renders', async () => {
  const source = await readFile(new URL('./Checkout.jsx', import.meta.url), 'utf8')
  const iconImport = source.match(
    /import\s*\{([^}]+)\}\s*from\s*['"]\.\.\/components\/icons\.jsx['"]/s,
  )

  assert.ok(iconImport, 'Checkout must import its icons from components/icons.jsx')

  const importedIcons = new Set(
    iconImport[1]
      .split(',')
      .map((name) => name.trim().split(/\s+as\s+/).at(-1))
      .filter(Boolean),
  )
  const renderedIcons = new Set(
    [...source.matchAll(/<(Icon[A-Z][A-Za-z0-9]*)\b/g)].map((match) => match[1]),
  )
  const missingImports = [...renderedIcons].filter((name) => !importedIcons.has(name))

  assert.deepEqual(missingImports, [])
})

test('checkout never preselects the adult-age certification', async () => {
  const source = await readFile(new URL('./Checkout.jsx', import.meta.url), 'utf8')

  assert.match(source, /const \[ageAccepted,\s*setAgeAccepted\] = useState\(false\)/)
  assert.doesNotMatch(source, /const \[ageAccepted,\s*setAgeAccepted\] = useState\(true\)/)
})
