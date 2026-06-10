import { useState, useRef } from 'react'
import { isSupabaseConfigured, supabase } from '../lib/supabase.js'

export default function ImageUploader({ value, onChange, productId, productName }) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [showManual, setShowManual] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const files = e.target.files
    if (files && files.length > 0) {
      uploadFile(files[0])
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragging(true)
  }

  const handleDragLeave = () => {
    setDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      uploadFile(files[0])
    }
  }

  const triggerSelect = () => {
    fileInputRef.current?.click()
  }

  const uploadFile = async (file) => {
    if (!isSupabaseConfigured) {
      setError("Le stockage en ligne n'est pas configuré. Veuillez utiliser la saisie manuelle.")
      return
    }

    // Validation du type de fichier
    if (!file.type.startsWith('image/')) {
      setError('Veuillez sélectionner uniquement des images (JPG, PNG, WEBP, SVG...).')
      return
    }

    // Validation de la taille (max 5 Mo)
    if (file.size > 5 * 1024 * 1024) {
      setError('L\'image est trop volumineuse (maximum 5 Mo).')
      return
    }

    try {
      setUploading(true)
      setError(null)
      setProgress(10)

      // Déterminer l'extension du fichier
      const fileExt = file.name.split('.').pop()
      // Créer un nom de fichier propre et unique
      const cleanName = productName
        ? productName
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .slice(0, 30)
        : productId || 'product'
      const fileName = `${cleanName}-${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      setProgress(30)

      // Upload du fichier sur Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        })

      if (uploadError) throw uploadError

      setProgress(80)

      // Récupération de l'URL publique
      const { data: urlData } = supabase.storage
        .from('products')
        .getPublicUrl(filePath)

      if (!urlData || !urlData.publicUrl) {
        throw new Error("Impossible de générer l'URL publique du fichier.")
      }

      setProgress(100)
      onChange(urlData.publicUrl)
    } catch (err) {
      console.error('Erreur lors du téléversement:', err)
      setError(err.message || 'Une erreur est survenue lors du téléversement.')
    } finally {
      setUploading(false)
      // Réinitialiser la valeur du champ input pour pouvoir ré-uploader le même fichier
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const removeImage = () => {
    onChange('')
    setError(null)
  }

  return (
    <div className="space-y-3">
      <span className="block text-xs font-medium text-muted">Image du produit</span>

      {/* Zone d'upload / Preview */}
      {value ? (
        <div className="relative group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-2">
          <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-noir/50 flex items-center justify-center">
            <img src={value} alt="Aperçu du produit" className="max-h-full max-w-full object-contain" />
            
            {/* Overlay d'actions au survol */}
            <div className="absolute inset-0 bg-noir/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={triggerSelect}
                className="btn-primary py-2 px-4 text-xs font-semibold"
              >
                Changer d'image
              </button>
              <button
                type="button"
                onClick={removeImage}
                className="rounded-full border border-rose-500/30 bg-rose-500/10 p-2.5 text-rose-400 hover:bg-rose-500 hover:text-white transition"
                title="Supprimer l'image"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
          <div className="mt-2 px-2 py-1 flex items-center justify-between text-xs text-faint">
            <span className="truncate max-w-[80%]">{value}</span>
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerSelect}
          className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition flex flex-col items-center justify-center min-h-[160px] ${
            dragging
              ? 'border-neon bg-neon/5 text-neon scale-[1.01]'
              : 'border-white/10 bg-white/[0.02] text-muted hover:border-white/20 hover:bg-white/[0.04]'
          }`}
        >
          {uploading ? (
            <div className="space-y-3 flex flex-col items-center justify-center">
              {/* Spinner de chargement */}
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 rounded-full border-2 border-white/10"></div>
                <div className="absolute inset-0 rounded-full border-2 border-t-neon animate-spin"></div>
              </div>
              <p className="text-sm font-semibold text-white">Téléversement en cours...</p>
              <div className="w-32 bg-white/10 rounded-full h-1.5 overflow-hidden">
                <div className="bg-neon h-1.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          ) : (
            <div className="space-y-2 flex flex-col items-center justify-center">
              <div className="grid h-12 w-12 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-muted group-hover:text-white transition">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  Déposez votre image ici, ou <span className="text-neon underline">parcourez</span>
                </p>
                <p className="text-xs text-faint mt-1">Images JPG, PNG, WEBP ou SVG jusqu'à 5 Mo</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bouton de bascule d'URL manuelle */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setShowManual(!showManual)}
          className="text-xs text-neon hover:underline"
        >
          {showManual ? "Masquer la saisie d'URL manuelle" : "Saisir une URL d'image manuellement"}
        </button>
      </div>

      {/* Saisie d'URL Manuelle */}
      {(showManual || !isSupabaseConfigured) && (
        <div className="rounded-2xl border border-white/8 bg-noir/20 p-4 space-y-3">
          {!isSupabaseConfigured && (
            <div className="flex gap-2.5 items-start text-amber-400 text-xs leading-relaxed">
              <svg className="w-4.5 h-4.5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p>
                <strong>Supabase Storage non configuré :</strong> Veuillez saisir directement l'adresse (URL) publique de l'image ci-dessous.
              </p>
            </div>
          )}
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-medium text-muted">Lien direct de l'image</span>
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://example.com/mon-image.jpg"
              className="input text-xs"
            />
          </label>
        </div>
      )}

      {/* Affichage d'erreur */}
      {error && (
        <div className="rounded-xl border border-rose-400/25 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
          {error}
        </div>
      )}

      {/* Input de fichier caché */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
    </div>
  )
}
