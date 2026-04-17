"use client"

import { useState } from 'react'
import { Megaphone, CalendarDays, ExternalLink, Pin } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAnuncios } from '@/hooks/use-anuncios'
import type { Anuncio, TipoAnuncio } from '@/lib/types'
import { AnnouncementModal } from '@/components/announcement-modal'

const tipoStyles: Record<TipoAnuncio, string> = {
  General: 'bg-slate-100 text-slate-700',
  Promocion: 'bg-emerald-100 text-emerald-700',
  Urgente: 'bg-red-100 text-red-700',
  Evento: 'bg-blue-100 text-blue-700',
}

function formatDate(value: string | null) {
  if (!value) return 'Sin fecha límite'
  return new Date(value).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function AnnouncementsSection() {
  const { anuncios, loading, error } = useAnuncios({ activo: true, limit: 6 })
  const [selectedAnuncio, setSelectedAnuncio] = useState<Anuncio | null>(null)

  const getPreviewMedia = (anuncio: Anuncio): string => {
    const gallery = Array.isArray(anuncio.galeria_urls) ? anuncio.galeria_urls : []
    return gallery[0] || anuncio.imagen_url || '/placeholder.svg'
  }

  return (
    <section id="tablon-anuncios" className="py-20 bg-gradient-to-b from-background to-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Tablón de <span className="text-secondary">Anuncios</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Novedades, promociones y avisos importantes de AVC en un solo lugar.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <Card className="p-6 text-center">
            <p className="text-destructive font-medium">No fue posible cargar el tablón de anuncios.</p>
            <p className="text-muted-foreground text-sm mt-2">{error}</p>
          </Card>
        ) : anuncios.length === 0 ? (
          <Card className="p-8 text-center border-dashed">
            <Megaphone className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Aún no hay anuncios publicados.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
            {anuncios.map((anuncio) => (
              <Card
                key={anuncio.id}
                className="overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
                onClick={() => setSelectedAnuncio(anuncio)}
              >
                <div className="relative h-48 bg-black">
                  <img
                    src={getPreviewMedia(anuncio)}
                    alt={anuncio.titulo}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                  <div className="absolute top-3 left-3">
                    <Badge className={tipoStyles[anuncio.tipo] || tipoStyles.General}>{anuncio.tipo}</Badge>
                  </div>

                  {anuncio.destacado && (
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-secondary text-white">
                        <Pin className="h-3 w-3 mr-1" /> Destacado
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="p-5 md:p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2">{anuncio.titulo}</h3>
                  {anuncio.resumen && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{anuncio.resumen}</p>
                  )}

                  <p className="text-sm text-foreground/90 mb-4 line-clamp-3">{anuncio.contenido}</p>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                    <CalendarDays className="h-3.5 w-3.5" />
                    Vigente hasta {formatDate(anuncio.fecha_fin)}
                  </div>

                  <Button className="w-full bg-primary hover:bg-primary/90 text-white">
                    {anuncio.cta_url ? (anuncio.cta_texto || 'Ver más') : 'Ver anuncio'}
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AnnouncementModal
        anuncio={selectedAnuncio}
        isOpen={Boolean(selectedAnuncio)}
        onClose={() => setSelectedAnuncio(null)}
      />
    </section>
  )
}
