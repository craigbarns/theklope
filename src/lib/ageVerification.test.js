import assert from 'node:assert/strict'
import test from 'node:test'

import { verifyAdultBirthDate } from './ageVerification.js'

const today = new Date(2026, 6, 13)

test('rejects impossible and future birth dates', () => {
  assert.deepEqual(verifyAdultBirthDate({ day: 31, month: 2, year: 2000 }, today), { valid: false, adult: false })
  assert.deepEqual(verifyAdultBirthDate({ day: 14, month: 7, year: 2026 }, today), { valid: false, adult: false })
})

test('checks the eighteenth birthday exactly', () => {
  assert.deepEqual(verifyAdultBirthDate({ day: 13, month: 7, year: 2008 }, today), { valid: true, adult: true })
  assert.deepEqual(verifyAdultBirthDate({ day: 14, month: 7, year: 2008 }, today), { valid: true, adult: false })
})
