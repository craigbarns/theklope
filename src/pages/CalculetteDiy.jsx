import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import Seo from '../components/Seo.jsx'
import Breadcrumbs from '../components/Breadcrumbs.jsx'

export default function CalculetteDiy() {
  const [activeTab, setActiveTab] = useState('booster') // booster or diy

  // Mode 1: Booster (Shake & Vape)
  const [eliquidVolume, setEliquidVolume] = useState(50) // initial volume (ml)
  const [desiredNicotineBooster, setDesiredNicotineBooster] = useState(3) // target mg/ml

  // Mode 2: DIY Complet
  const [targetVolumeDiy, setTargetVolumeDiy] = useState(100) // total volume (ml)
  const [targetNicotineDiy, setTargetNicotineDiy] = useState(6) // mg/ml
  const [aromaPercentage, setAromaPercentage] = useState(15) // % arôme

  // Calculs Booster (Shake & Vape)
  const boosterResults = useMemo(() => {
    // V_booster = (N_target * V_eliquid) / (20 - N_target)
    if (desiredNicotineBooster >= 20) return { boosterVolume: 0, finalVolume: eliquidVolume, boosterCount: 0 }
    
    const boosterVolume = (desiredNicotineBooster * eliquidVolume) / (20 - desiredNicotineBooster)
    const finalVolume = eliquidVolume + boosterVolume
    const boosterCount = (boosterVolume / 10).toFixed(1)

    return {
      boosterVolume: Number(boosterVolume.toFixed(1)),
      finalVolume: Number(finalVolume.toFixed(1)),
      boosterCount: Number(boosterCount),
    }
  }, [eliquidVolume, desiredNicotineBooster])

  // Calculs DIY Complet
  const diyResults = useMemo(() => {
    // V_aroma = Volume * % / 100
    // V_booster = Volume * N_target / 20
    // V_base = Volume - V_aroma - V_booster
    const aromaVolume = targetVolumeDiy * (aromaPercentage / 100)
    const boosterVolume = (targetVolumeDiy * targetNicotineDiy) / 20
    const baseVolume = Math.max(0, targetVolumeDiy - aromaVolume - boosterVolume)

    // Pourcentages visuels
    const totalParts = aromaVolume + boosterVolume + baseVolume
    const aromaPercent = totalParts > 0 ? (aromaVolume / totalParts) * 100 : 0
    const boosterPercent = totalParts > 0 ? (boosterVolume / totalParts) * 100 : 0
    const basePercent = totalParts > 0 ? (baseVolume / totalParts) * 100 : 0

    return {
      aromaVolume: Number(aromaVolume.toFixed(1)),
      boosterVolume: Number(boosterVolume.toFixed(1)),
      baseVolume: Number(baseVolume.toFixed(1)),
      aromaPercent,
      boosterPercent,
      basePercent,
      error: boosterVolume + aromaVolume > targetVolumeDiy ? "Le volume de booster + arôme dépasse le volume total désiré." : null
    }
  }, [targetVolumeDiy, targetNicotineDiy, aromaPercentage])

  return (
    <div className="container-page py-8">
      <Seo
        title="Calculette DIY & booster de nicotine | THEKLOPE"
        description="Calculez les proportions idéales de base, boosters et arômes pour vos e-liquides."
      />
      <Breadcrumbs items={[{ label: 'Boutique', to: '/boutique' }, { label: 'Calculette DIY' }]} />

      {/* Titre héro */}
      <div className="relative overflow-hidden rounded-3xl border border-white/8 bg-gradient-to-r from-carbon/40 to-noir/80 px-6 py-12 text-center shadow-card sm:px-12 mt-4">
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-electric/5 blur-[80px]" />
        <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-neon/5 blur-[80px]" />
        <span className="eyebrow">Outils & Conseils</span>
        <h1 className="font-display text-3xl font-extrabold text-white sm:text-4xl mt-2">
          Calculateur de DIY & Nicotine
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted">
          Préparez vos mélanges comme un professionnel. Ajustez les curseurs et découvrez instantanément votre recette.
        </p>
      </div>

      {/* Onglets */}
      <div className="flex justify-center mt-10">
        <div className="flex rounded-full border border-white/10 bg-anthracite/60 p-1">
          <button
            onClick={() => setActiveTab('booster')}
            className={`rounded-full px-5 py-2 text-xs font-semibold transition ${
              activeTab === 'booster' ? 'bg-neon text-noir shadow-glow' : 'text-ash/70 hover:text-white'
            }`}
          >
            Booster mon E-liquide (Shake & Vape)
          </button>
          <button
            onClick={() => setActiveTab('diy')}
            className={`rounded-full px-5 py-2 text-xs font-semibold transition ${
              activeTab === 'diy' ? 'bg-neon text-noir shadow-glow' : 'text-ash/70 hover:text-white'
            }`}
          >
            Créer mon DIY Complet
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Panneau gauche : Réglages */}
        <div className="card p-6 md:p-8">
          {activeTab === 'booster' ? (
            /* MODE BOOSTER (SHAKE & VAPE) */
            <div className="space-y-6">
              <h2 className="font-display text-lg font-bold text-white mb-2">Booster un E-liquide sans nicotine</h2>
              <p className="text-xs text-muted leading-relaxed">
                Ce calculateur vous aide à ajouter des boosters de nicotine de 10 ml (à 20 mg/ml) dans un e-liquide grand format (0 mg/ml) pour atteindre votre taux cible.
              </p>

              {/* Slider Volume Liquide */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted font-medium">Volume de e-liquide initial (sans nicotine)</span>
                  <span className="font-bold text-white">{eliquidVolume} ml</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="200"
                  step="10"
                  value={eliquidVolume}
                  onChange={(e) => setEliquidVolume(Number(e.target.value))}
                  className="w-full accent-neon cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-faint">
                  <span>10 ml</span>
                  <span>50 ml</span>
                  <span>100 ml</span>
                  <span>200 ml</span>
                </div>
              </div>

              {/* Slider Nicotine souhaitée */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted font-medium">Taux de nicotine souhaité</span>
                  <span className="font-bold text-neon">{desiredNicotineBooster} mg/ml</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="12"
                  step="1"
                  value={desiredNicotineBooster}
                  onChange={(e) => setDesiredNicotineBooster(Number(e.target.value))}
                  className="w-full accent-neon cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-faint">
                  <span>0 mg</span>
                  <span>3 mg</span>
                  <span>6 mg</span>
                  <span>9 mg</span>
                  <span>12 mg</span>
                </div>
              </div>

              {/* Boutons de raccourcis */}
              <div className="pt-2 border-t border-white/5">
                <span className="text-[10px] text-muted font-semibold uppercase tracking-wider block mb-2">Taux standards :</span>
                <div className="flex flex-wrap gap-2">
                  {[3, 6, 9, 12].map((n) => (
                    <button
                      key={n}
                      onClick={() => setDesiredNicotineBooster(n)}
                      className={`text-xs px-3 py-1.5 rounded-xl border transition ${
                        desiredNicotineBooster === n
                          ? 'border-neon bg-neon/10 text-neon font-bold'
                          : 'border-white/10 hover:border-white/20 text-ash'
                      }`}
                    >
                      {n} mg/ml
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* MODE DIY COMPLET */
            <div className="space-y-6">
              <h2 className="font-display text-lg font-bold text-white mb-2">Recette de DIY (Do It Yourself)</h2>
              <p className="text-xs text-muted leading-relaxed">
                Calculez précisément les proportions d'arôme concentré, de base neutre et de boosters de nicotine pour réaliser votre propre liquide.
              </p>

              {/* Slider Volume Total */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted font-medium">Volume total d'e-liquide à fabriquer</span>
                  <span className="font-bold text-white">{targetVolumeDiy} ml</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="500"
                  step="10"
                  value={targetVolumeDiy}
                  onChange={(e) => setTargetVolumeDiy(Number(e.target.value))}
                  className="w-full accent-neon cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-faint">
                  <span>10 ml</span>
                  <span>100 ml</span>
                  <span>250 ml</span>
                  <span>500 ml</span>
                </div>
              </div>

              {/* Slider Taux Nicotine */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted font-medium">Taux de nicotine final désiré</span>
                  <span className="font-bold text-neon">{targetNicotineDiy} mg/ml</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="18"
                  step="1"
                  value={targetNicotineDiy}
                  onChange={(e) => setTargetNicotineDiy(Number(e.target.value))}
                  className="w-full accent-neon cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-faint">
                  <span>0 mg (sans nicotine)</span>
                  <span>6 mg</span>
                  <span>12 mg</span>
                  <span>18 mg</span>
                </div>
              </div>

              {/* Slider Dosage Arôme */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted font-medium">Dosage conseillé de l'arôme concentré</span>
                  <span className="font-bold text-white">{aromaPercentage} %</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="25"
                  step="1"
                  value={aromaPercentage}
                  onChange={(e) => setAromaPercentage(Number(e.target.value))}
                  className="w-full accent-neon cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-faint">
                  <span>5% (léger)</span>
                  <span>15% (standard)</span>
                  <span>25% (intense)</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Panneau droit : Résultats & Visualisation */}
        <aside className="space-y-6">
          {/* Fiole visuelle */}
          <div className="card p-6 flex flex-col items-center">
            <h3 className="font-display text-sm font-bold text-white mb-6 text-center w-full border-b border-white/8 pb-3">Proportions du mélange</h3>

            {/* Container Fiole */}
            <div className="relative w-24 h-48 border-[3px] border-white/25 rounded-b-2xl rounded-t-lg bg-carbon/20 flex flex-col-reverse overflow-hidden shadow-[inset_0_0_15px_rgba(255,255,255,0.05)]">
              {/* Bouchon fictif */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-3 bg-white/20 rounded-t border-t border-x border-white/30" />

              {/* Rendu des couches de liquide */}
              {activeTab === 'booster' ? (
                <>
                  {/* Nicotine Booster Layer (Green) */}
                  <div
                    className="bg-neon/60 border-t border-neon shadow-[0_0_10px_#35FF8A] transition-all duration-500"
                    style={{
                      height: `${(boosterResults.boosterVolume / boosterResults.finalVolume) * 100}%`,
                    }}
                  />
                  {/* E-liquid Base Layer (Blue) */}
                  <div
                    className="bg-electric/50 border-t border-electric transition-all duration-500"
                    style={{
                      height: `${(eliquidVolume / boosterResults.finalVolume) * 100}%`,
                    }}
                  />
                </>
              ) : (
                <>
                  {/* Aroma Layer (Orange) */}
                  <div
                    className="bg-orange-500/60 border-t border-orange-400 transition-all duration-500"
                    style={{ height: `${diyResults.aromaPercent}%` }}
                  />
                  {/* Nicotine Booster Layer (Green) */}
                  <div
                    className="bg-neon/60 border-t border-neon shadow-[0_0_10px_#35FF8A] transition-all duration-500"
                    style={{ height: `${diyResults.boosterPercent}%` }}
                  />
                  {/* Neutral Base Layer (Blue) */}
                  <div
                    className="bg-electric/40 border-t border-electric/60 transition-all duration-500"
                    style={{ height: `${diyResults.basePercent}%` }}
                  />
                </>
              )}
            </div>

            {/* Légende interactive / Résultats en chiffres */}
            <div className="w-full mt-6 space-y-4">
              {activeTab === 'booster' ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-muted">
                      <span className="h-2 w-2 rounded-full bg-electric" /> E-liquide standard
                    </span>
                    <span className="font-bold text-white">{eliquidVolume} ml</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-muted">
                      <span className="h-2 w-2 rounded-full bg-neon shadow-[0_0_5px_#35FF8A]" /> Booster Nicotine (20mg)
                    </span>
                    <span className="font-bold text-neon">
                      {boosterResults.boosterVolume} ml ({boosterResults.boosterCount} flacon{boosterResults.boosterCount >= 2 ? 's' : ''})
                    </span>
                  </div>
                  <dl className="pt-3 border-t border-white/8 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <dt className="text-muted">Volume final obtenu</dt>
                      <dd className="font-semibold text-white">{boosterResults.finalVolume} ml</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted">Taux réel de nicotine</dt>
                      <dd className="font-bold text-neon">{desiredNicotineBooster} mg/ml</dd>
                    </div>
                  </dl>
                </div>
              ) : (
                <div className="space-y-3">
                  {diyResults.error ? (
                    <div className="text-center text-xs text-rose-300 font-semibold p-2 border border-rose-500/20 bg-rose-500/5 rounded-xl">
                      {diyResults.error}
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 text-muted">
                          <span className="h-2 w-2 rounded-full bg-electric/60" /> Base neutre (PG/VG)
                        </span>
                        <span className="font-bold text-white">{diyResults.baseVolume} ml</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 text-muted">
                          <span className="h-2 w-2 rounded-full bg-neon shadow-[0_0_5px_#35FF8A]" /> Boosters Nicotine (20mg)
                        </span>
                        <span className="font-bold text-neon">{diyResults.boosterVolume} ml</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 text-muted">
                          <span className="h-2 w-2 rounded-full bg-orange-500" /> Arôme concentré
                        </span>
                        <span className="font-bold text-orange-400">{diyResults.aromaVolume} ml</span>
                      </div>
                      <dl className="pt-3 border-t border-white/8 space-y-2 text-xs">
                        <div className="flex justify-between">
                          <dt className="text-muted">Volume total cible</dt>
                          <dd className="font-bold text-white">{targetVolumeDiy} ml</dd>
                        </div>
                      </dl>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Call to action d'achat */}
          <div className="card p-5 border-white/8 bg-white/[0.01]">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Acheter mes composants</h4>
            <p className="text-[11px] text-muted mb-4 leading-relaxed">
              Retrouvez nos e-liquides de qualité ainsi que nos accessoires et packs de résistances directement dans notre boutique.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Link to="/categorie/e-liquides" className="btn-ghost py-2 px-3 text-center text-[10px] min-h-0">
                Nos E-liquides
              </Link>
              <Link to="/categorie/accessoires" className="btn-primary py-2 px-3 text-center text-[10px] min-h-0 text-noir">
                Nos Accessoires
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
