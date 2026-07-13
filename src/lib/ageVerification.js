export function verifyAdultBirthDate({ day, month, year }, today = new Date()) {
  const d = Number(day)
  const m = Number(month)
  const y = Number(year)

  if (![d, m, y].every(Number.isInteger)) return { valid: false, adult: false }
  if (y < 1900 || y > today.getFullYear() || m < 1 || m > 12 || d < 1 || d > 31) {
    return { valid: false, adult: false }
  }

  const birthDate = new Date(y, m - 1, d)
  const isExactDate = (
    birthDate.getFullYear() === y &&
    birthDate.getMonth() === m - 1 &&
    birthDate.getDate() === d
  )
  if (!isExactDate || birthDate > today) return { valid: false, adult: false }

  let age = today.getFullYear() - y
  if (today.getMonth() < m - 1 || (today.getMonth() === m - 1 && today.getDate() < d)) {
    age -= 1
  }
  return { valid: true, adult: age >= 18 }
}
