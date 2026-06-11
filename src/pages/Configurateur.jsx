import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore, formatPrice } from '../context/StoreContext.jsx'
import Seo from '../components/Seo.jsx'
import Breadcrumbs from '../components/Breadcrumbs.jsx'
import { IconCheck } from '../components/icons.jsx'

export default function Configurateur() {
  const { products, addToCart, applyPromo } = useStore()
  const navigate = useNavigate()

  const [step, setStep] = useState(1) // 1: Box, 2: Clearomiseur, 3: E-liquide, 4: Recap
  const [selectedBox, setSelectedBox] = useState(null)
  const [selectedBoxColor, setSelectedBoxColor] = useState('')
  const [selectedClearomizer, setSelectedClearomizer] = useState(null)
  const [selectedEliquid, setSelectedEliquid] = useState(null)
  const [selectedNicotine, setSelectedNicotine] = useState(null) // in mg/ml
  const [searchQuery, setSearchQuery] = useState('')

  // 1. Filtrer les boxs
  const boxes = useMemo(() => {
    return products.filter(
      (p) => p.category === 'ecig' || p.category === 'pod'
    )
  }, [products])

  // 2. Filtrer les clearomiseurs (tous les accessoires qui ressemblent à un clearomiseur ou réservoir)
  const clearomizers = useMemo(() => {
    return products.filter(
      (p) =>
        p.category === 'accessoire' &&
        (p.name.toLowerCase().includes('nautilus') ||
          p.name.toLowerCase().includes('ce5') ||
          p.name.toLowerCase().includes('apex') ||
          p.name.toLowerCase().includes('tpp') ||
          p.name.toLowerCase().includes('luxe') ||
          p.name.toLowerCase().includes('cartouche') ||
          p.name.toLowerCase().includes('pod'))
    )
  }, [products])

  // 3. Filtrer les e-liquides
  const eliquids = useMemo(() => {
    return products.filter((p) => p.category === 'eliquide')
  }, [products])

  // Filtrage par recherche
  const currentStepList = useMemo(() => {
    let list = []
    if (step === 1) list = boxes
    else if (step === 2) list = clearomizers
    else if (step === 3) list = eliquids

    if (!searchQuery.trim()) return list
    const q = searchQuery.toLowerCase()
    return list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.short.toLowerCase().includes(q)
    )
  }, [step, boxes, clearomizers, eliquids, searchQuery])

  // Prix et totaux
  const boxPrice = selectedBox?.price || 0
  const clearomizerPrice = selectedClearomizer?.price || 0
  const eliquidPrice = selectedEliquid?.price || 0
  const subtotal = Math.round((boxPrice + clearomizerPrice + eliquidPrice) * 100) / 100
  const discount = Math.round((subtotal * 0.15) * 100) / 100
  const finalPrice = Math.round((subtotal - discount) * 100) / 100

  const handleSelectBox = (box) => {
    setSelectedBox(box)
    setSelectedBoxColor(box.colors?.[0] || '')
    setSearchQuery('')
    setStep(2)
  }

  const handleSelectClearomizer = (clearomizer) => {
    setSelectedClearomizer(clearomizer)
    setSearchQuery('')
    setStep(3)
  }

  const handleSelectEliquid = (eliquid) => {
    setSelectedEliquid(eliquid)
    setSelectedNicotine(eliquid.nicotine?.[0] ?? 0)
    setSearchQuery('')
    setStep(4)
  }

  const handleAddToCart = () => {
    if (!selectedBox || !selectedClearomizer || !selectedEliquid) return

    // Ajouter les trois produits au panier
    addToCart(selectedBox.id, 1, selectedBoxColor ? { Couleur: selectedBoxColor } : {})
    addToCart(selectedClearomizer.id, 1)
    addToCart(selectedEliquid.id, 1, { Nicotine: `${selectedNicotine} mg/ml` })

    // Appliquer la promotion -15% automatiquement
    applyPromo('PACK15')

    // Rediriger ou notifier
    navigate('/panier')
  }

  return (
    <div className="container-page py-8">
      <Seo
        title="Configurateur de Pack Cigarette Électronique"
        description="Créez votre cigarette électronique idéale et bénéficiez de -15% sur le pack complet."
      />
      <Breadcrumbs items={[{ label: 'Boutique', to: '/boutique' }, { label: 'Configurateur' }]} />

      {/* Titre héro */}
      <div className="relative overflow-hidden rounded-3xl border border-white/8 bg-gradient-to-r from-carbon/40 to-noir/80 px-6 py-12 text-center shadow-card sm:px-12 mt-4">
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-neon/5 blur-[80px]" />
        <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-blue-500/5 blur-[80px]" />
        <span className="eyebrow">Pack sur mesure</span>
        <h1 className="font-display text-3xl font-extrabold text-white sm:text-4xl mt-2">
          Configurez votre Vape idéale
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted">
          Choisissez votre batterie, votre réservoir et votre e-liquide. Obtenez instantanément une remise de <strong className="text-neon">-15%</strong> sur l'ensemble !
        </p>
      </div>

      {/* Stepper */}
      <div className="mx-auto max-w-3xl mt-10 mb-8 flex items-center gap-2">
        {[
          { num: 1, label: 'La Box', desc: selectedBox ? selectedBox.name : 'Choisir' },
          { num: 2, label: 'Le Réservoir', desc: selectedClearomizer ? selectedClearomizer.name : 'Choisir' },
          { num: 3, label: 'Le Liquide', desc: selectedEliquid ? selectedEliquid.name : 'Choisir' },
          { num: 4, label: 'Recap', desc: 'Commander' },
        ].map((s) => (
          <div key={s.num} className="flex flex-1 flex-col items-center">
            <button
              onClick={() => {
                if (s.num < step || (s.num === 2 && selectedBox) || (s.num === 3 && selectedClearomizer)) {
                  setStep(s.num)
                }
              }}
              disabled={s.num > step && !(s.num === 2 && selectedBox) && !(s.num === 3 && selectedClearomizer)}
              className="flex items-center gap-2 w-full focus-ring"
            >
              <span
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold transition ${
                  step > s.num
                    ? 'bg-neon text-noir'
                    : step === s.num
                    ? 'border-2 border-neon text-neon shadow-[0_0_8px_rgba(53,255,138,0.2)]'
                    : 'border border-white/10 text-muted'
                }`}
              >
                {step > s.num ? <IconCheck width={14} height={14} /> : s.num}
              </span>
              <div className="hidden text-left sm:block">
                <p className={`text-xs font-semibold leading-none ${step === s.num ? 'text-white' : 'text-faint'}`}>
                  {s.label}
                </p>
                <p className="text-[10px] text-muted truncate max-w-[120px] mt-0.5">{s.desc}</p>
              </div>
              {s.num < 4 && <span className="h-px flex-1 bg-white/10 hidden sm:block ml-2" />}
            </button>
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        {/* Panneau de sélection */}
        <div>
          {step < 4 ? (
            <>
              {/* Barre de recherche */}
              <div className="mb-6 flex items-center gap-3">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Rechercher un ${
                    step === 1 ? 'matériel/box' : step === 2 ? 'clearomiseur/réservoir' : 'e-liquide'
                  }...`}
                  className="input flex-1 bg-white/[0.03]"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="btn-ghost py-2.5 px-4 min-h-0 text-xs">
                    Effacer
                  </button>
                )}
              </div>

              {/* Grille de produits */}
              {currentStepList.length === 0 ? (
                <div className="card p-10 text-center text-muted text-sm">
                  Aucun produit ne correspond à votre recherche dans cette catégorie.
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {currentStepList.map((p) => {
                    const isSelected =
                      (step === 1 && selectedBox?.id === p.id) ||
                      (step === 2 && selectedClearomizer?.id === p.id) ||
                      (step === 3 && selectedEliquid?.id === p.id)

                    return (
                      <div
                        key={p.id}
                        onClick={() => {
                          if (step === 1) handleSelectBox(p)
                          else if (step === 2) handleSelectClearomizer(p)
                          else if (step === 3) handleSelectEliquid(p)
                        }}
                        className={`group cursor-pointer rounded-2xl border p-4 transition-all duration-300 ${
                          isSelected
                            ? 'border-neon bg-neon/[0.03] shadow-[0_0_15px_rgba(53,255,138,0.08)]'
                            : 'border-white/10 bg-anthracite/40 hover:border-white/20 hover:bg-anthracite/60'
                        }`}
                      >
                        <div className="relative aspect-square overflow-hidden rounded-xl bg-carbon/50 p-2">
                          <img
                            src={p.image}
                            alt=""
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          />
                        </div>
                        <h3 className="mt-3 font-display text-sm font-bold text-white group-hover:text-neon transition">
                          {p.name}
                        </h3>
                        <p className="text-[11px] text-faint uppercase tracking-wider font-semibold mt-0.5">
                          {p.brand}
                        </p>
                        <p className="mt-1.5 text-xs text-muted line-clamp-2 leading-relaxed">
                          {p.short}
                        </p>
                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-sm font-bold text-white">{formatPrice(p.price)}</span>
                          <span
                            className={`text-xs font-semibold transition px-3 py-1.5 rounded-full ${
                              isSelected
                                ? 'bg-neon text-noir font-bold'
                                : 'bg-white/5 border border-white/8 text-ash group-hover:border-neon/30 group-hover:text-neon'
                            }`}
                          >
                            {isSelected ? 'Sélectionné' : 'Choisir'}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          ) : (
            /* Étape 4 : Récapitulatif */
            <div className="space-y-6">
              <div className="card p-6 border-neon/20 bg-neon/[0.01]">
                <h2 className="font-display text-lg font-bold text-white border-b border-white/8 pb-3">
                  Votre configuration sur mesure
                </h2>

                <div className="mt-4 space-y-4">
                  {/* Box */}
                  <div className="flex items-center gap-4 rounded-xl bg-white/[0.02] border border-white/5 p-4">
                    <img src={selectedBox.image} alt="" className="h-16 w-16 object-cover bg-carbon rounded-lg p-1" />
                    <div className="flex-1">
                      <p className="text-xs text-neon uppercase font-semibold">Étape 1 · Box/Batterie</p>
                      <h3 className="text-sm font-bold text-white mt-0.5">{selectedBox.name}</h3>
                      <p className="text-xs text-faint">{selectedBox.brand}</p>
                      {selectedBox.colors?.length > 0 && (
                        <div className="mt-2 flex items-center gap-1.5">
                          <span className="text-[10px] text-muted">Couleur :</span>
                          <select
                            value={selectedBoxColor}
                            onChange={(e) => setSelectedBoxColor(e.target.value)}
                            className="bg-carbon border border-white/10 text-xs text-white rounded px-2 py-0.5 outline-none focus:border-neon"
                          >
                            {selectedBox.colors.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-white">{formatPrice(selectedBox.price)}</span>
                  </div>

                  {/* Clearomizer */}
                  <div className="flex items-center gap-4 rounded-xl bg-white/[0.02] border border-white/5 p-4">
                    <img
                      src={selectedClearomizer.image}
                      alt=""
                      className="h-16 w-16 object-cover bg-carbon rounded-lg p-1"
                    />
                    <div className="flex-1">
                      <p className="text-xs text-neon uppercase font-semibold">Étape 2 · Réservoir</p>
                      <h3 className="text-sm font-bold text-white mt-0.5">{selectedClearomizer.name}</h3>
                      <p className="text-xs text-faint">{selectedClearomizer.brand}</p>
                    </div>
                    <span className="text-sm font-semibold text-white">{formatPrice(selectedClearomizer.price)}</span>
                  </div>

                  {/* Eliquid */}
                  <div className="flex items-center gap-4 rounded-xl bg-white/[0.02] border border-white/5 p-4">
                    <img src={selectedEliquid.image} alt="" className="h-16 w-16 object-cover bg-carbon rounded-lg p-1" />
                    <div className="flex-1">
                      <p className="text-xs text-neon uppercase font-semibold">Étape 3 · E-liquide</p>
                      <h3 className="text-sm font-bold text-white mt-0.5">{selectedEliquid.name}</h3>
                      <p className="text-xs text-faint">{selectedEliquid.brand}</p>
                      {selectedEliquid.nicotine?.length > 0 && (
                        <div className="mt-2 flex items-center gap-1.5">
                          <span className="text-[10px] text-muted">Nicotine :</span>
                          <div className="flex flex-wrap gap-1">
                            {selectedEliquid.nicotine.map((n) => (
                              <button
                                key={n}
                                onClick={() => setSelectedNicotine(n)}
                                className={`text-[10px] px-2 py-0.5 rounded transition ${
                                  selectedNicotine === n
                                    ? 'bg-neon text-noir font-bold'
                                    : 'bg-white/5 text-ash border border-white/8 hover:border-white/20'
                                }`}
                              >
                                {n} mg
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-white">{formatPrice(selectedEliquid.price)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Barre latérale récapulative (Panier de config) */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card p-6">
            <h2 className="font-display text-base font-bold text-white">Votre Pack</h2>

            <div className="mt-4 space-y-3">
              {/* Box summary line */}
              <div className="flex justify-between text-xs py-1 border-b border-white/5">
                <span className="text-muted truncate max-w-[180px]">
                  1. Mod : {selectedBox ? selectedBox.name : <em className="text-faint">Non choisi</em>}
                </span>
                <span className="font-semibold text-white">{selectedBox ? formatPrice(boxPrice) : '--'}</span>
              </div>
              {/* Clearomizer summary line */}
              <div className="flex justify-between text-xs py-1 border-b border-white/5">
                <span className="text-muted truncate max-w-[180px]">
                  2. Réservoir : {selectedClearomizer ? selectedClearomizer.name : <em className="text-faint">Non choisi</em>}
                </span>
                <span className="font-semibold text-white">
                  {selectedClearomizer ? formatPrice(clearomizerPrice) : '--'}
                </span>
              </div>
              {/* Eliquid summary line */}
              <div className="flex justify-between text-xs py-1">
                <span className="text-muted truncate max-w-[180px]">
                  3. Liquide : {selectedEliquid ? selectedEliquid.name : <em className="text-faint">Non choisi</em>}
                </span>
                <span className="font-semibold text-white">{selectedEliquid ? formatPrice(eliquidPrice) : '--'}</span>
              </div>
            </div>

            <dl className="mt-6 space-y-2.5 border-t border-white/8 pt-5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Sous-total</dt>
                <dd className="text-white">{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Remise pack (15%)</dt>
                <dd className="text-neon">{discount > 0 ? `- ${formatPrice(discount)}` : '0,00 €'}</dd>
              </div>
              <div className="flex justify-between border-t border-white/8 pt-3">
                <dt className="font-semibold text-white">Total pack</dt>
                <dd className="font-display text-base font-bold text-white">{formatPrice(finalPrice)}</dd>
              </div>
            </dl>

            {step === 4 ? (
              <button onClick={handleAddToCart} className="btn-primary mt-6 w-full py-3 text-center text-xs">
                Ajouter le pack & Payer
              </button>
            ) : (
              <button
                disabled={step === 1 && !selectedBox}
                onClick={() => setStep(step + 1)}
                className="btn-ghost mt-6 w-full py-3 text-center text-xs disabled:opacity-30 disabled:hover:scale-100"
              >
                Étape suivante
              </button>
            )}

            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="mt-2 text-center text-[11px] text-faint hover:text-white block w-full transition"
              >
                Retour à l'étape précédente
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
