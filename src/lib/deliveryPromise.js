// Promesse de livraison affichée sur les fiches produits, calculée à l'heure de
// PARIS (et non à celle du navigateur du visiteur).
//
// Sources :
// - « Commandé avant 14 h, expédié le jour même » : engagement déjà affiché
//   sur les fiches et dans la FAQ (jours ouvrés) ;
// - coursier Marseille « le jour même » (SHIPPING_METHODS) : même heure limite.
// Les jours fériés ne sont pas gérés : la promesse est prudente mais pas
// infaillible ces jours-là.

export const SHIP_CUTOFF_HOUR = 14
const DAY_NAMES = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']

export function parisClock(now = new Date()) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Paris', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(now).map((part) => [part.type, part.value]))
  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(parts.weekday)
  return { day, minutes: Number(parts.hour) * 60 + Number(parts.minute) }
}

const isWorkingDay = (day) => day >= 1 && day <= 5

// Nom du prochain jour ouvré (« demain » si c'est le lendemain).
function nextDayLabel(fromDay, predicate) {
  for (let offset = 1; offset <= 7; offset += 1) {
    const day = (fromDay + offset) % 7
    if (predicate(day)) return offset === 1 ? 'demain' : DAY_NAMES[day]
  }
  return 'prochainement'
}

const formatDuration = (minutes) => {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m} min`
  return m ? `${h} h ${String(m).padStart(2, '0')}` : `${h} h`
}

export function deliveryPromise(now = new Date()) {
  const { day, minutes } = parisClock(now)
  const cutoff = SHIP_CUTOFF_HOUR * 60
  const beforeCutoff = isWorkingDay(day) && minutes < cutoff
  const nextShipDay = nextDayLabel(day, isWorkingDay)

  return {
    beforeCutoff,
    remaining: beforeCutoff ? formatDuration(cutoff - minutes) : '',
    courier: beforeCutoff
      ? { today: true, text: 'Livré aujourd’hui par coursier' }
      : { today: false, text: `Livré ${nextShipDay} par coursier` },
    shipping: beforeCutoff
      ? { today: true, text: 'Expédié aujourd’hui, reçu en 24–48 h' }
      : { today: false, text: `Expédié ${nextShipDay}, reçu en 24–48 h` },
  }
}
