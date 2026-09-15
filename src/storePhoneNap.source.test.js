import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

import { STORE_PHONE, buildLocalBusinessSchema } from './data/localBusiness.js'

const readSource = (relativePath) => readFile(new URL(relativePath, import.meta.url), 'utf8')

// Formes dérivées de la source unique, pour ne jamais coder un numéro en dur ici.
const international = STORE_PHONE                                  // +33491555555
const national = `0${STORE_PHONE.replace('+33', '')}`              // 0491555555
const spaced = national.replace(/(\d{2})(?=\d)/g, '$1 ').trim()    // 04 91 55 55 55

// Le numéro est recopié dans cinq surfaces client. Une divergence casse la
// cohérence NAP (nom, adresse, téléphone) dont dépend le référencement local —
// et la fiche Google, qui reçoit de vrais appels, deviendrait incohérente
// avec le site aux yeux de Google.
test('toutes les surfaces client affichent le même numéro que la source', async () => {
  const surfaces = {
    'components/Footer.jsx': await readSource('./components/Footer.jsx'),
    'pages/Contact.jsx': await readSource('./pages/Contact.jsx'),
    'components/CoachVape.jsx': await readSource('./components/CoachVape.jsx'),
    'pages/Legal.jsx': await readSource('./pages/Legal.jsx'),
  }

  for (const [name, source] of Object.entries(surfaces)) {
    assert.ok(
      source.includes(spaced) || source.includes(international),
      `${name} doit afficher le numéro de la boutique (${spaced})`,
    )
  }

  // Les liens d'appel doivent porter le format international, seul format
  // composable de façon fiable depuis un mobile étranger.
  for (const name of ['components/Footer.jsx', 'pages/Contact.jsx']) {
    assert.match(surfaces[name], new RegExp(`tel:\\${international}`), `${name} : lien tel: attendu`)
  }
})

test('le numéro est déclaré aux moteurs, en balisage comme en fichiers GEO', async () => {
  const schema = buildLocalBusinessSchema()
  assert.equal(schema.telephone, international, 'le schéma LocalBusiness doit porter le téléphone')

  const llms = await readSource('../public/llms.txt')
  assert.match(llms, /\*\*Téléphone\*\*/, 'llms.txt doit énoncer le téléphone comme fait citable')
})

test('un numéro vidé est omis partout plutôt qu’émis faux', () => {
  // Garantit que le repli reste « omettre » et jamais « inventer ».
  const source = String(buildLocalBusinessSchema.toString())
  assert.match(source, /if \(STORE\.telephone\)/, 'l’émission doit rester conditionnelle')
})
