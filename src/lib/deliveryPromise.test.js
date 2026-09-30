import assert from 'node:assert/strict'
import test from 'node:test'

import { deliveryPromise, parisClock } from './deliveryPromise.js'

// Octobre 2026 : heure d'été jusqu'au 25 (UTC+2), puis heure d'hiver (UTC+1).
const at = (iso) => deliveryPromise(new Date(iso))

test('l’heure de Paris fait foi, pas celle du serveur ou du navigateur', () => {
  assert.deepEqual(parisClock(new Date('2026-10-01T11:59:00Z')), { day: 4, minutes: 13 * 60 + 59 })
  assert.deepEqual(parisClock(new Date('2026-12-01T12:30:00Z')), { day: 2, minutes: 13 * 60 + 30 })
})

test('jeudi 10 h : coursier et expédition aujourd’hui, retrait en 1 h', () => {
  const p = at('2026-10-01T08:00:00Z')
  assert.equal(p.beforeCutoff, true)
  assert.equal(p.remaining, '4 h')
  assert.equal(p.courier.text, 'Livré aujourd’hui par coursier')
  assert.equal(p.shipping.text, 'Expédié aujourd’hui, reçu en 24–48 h')
  assert.equal(p.pickup.text, 'Prêt en 1 h au 188 rue de Rome')
})

test('jeudi 15 h : départ demain, retrait encore possible aujourd’hui', () => {
  const p = at('2026-10-01T13:00:00Z')
  assert.equal(p.beforeCutoff, false)
  assert.equal(p.courier.text, 'Livré demain par coursier')
  assert.equal(p.pickup.today, true)
})

test('vendredi 18 h 30 : retrait et expédition lundi', () => {
  const p = at('2026-10-02T16:30:00Z')
  assert.equal(p.shipping.text, 'Expédié lundi, reçu en 24–48 h')
  assert.equal(p.pickup.text, 'Prêt lundi dès 10 h au 188 rue de Rome')
})

test('samedi : rien ne part le week-end', () => {
  const p = at('2026-10-03T08:00:00Z')
  assert.equal(p.beforeCutoff, false)
  assert.equal(p.courier.text, 'Livré lundi par coursier')
})

test('lundi 8 h : retrait prêt dès 10 h', () => {
  assert.equal(at('2026-10-05T06:00:00Z').pickup.text, 'Prêt aujourd’hui dès 10 h au 188 rue de Rome')
})
