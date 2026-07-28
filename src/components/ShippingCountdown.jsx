import { useState, useEffect } from 'react'
import { IconTruck, IconBolt } from './icons.jsx'

export default function ShippingCountdown({ className = '' }) {
  const [timeLeft, setTimeLeft] = useState(null)

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date()
      const day = now.getDay()
      const isWeekend = day === 0 || day === 6
      const hours = now.getHours()

      if (hours < 14 && !isWeekend) {
        const target = new Date(now)
        target.setHours(14, 0, 0, 0)
        const diffMs = target.getTime() - now.getTime()
        if (diffMs > 0) {
          const h = Math.floor(diffMs / (1000 * 60 * 60))
          const m = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
          const s = Math.floor((diffMs % (1000 * 60)) / 1000)
          return { h, m, s, isToday: true }
        }
      }
      return { isToday: false }
    }

    setTimeLeft(calculateTimeLeft())
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  if (!timeLeft) return null

  if (timeLeft.isToday) {
    const pad = (n) => String(n).padStart(2, '0')
    return (
      <div className={`flex items-center gap-2.5 rounded-2xl border border-neon/30 bg-neon/10 px-4 py-3 text-xs text-neon font-medium ${className}`}>
        <IconBolt width={18} height={18} className="shrink-0 animate-pulse text-neon" />
        <div>
          <span className="font-bold block">Expédition aujourd'hui !</span>
          <span className="text-[11px] text-ash/90">
            Commandez dans les <span className="font-mono font-bold text-white">{timeLeft.h}h {pad(timeLeft.m)}m {pad(timeLeft.s)}s</span>
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2.5 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs text-muted ${className}`}>
      <IconTruck width={16} height={16} className="shrink-0 text-neon" />
      <span>Expédition garantie sous 24/48h depuis Marseille</span>
    </div>
  )
}
