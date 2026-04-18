"use client"

import { useMemo, useState, useEffect, useRef } from "react"
import { X, ChevronLeft, ChevronRight, CalendarDays, Megaphone, ExternalLink, Play } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Anuncio } from "@/lib/types"
import { normalizeSupabaseStorageUrl } from "@/lib/supabase"

interface AnnouncementModalProps {
  anuncio: Anuncio | null
  isOpen: boolean
  onClose: () => void
}

function isVideoUrl(url: string): boolean {
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url)
}

function getAnuncioMedia(anuncio: Anuncio): string[] {
  const fromGallery = Array.isArray(anuncio.galeria_urls) ? anuncio.galeria_urls : []
  const merged = [...fromGallery, anuncio.imagen_url || '', anuncio.video_url || '']
    .map((item) => normalizeSupabaseStorageUrl(String(item || '').trim()))
    .filter(Boolean)

  return Array.from(new Set(merged))
}

function formatDate(value: string | null) {
  if (!value) return 'Sin fecha límite'
  return new Date(value).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function AnnouncementModal({ anuncio, isOpen, onClose }: AnnouncementModalProps) {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)
  const [loadedMedia, setLoadedMedia] = useState<Record<string, boolean>>({})
  const touchStartXRef = useRef<number | null>(null)

  const media = useMemo(() => {
    if (!anuncio) return []
    return getAnuncioMedia(anuncio)
  }, [anuncio])

  useEffect(() => {
    setCurrentMediaIndex(0)
  }, [anuncio?.id, isOpen])

  useEffect(() => {
    if (!isOpen || media.length === 0) {
      setLoadedMedia({})
      return
    }

    setLoadedMedia({})
    media.forEach((url) => {
      if (isVideoUrl(url)) {
        setLoadedMedia((prev) => ({ ...prev, [url]: true }))
        return
      }

      const img = new Image()
      img.onload = () => setLoadedMedia((prev) => ({ ...prev, [url]: true }))
      img.onerror = () => setLoadedMedia((prev) => ({ ...prev, [url]: true }))
      img.src = url
    })
  }, [isOpen, media])

  if (!isOpen || !anuncio) return null

  const currentMedia = media[currentMediaIndex] || '/placeholder.svg'
  const currentIsVideo = isVideoUrl(currentMedia)
  const isCurrentLoaded = currentIsVideo || Boolean(loadedMedia[currentMedia])

  const goPrev = () => {
    if (media.length <= 1) return
    setCurrentMediaIndex((prev) => (prev - 1 + media.length) % media.length)
  }

  const goNext = () => {
    if (media.length <= 1) return
    setCurrentMediaIndex((prev) => (prev + 1) % media.length)
  }

  const onTouchStart: React.TouchEventHandler<HTMLDivElement> = (event) => {
    touchStartXRef.current = event.touches[0]?.clientX ?? null
  }

  const onTouchEnd: React.TouchEventHandler<HTMLDivElement> = (event) => {
    if (touchStartXRef.current === null || media.length <= 1) return
    const endX = event.changedTouches[0]?.clientX ?? touchStartXRef.current
    const deltaX = endX - touchStartXRef.current
    touchStartXRef.current = null
    if (Math.abs(deltaX) < 40) return
    if (deltaX < 0) {
      goNext()
    } else {
      goPrev()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-card rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
          aria-label="Cerrar anuncio"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="overflow-y-auto max-h-[90vh]">
          <div
            className="relative w-full min-h-[280px] max-h-[56vh] bg-black flex items-center justify-center"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            {currentIsVideo ? (
              <video
                className="max-w-full max-h-[56vh] object-contain"
                src={currentMedia}
                controls
                playsInline
              />
            ) : (
              <>
                <img
                  src={currentMedia}
                  alt={anuncio.titulo}
                  className={`max-w-full max-h-[56vh] object-contain transition-opacity duration-200 ${isCurrentLoaded ? 'opacity-100' : 'opacity-0'}`}
                  loading="eager"
                  decoding="async"
                />
                {!isCurrentLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
                  </div>
                )}
              </>
            )}

            {media.length > 1 && (
              <>
                <button
                  onClick={goPrev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                  aria-label="Foto anterior"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={goNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                  aria-label="Foto siguiente"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            {media.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {media.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentMediaIndex(idx)}
                    className={`w-3 h-3 rounded-full transition-colors ${idx === currentMediaIndex ? 'bg-white' : 'bg-white/50'}`}
                    aria-label={`Ir al medio ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {media.length > 1 && (
            <div className="px-4 py-3 bg-black/90 border-t border-white/10 overflow-x-auto">
              <div className="flex gap-2 min-w-max">
                {media.map((item, idx) => {
                  const selected = idx === currentMediaIndex
                  const video = isVideoUrl(item)
                  return (
                    <button
                      key={`${item}-${idx}`}
                      type="button"
                      onClick={() => setCurrentMediaIndex(idx)}
                      className={`relative h-14 w-20 rounded-md overflow-hidden border-2 transition-colors ${selected ? 'border-secondary' : 'border-transparent'}`}
                      aria-label={`Seleccionar medio ${idx + 1}`}
                    >
                      {video ? (
                        <div className="h-full w-full bg-black/60 flex items-center justify-center text-white">
                          <Play className="h-4 w-4" />
                        </div>
                      ) : (
                        <img src={item} alt={`Miniatura ${idx + 1}`} className="h-full w-full object-cover" loading="lazy" decoding="async" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <div className="p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge>{anuncio.tipo}</Badge>
              {anuncio.destacado && <Badge className="bg-secondary text-white">Destacado</Badge>}
              <Badge variant={anuncio.activo ? 'default' : 'secondary'}>{anuncio.activo ? 'Activo' : 'Inactivo'}</Badge>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-card-foreground mb-2">{anuncio.titulo}</h2>

            {anuncio.resumen && (
              <p className="text-muted-foreground text-base md:text-lg mb-4">{anuncio.resumen}</p>
            )}

            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-5">
              <CalendarDays className="h-4 w-4" />
              Vigente hasta {formatDate(anuncio.fecha_fin)}
            </div>

            <div className="mb-6 rounded-xl bg-muted/70 p-4 md:p-5">
              <div className="flex items-center gap-2 mb-2">
                <Megaphone className="h-4 w-4 text-secondary" />
                <span className="font-semibold">Detalle del anuncio</span>
              </div>
              <p className="text-foreground/90 leading-relaxed whitespace-pre-line">{anuncio.contenido}</p>
            </div>

            {anuncio.cta_url && (
              <Button asChild className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white">
                <a href={anuncio.cta_url} target="_blank" rel="noreferrer">
                  {anuncio.cta_texto || 'Ver más'}
                  <ExternalLink className="h-4 w-4 ml-2" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
