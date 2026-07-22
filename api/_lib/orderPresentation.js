const present = (value) => value !== undefined && value !== null && String(value).trim() !== ''

export function formatOrderVariant(variant) {
  if (!variant || typeof variant !== 'object' || Array.isArray(variant)) return ''
  const parts = []
  if (present(variant.color)) parts.push(`Couleur : ${String(variant.color).trim()}`)
  if (present(variant.flavor)) parts.push(`Saveur : ${String(variant.flavor).trim()}`)
  if (present(variant.nicotine)) parts.push(`Nicotine : ${String(variant.nicotine).trim()} mg`)
  if (present(variant.ohm)) parts.push(`Résistance : ${String(variant.ohm).trim()} Ω`)
  return parts.join(' · ')
}

export function formatOrderItemLabel(item = {}) {
  const name = String(item.name || 'Produit').trim()
  const variant = formatOrderVariant(item.variant)
  return variant ? `${name} — ${variant}` : name
}
