import assert from 'node:assert/strict'
import test from 'node:test'
import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const API_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const MIGRATION = resolve(API_DIR, '../supabase/migrations/202607130002_add_api_rate_limits.sql')

// La fonction SQL consume_rate_limit valide son paramètre p_scope et LÈVE une
// exception s'il ne correspond pas. Un scope avec un tiret (« relay-points »)
// passait donc la revue de code, les tests et le build, puis échouait à chaque
// appel en production — recherche de Point Relais et dépôt d'avis cassés, sans
// message exploitable. Ce test lit la contrainte directement dans la migration
// pour qu'elle ne puisse pas diverger du code.
const readScopePattern = () => {
  const sql = readFileSync(MIGRATION, 'utf8')
  const match = /p_scope\s*!~\s*'\^([^']+)\$'/.exec(sql)
  assert.ok(match, 'contrainte de scope introuvable dans la migration')
  return new RegExp(`^${match[1]}$`)
}

const collectScopes = () => {
  const scopes = []
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name)
      if (entry.isDirectory()) { walk(path); continue }
      if (!entry.name.endsWith('.js') || entry.name.includes('.test.')) continue
      const source = readFileSync(path, 'utf8')
      for (const [, scope] of source.matchAll(/scope:\s*'([^']+)'/g)) {
        scopes.push({ scope, file: entry.name })
      }
    }
  }
  walk(API_DIR)
  return scopes
}

test('tous les scopes de limitation de débit respectent la contrainte SQL', () => {
  const pattern = readScopePattern()
  const scopes = collectScopes()

  assert.ok(scopes.length > 0, 'aucun scope trouvé : le test ne vérifie plus rien')

  const invalid = scopes.filter(({ scope }) => !pattern.test(scope))
  assert.deepEqual(
    invalid,
    [],
    `scopes refusés par consume_rate_limit (${pattern}) : `
    + invalid.map(({ scope, file }) => `« ${scope} » dans ${file}`).join(', '),
  )
})

test('la contrainte SQL rejette bien un tiret — le test protège de la vraie erreur', () => {
  const pattern = readScopePattern()
  assert.equal(pattern.test('relay_points'), true)
  assert.equal(pattern.test('relay-points'), false)
})
