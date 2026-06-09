// Jeu d'icônes minimalistes (stroke), sans dépendance externe.
const base = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export const IconSearch = (p) => (
  <svg {...base} {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" /></svg>
)
export const IconCart = (p) => (
  <svg {...base} {...p}><path d="M3 4h2l2.4 12.4a1 1 0 0 0 1 .8h8.5a1 1 0 0 0 1-.8L21 8H6" /><circle cx="9.5" cy="20" r="1.3" /><circle cx="17.5" cy="20" r="1.3" /></svg>
)
export const IconHeart = ({ filled, ...p } = {}) => (
  <svg {...base} fill={filled ? 'currentColor' : 'none'} {...p}><path d="M12 20s-7-4.6-9.3-9C1.2 8 2.8 4.7 6 4.7c2 0 3.2 1.2 4 2.4.8-1.2 2-2.4 4-2.4 3.2 0 4.8 3.3 3.3 6.3C19 15.4 12 20 12 20Z" /></svg>
)
export const IconUser = (p) => (
  <svg {...base} {...p}><circle cx="12" cy="8" r="4" /><path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6" /></svg>
)
export const IconMenu = (p) => (
  <svg {...base} {...p}><path d="M4 7h16M4 12h16M4 17h16" /></svg>
)
export const IconClose = (p) => (
  <svg {...base} {...p}><path d="M6 6l12 12M18 6 6 18" /></svg>
)
export const IconStar = ({ filled, ...p } = {}) => (
  <svg {...base} fill={filled ? 'currentColor' : 'none'} {...p}><path d="m12 3 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9 6.8 19.2l1-5.8L3.5 9.3l5.9-.9L12 3Z" /></svg>
)
export const IconTruck = (p) => (
  <svg {...base} {...p}><path d="M3 6h11v9H3zM14 9h4l3 3v3h-7z" /><circle cx="7" cy="18" r="1.6" /><circle cx="17" cy="18" r="1.6" /></svg>
)
export const IconShield = (p) => (
  <svg {...base} {...p}><path d="M12 3 5 6v5c0 4.4 3 8 7 10 4-2 7-5.6 7-10V6l-7-3Z" /><path d="m9 12 2 2 4-4" /></svg>
)
export const IconCheck = (p) => (
  <svg {...base} {...p}><path d="M4 12.5 9 17.5 20 6.5" /></svg>
)
export const IconHeadset = (p) => (
  <svg {...base} {...p}><path d="M4 13v-1a8 8 0 0 1 16 0v1" /><path d="M4 14a2 2 0 0 1 2-2h1v5H6a2 2 0 0 1-2-2v-1ZM20 14a2 2 0 0 0-2-2h-1v5h1a2 2 0 0 0 2-2v-1Z" /><path d="M20 17v1a3 3 0 0 1-3 3h-3" /></svg>
)
export const IconBolt = (p) => (
  <svg {...base} {...p}><path d="M13 3 4 14h6l-1 7 9-11h-6l1-7Z" /></svg>
)
export const IconChevron = (p) => (
  <svg {...base} {...p}><path d="m9 6 6 6-6 6" /></svg>
)
export const IconChevronDown = (p) => (
  <svg {...base} {...p}><path d="m6 9 6 6 6-6" /></svg>
)
export const IconFilter = (p) => (
  <svg {...base} {...p}><path d="M4 6h16M7 12h10M10 18h4" /></svg>
)
export const IconArrowRight = (p) => (
  <svg {...base} {...p}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
)
export const IconLeaf = (p) => (
  <svg {...base} {...p}><path d="M5 19c0-8 6-13 14-13 0 8-5 14-13 14a8 8 0 0 1-1-1Z" /><path d="M5 19c3-4 6-6 9-7" /></svg>
)
export const IconLock = (p) => (
  <svg {...base} {...p}><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
)
export const IconMail = (p) => (
  <svg {...base} {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
)
export const IconPhone = (p) => (
  <svg {...base} {...p}><path d="M5 4h4l2 5-3 2a12 12 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" /></svg>
)
export const IconPin = (p) => (
  <svg {...base} {...p}><path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" /><circle cx="12" cy="10" r="2.5" /></svg>
)
export const IconMinus = (p) => (
  <svg {...base} {...p}><path d="M5 12h14" /></svg>
)
export const IconPlus = (p) => (
  <svg {...base} {...p}><path d="M12 5v14M5 12h14" /></svg>
)
export const IconTrash = (p) => (
  <svg {...base} {...p}><path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" /></svg>
)
