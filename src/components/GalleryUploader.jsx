import { useState, useRef } from 'react'
import { isSupabaseConfigured, getSupabase } from '../lib/supabase.js'

export default function GalleryUploader({ value, onChange, productId, productName }) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)
  const [showManual, setShowManual] = useState(false)
  const fileInputRef = useRef(null)

  // Extraire la liste des images de la chaîne séparée par des virgules
  const images = value
    ? value
        .split(',')
        .map((img) => img.trim())
        .filter(Boolean)
    : []

  const handleFileChange = (e) => {
    const files = e.target.files
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

    if (!file.type.startsWith('image/')) {
      setError('Veuillez sélectionner uniquement des images (JPG, PNG, WEBP, SVG...).')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("L'image est trop volumineuse (maximum 5 Mo).")
      return
    }

    try {
      setUploading(true)
      setError(null)
      setProgress(10)

      const fileExt = file.name.split('.').pop()
      const cleanName = productName
        ? productName
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .slice(0, 30)
        : productId || 'product'
      
      // Index unique pour les images de la galerie
      const imgIndex = images.length + 1
      const fileName = `${cleanName}-gallery-${imgIndex}-${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      setProgress(30)

      const sb = await getSupabase()
      if (!sb) throw new Error('Supabase n’est pas configuré.')

      const { error: uploadError } = await sb.storage
        .from('products')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        })

      if (uploadError) throw uploadError

      setProgress(80)

      const { data: urlData } = sb.storage
        .from('products')
        .getPublicUrl(filePath)

      if (!urlData || !urlData.publicUrl) {
        throw new Error("Impossible de générer l'URL publique du fichier.")
      }

      setProgress(100)
      
      // Ajouter la nouvelle URL à la galerie
      const updatedImages = [...images, urlData.publicUrl]
      onChange(updatedImages.join(', '))
    } catch (err) {
      console.error('Erreur lors de l\'upload de galerie:', err)
      setError(err.message || 'Erreur lors du téléversement.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const removeImage = (indexToRemove) => {
    const updatedImages = images.filter((_, idx) => idx !== indexToRemove)
    onChange(updatedImages.join(', '))
  }

  return (
    <div className="space-y-3">
      <span className="block text-xs font-medium text-muted">Galerie d'images (secondaires)</span>

      {/* Grille de vignettes */}
      <div className="grid grid-cols-4 gap-2">
        {images.map((img, idx) => (
          <div key={img + idx} className="relative aspect-square group overflow-hidden rounded-xl border border-white/10 bg-noir flex items-center justify-center p-1">
            <img src={img} alt="" className="h-full w-full object-cover rounded-lg" />
            
            {/* Bouton de suppression au survol */}
            <button
              type="button"
              onClick={() => removeImage(idx)}
              className="absolute inset-0 bg-noir/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-rose-400 hover:text-rose-300"
              title="Supprimer cette image"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}

        {/* Case Ajouter */}
        {images.length < 8 && (
          <button
            type="button"
            onClick={triggerSelect}
            disabled={uploading}
            className={`aspect-square rounded-xl border border-dashed flex flex-col items-center justify-center transition ${
              uploading
                ? 'border-neon/30 bg-neon/5 text-neon'
                : 'border-white/10 bg-white/[0.02] text-muted hover:border-white/20 hover:bg-white/[0.04]'
            }`}
          >
            {uploading ? (
              <div className="space-y-1 text-center flex flex-col items-center">
                <div className="w-5 h-5 relative">
                  <div className="absolute inset-0 rounded-full border-2 border-white/10"></div>
                  <div className="absolute inset-0 rounded-full border-2 border-t-neon animate-spin"></div>
                </div>
                <span className="text-[10px] text-white font-medium">{progress}%</span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-1 text-muted">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-[10px] font-medium">Ajouter</span>
              </div>
            )}
          </button>
        )}
      </div>

      {/* Saisie d'URL manuelle alternative */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setShowManual(!showManual)}
          className="text-xs text-neon hover:underline"
        >
          {showManual ? "Masquer la saisie d'URLs manuelle" : "Saisir les URLs de la galerie manuellement"}
        </button>
      </div>

      {(showManual || !isSupabaseConfigured) && (
        <div className="rounded-xl border border-white/8 bg-noir/20 p-3.5 space-y-2">
          {!isSupabaseConfigured && (
            <div className="flex gap-2.5 items-start text-amber-400 text-[11px] leading-relaxed mb-1">
              <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p>
                <strong>Supabase Storage non configuré :</strong> Saisissez les URLs publiques de vos images secondaires séparées par des virgules.
              </p>
            </div>
          )}
          <label className="block">
            <span className="mb-1 block text-[10px] font-medium text-muted">URLs de la galerie (séparées par des virgules)</span>
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg"
              className="input text-xs py-2 h-10"
            />
          </label>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-rose-400/25 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
          {error}
        </div>
      )}

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
