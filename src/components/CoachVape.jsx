import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useStore, formatPrice } from '../context/StoreContext.jsx'

export default function CoachVape() {
  const { products, addToCart } = useStore()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [step, setStep] = useState('welcome') // welcome, smoking, flavor, type, recommended
  const [answers, setAnswers] = useState({ smoking: '', flavor: '', type: '' })
  const chatEndRef = useRef(null)

  // Initialiser les messages de bienvenue
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome-1',
          isBot: true,
          content: 'Bonjour ! 👋 Je suis votre **Coach Vape**.',
        },
        {
          id: 'welcome-2',
          isBot: true,
          content: 'Je suis là pour vous aider à trouver la cigarette électronique ou le e-liquide idéal selon votre profil. Voulez-vous faire notre diagnostic personnalisé en 3 questions rapides ?',
          options: [
            { text: 'Oui, avec plaisir !', action: 'start_quiz' },
            { text: 'Non merci, je préfère chatter', action: 'start_chat' }
          ]
        }
      ])
    }
  }, [messages])

  // Faire défiler vers le bas lors de l'ajout de messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const addMessage = (msg) => {
    setMessages((prev) => [...prev, { id: 'msg-' + Date.now() + Math.random(), ...msg }])
  }

  const handleOptionClick = (option) => {
    // Supprimer les boutons d'options sur le dernier message pour éviter les clics répétés
    setMessages((prev) =>
      prev.map((msg, idx) => (idx === prev.length - 1 ? { ...msg, options: null } : msg))
    )

    // Ajouter la réponse de l'utilisateur
    addMessage({ isBot: false, content: option.text })

    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      processOptionAction(option.action, option.text)
    }, 1000)
  }

  const processOptionAction = (action, text) => {
    switch (action) {
      case 'start_quiz':
        setStep('smoking')
        addMessage({
          isBot: true,
          content: 'Excellent ! Commençons. 🚭 **Fumez-vous actuellement des cigarettes traditionnelles ?**',
          options: [
            { text: 'Oui, beaucoup (+ de 15/jour)', action: 'smoking_heavy' },
            { text: 'Oui, moyennement (5 à 15/jour)', action: 'smoking_medium' },
            { text: 'Oui, occasionnellement (- de 5/jour)', action: 'smoking_light' },
            { text: 'Non, je vape déjà', action: 'smoking_vape' },
            { text: 'Non, je ne fume pas', action: 'smoking_none' }
          ]
        })
        break;

      case 'start_chat':
        setStep('chat')
        addMessage({
          isBot: true,
          content: 'Pas de soucis ! Posez-moi vos questions. Vous pouvez me demander des conseils sur la nicotine, nos codes promos, la livraison ou le matériel.'
        })
        break;

      // Question 1 Answers
      case 'smoking_heavy':
      case 'smoking_medium':
      case 'smoking_light':
      case 'smoking_vape':
      case 'smoking_none':
        setAnswers((prev) => ({ ...prev, smoking: action }))
        setStep('flavor')
        addMessage({
          isBot: true,
          content: 'C\'est noté. 🍓 **Côté saveurs, quel univers gustatif vous attire le plus ?**',
          options: [
            { text: 'Classic (goût tabac sec)', action: 'flavor_classic' },
            { text: 'Mentholé (frais et menthe)', action: 'flavor_mint' },
            { text: 'Fruité (fraise, fruits rouges, pomme...)', action: 'flavor_fruit' },
            { text: 'Gourmand (tarte, caramel, café...)', action: 'flavor_sweet' }
          ]
        })
        break;

      // Question 2 Answers
      case 'flavor_classic':
      case 'flavor_mint':
      case 'flavor_fruit':
      case 'flavor_sweet':
        setAnswers((prev) => ({ ...prev, flavor: action }))
        setStep('type')
        addMessage({
          isBot: true,
          content: 'Très bon choix ! ⚙️ **Enfin, quel type de produit recherchez-vous en priorité ?**',
          options: [
            { text: 'Cigarette électronique simple (type Pod compact)', action: 'type_pod' },
            { text: 'Kit complet (autonomie et réglages)', action: 'type_kit' },
            { text: 'Uniquement des e-liquides pour ma vape', action: 'type_eliquide' }
          ]
        })
        break;

      // Question 3 Answers (Generate Recommendations)
      case 'type_pod':
      case 'type_kit':
      case 'type_eliquide':
        const updatedAnswers = { ...answers, type: action }
        setAnswers(updatedAnswers)
        generateRecommendations(updatedAnswers)
        break;

      case 'reset_quiz':
        setAnswers({ smoking: '', flavor: '', type: '' })
        setStep('smoking')
        addMessage({
          isBot: true,
          content: 'C\'est reparti ! 🚭 **Fumez-vous actuellement des cigarettes traditionnelles ?**',
          options: [
            { text: 'Oui, beaucoup (+ de 15/jour)', action: 'smoking_heavy' },
            { text: 'Oui, moyennement (5 à 15/jour)', action: 'smoking_medium' },
            { text: 'Oui, occasionnellement (- de 5/jour)', action: 'smoking_light' },
            { text: 'Non, je vape déjà', action: 'smoking_vape' },
            { text: 'Non, je ne fume pas', action: 'smoking_none' }
          ]
        })
        break;

      default:
        setStep('chat')
        addMessage({
          isBot: true,
          content: 'Désolé, je n\'ai pas compris. Souhaitez-vous recommencer le questionnaire ?',
          options: [
            { text: 'Recommencer le questionnaire', action: 'reset_quiz' },
            { text: 'Poser une question', action: 'start_chat' }
          ]
        })
    }
  }

  const generateRecommendations = (currentAnswers) => {
    setStep('recommended')
    
    // 1. Calculer le taux de nicotine conseillé
    let nicotineAdvice = '0'
    let nicotineExplanation = ''
    switch (currentAnswers.smoking) {
      case 'smoking_heavy':
        nicotineAdvice = '12 à 16'
        nicotineExplanation = 'Un taux élevé pour vous procurer le hit nécessaire et faciliter votre transition.'
        break
      case 'smoking_medium':
        nicotineAdvice = '6 à 12'
        nicotineExplanation = 'Un dosage moyen équilibré pour combler le manque sans être trop agressif en gorge.'
        break
      case 'smoking_light':
        nicotineAdvice = '3 à 6'
        nicotineExplanation = 'Un taux léger parfait pour les petits fumeurs ou vapoteurs occasionnels.'
        break
      case 'smoking_vape':
        nicotineAdvice = '3 à 6'
        nicotineExplanation = 'Conservez votre dosage habituel, ou ajustez selon votre ressenti.'
        break
      case 'smoking_none':
      default:
        nicotineAdvice = '0'
        nicotineExplanation = 'Sans nicotine, afin de ne pas développer de dépendance.'
        break
    }

    // 2. Trouver les produits du catalogue
    let matchedProducts = []

    // Filtrer par type de produit
    if (currentAnswers.type === 'type_pod') {
      matchedProducts = products.filter(
        (p) => p.category === 'ecig' && (p.type.toLowerCase().includes('pod') || p.name.toLowerCase().includes('pod'))
      )
    } else if (currentAnswers.type === 'type_kit') {
      matchedProducts = products.filter(
        (p) => p.category === 'ecig' && !p.type.toLowerCase().includes('pod')
      )
    } else if (currentAnswers.type === 'type_eliquide') {
      matchedProducts = products.filter((p) => p.category === 'eliquide')
    }

    // Filtrer par saveur pour les eliquides
    if (currentAnswers.type === 'type_eliquide') {
      const flavorMap = {
        flavor_classic: 'classic',
        flavor_mint: 'menthe',
        flavor_fruit: 'fruit',
        flavor_sweet: 'gourmand',
      }
      const targetFlavor = flavorMap[currentAnswers.flavor]
      const flavorFiltered = matchedProducts.filter((p) =>
        p.flavors.some((f) => f.toLowerCase().includes(targetFlavor)) ||
        p.name.toLowerCase().includes(targetFlavor) ||
        p.short.toLowerCase().includes(targetFlavor)
      )
      if (flavorFiltered.length > 0) {
        matchedProducts = flavorFiltered
      }
    }

    // Si pas de correspondance directe ou trop peu, on ajoute des bestsellers
    if (matchedProducts.length < 2) {
      const backupProducts = products.filter((p) => p.badge === 'best-seller' || p.rating >= 4.8)
      matchedProducts = [...matchedProducts, ...backupProducts]
    }

    // Dédoublonner et limiter à 3 produits maximum
    matchedProducts = Array.from(new Set(matchedProducts)).slice(0, 3)

    // 3. Envoyer la réponse du coach
    addMessage({
      isBot: true,
      content: `D'après vos réponses, voici mes recommandations :\n\n⚡ **Taux de nicotine suggéré : ${nicotineAdvice} mg/ml**\n_${nicotineExplanation}_\n\nVoici une sélection de produits configurés pour vous :`,
      products: matchedProducts,
      options: [
        { text: 'Recommencer le diagnostic 🔄', action: 'reset_quiz' },
        { text: 'Poser une question libre 💬', action: 'start_chat' }
      ]
    })
  }

  const handleSend = (e) => {
    e.preventDefault()
    if (!input.trim()) return

    const userText = input.trim()
    setInput('')

    // Ajouter le message utilisateur
    addMessage({ isBot: false, content: userText })

    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      respondToText(userText)
    }, 1200)
  }

  const respondToText = (text) => {
    const clean = text.toLowerCase()
    
    // Règles de correspondance par mots-clés
    if (/(bonjour|salut|hello|hi|hey|coucou)/i.test(clean)) {
      addMessage({
        isBot: true,
        content: 'Bonjour ! Comment puis-je vous renseigner aujourd\'hui ? 😊',
        options: [
          { text: 'Lancer le diagnostic 📋', action: 'reset_quiz' },
          { text: 'Quels sont les codes promos ? 🎁', action: 'ask_promos' }
        ]
      })
    } else if (/(promo|code|reduction|remise|soldes)/i.test(clean) || clean.includes('cadeau')) {
      addMessage({
        isBot: true,
        content: 'Voici les codes promotionnels disponibles en ce moment :\n\n- 🏷️ **BIENVENUE** : -15% sur votre première commande.\n- 🏷️ **THEKLOPE10** : -10% sur toute la boutique.\n- 🏷️ **LIVRAISON** : Livraison offerte sans minimum d\'achat.'
      })
    } else if (/(livraison|envoi|delai|frais de port|frais d'envoi|expédition)/i.test(clean)) {
      addMessage({
        isBot: true,
        content: '🚀 **Livraison 24/48h en France métropolitaine.**\n\nLes frais de port standard sont de 4,90€, et ils sont **totalement offerts** dès 49€ d\'achat !'
      })
    } else if (/(nicotine|taux|dosage|mg)/i.test(clean)) {
      addMessage({
        isBot: true,
        content: 'Le dosage idéal dépend de votre consommation de cigarettes :\n\n- 🚬 **+15 cig/jour** : 12 à 16 mg/ml\n- 🚬 **5 à 15 cig/jour** : 6 à 12 mg/ml\n- 🚬 **Moins de 5 cig/jour** : 3 mg/ml\n- 🚫 **Non-fumeur** : 0 mg/ml (sans nicotine)\n\nN\'hésitez pas à lancer le diagnostic pour calculer votre taux personnalisé !',
        options: [{ text: 'Lancer le diagnostic 📋', action: 'reset_quiz' }]
      })
    } else if (/(contact|telephone|mail|adresse|magasin|conseiller|service client)/i.test(clean)) {
      addMessage({
        isBot: true,
        content: 'Notre équipe est à votre écoute ! 📞\n\n- **E-mail** : contact@theklope.fr\n- **Téléphone** : 01 23 45 67 89 (du lundi au vendredi de 9h à 18h)\n- **Adresse** : Espace THEKLOPE, Paris, France'
      })
    } else if (/(pod|kit|clearomiseur|clearomiseur|resistance|box|batterie)/i.test(clean)) {
      addMessage({
        isBot: true,
        content: '🔌 **Petit lexique de la vape :**\n\n- **Pod** : Format pocket, ultra simple, idéal pour les sels de nicotine et débutants.\n- **Kit** : Ensemble batterie (box) et réservoir (clearomiseur), offrant des réglages plus avancés.\n- **Résistance** : La pièce chauffante à remplacer toutes les 2-3 semaines.',
        options: [
          { text: 'Recommander un Pod', action: 'type_pod' },
          { text: 'Recommander un Kit complet', action: 'type_kit' }
        ]
      })
    } else if (/(liquide|eliquide|juice|saveur|gout|pg|vg)/i.test(clean)) {
      addMessage({
        isBot: true,
        content: 'Tous nos e-liquides sont sélectionnés rigoureusement. Nous proposons des saveurs **Classic** (tabac), **Frais/Menthe**, **Fruités** (fruits rouges, pomme...) et **Gourmands** (vanille, cookie...).',
        options: [{ text: 'Trouver un e-liquide 🧪', action: 'type_eliquide' }]
      })
    } else if (/(merci|super|genial|cool|thx)/i.test(clean)) {
      addMessage({
        isBot: true,
        content: 'Avec plaisir ! C\'est un plaisir de vous accompagner. N\'hésitez pas si vous avez d\'autres questions ! 💨'
      })
    } else {
      // Cas par défaut : offre de lancer le diagnostic
      addMessage({
        isBot: true,
        content: 'Je n\'ai pas trouvé de réponse exacte pour cela. 😅 Je suis programmé pour vous guider. Souhaitez-vous lancer notre diagnostic personnalisé de vape ?',
        options: [
          { text: 'Lancer le diagnostic 📋', action: 'reset_quiz' },
          { text: 'Voir toute la boutique 🛒', action: 'go_shop' }
        ]
      })
    }
  }

  return (
    <>
      {/* Bouton de chat flottant */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-neon to-electric text-noir shadow-glow transition hover:scale-110 active:scale-95"
        aria-label="Ouvrir le Coach Vape"
      >
        {isOpen ? (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <span className="relative flex h-6 w-6 items-center justify-center">
            {/* Petit badge de notification pulsant */}
            <span className="absolute -top-3.5 -right-3.5 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500"></span>
            </span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </span>
        )}
      </button>

      {/* Fenêtre de chat */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 flex h-[500px] w-[360px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-carbon/90 backdrop-blur-xl shadow-card animate-fade-up sm:w-[400px]">
          {/* Header */}
          <div className="flex items-center gap-3 bg-gradient-to-r from-noir/80 to-carbon/80 px-5 py-4 border-b border-white/8">
            <div className="relative h-10 w-10 shrink-0 rounded-full bg-neon/10 border border-neon/30 flex items-center justify-center text-neon">
              <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-neon ring-2 ring-carbon" />
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-sm font-bold text-white leading-tight">Coach Vape</h3>
              <p className="text-[10px] text-neon font-semibold uppercase tracking-wider">Conseiller virtuel connecté</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-faint hover:text-white"
              aria-label="Fermer"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.isBot ? 'items-start' : 'items-end'}`}
              >
                {/* Bulle de texte */}
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                    msg.isBot
                      ? 'bg-white/[0.04] border border-white/8 text-white'
                      : 'bg-neon text-noir font-medium'
                  }`}
                >
                  {msg.content}
                </div>

                {/* Produits recommandés */}
                {msg.products && msg.products.length > 0 && (
                  <div className="mt-3 w-full space-y-2.5">
                    {msg.products.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center gap-3 rounded-2xl border border-white/8 bg-noir/40 p-3 hover:border-neon/30 transition group"
                      >
                        <img src={p.image} alt="" className="h-14 w-14 rounded-xl object-cover bg-carbon p-1 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <Link
                            to={`/produit/${p.id}`}
                            onClick={() => setIsOpen(false)}
                            className="block truncate text-xs font-bold text-white hover:text-neon"
                          >
                            {p.name}
                          </Link>
                          <p className="text-[11px] text-faint truncate mt-0.5">{p.brand} · {p.type}</p>
                          <p className="text-xs font-semibold text-neon mt-1">{formatPrice(p.price)}</p>
                        </div>
                        <div className="flex flex-col gap-1.5 shrink-0">
                          <button
                            onClick={() => {
                              addToCart(p.id, 1)
                              addMessage({ isBot: true, content: `🛒 J'ai ajouté **${p.name}** à votre panier.` })
                            }}
                            className="rounded-full bg-neon/10 border border-neon/30 p-2 text-neon hover:bg-neon hover:text-noir transition"
                            title="Ajouter au panier"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Boutons d'options / Quick Replies */}
                {msg.options && (
                  <div className="mt-2.5 flex flex-wrap gap-2 w-full">
                    {msg.options.map((opt) => (
                      <button
                        key={opt.action + opt.text}
                        onClick={() => handleOptionClick(opt)}
                        className="rounded-full border border-neon/30 bg-neon/5 px-3 py-1.5 text-xs text-neon hover:bg-neon hover:text-noir transition font-medium"
                      >
                        {opt.text}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Indicateur d'écriture */}
            {isTyping && (
              <div className="flex items-center gap-1.5 bg-white/[0.04] border border-white/8 rounded-2xl px-4 py-3 w-16">
                <span className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Formulaire d'envoi de texte */}
          <form onSubmit={handleSend} className="p-3 border-t border-white/8 bg-noir/20 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={step === 'chat' || step === 'welcome' ? "Écrivez votre question ici..." : "Veuillez choisir une option ci-dessus"}
              disabled={step !== 'chat' && step !== 'welcome' && step !== 'recommended'}
              className="flex-1 input text-xs rounded-2xl py-2 px-3 focus:border-neon focus:ring-1 focus:ring-neon"
            />
            <button
              type="submit"
              disabled={(step !== 'chat' && step !== 'welcome' && step !== 'recommended') || !input.trim()}
              className="rounded-2xl bg-neon text-noir p-2.5 disabled:opacity-30 disabled:hover:bg-neon transition hover:bg-neon/90"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  )
}
