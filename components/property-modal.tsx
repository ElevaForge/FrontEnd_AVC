"use client"

import { useState, useEffect } from "react"
import { X, MapPin, Bed, Bath, Car, Maximize, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { PropiedadCompleta, ImagenPropiedad } from "@/lib/types"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"

interface PropertyModalProps {
  property: PropiedadCompleta | null
  isOpen: boolean
  onClose: () => void
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(price)
}

const estadoLabels = {
  Disponible: "Disponible",
  Reservada: "Reservada",
  Vendida: "Vendida",
  Arrendada: "Arrendada",
}

export function PropertyModal({ property, isOpen, onClose }: PropertyModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [images, setImages] = useState<string[]>([])
  const [loadingImages, setLoadingImages] = useState(false)

  // Cargar imágenes cuando se abre el modal
  useEffect(() => {
    if (isOpen && property?.id) {
      loadImages(property.id)
    } else {
      setImages([])
      setCurrentImageIndex(0)
    }
  }, [isOpen, property?.id])

  const loadImages = async (propertyId: string) => {
    setLoadingImages(true)
    try {
      // Primero intentar usar las imágenes que ya vienen en la propiedad
      if (property?.imagenes && property.imagenes.length > 0) {
        const urls = property.imagenes.map(img => img.url).filter(Boolean)
        if (urls.length > 0) {
          setImages(urls)
          setLoadingImages(false)
          return
        }
      }

      // Si no hay imágenes en la propiedad, cargar desde BD
      const { data, error } = await supabase
        .from('imagenes_propiedad')
        .select('*')
        .eq('propiedad_id', propertyId)
        .order('orden', { ascending: true })
        .limit(20)

      if (error) {
        console.error('Error loading images:', error)
        // Fallback a imagen principal
        if (property?.imagen_principal) {
          setImages([property.imagen_principal])
        }
      } else if (data && data.length > 0) {
        const urls = data.map((img: ImagenPropiedad) => img.url).filter(Boolean)
        setImages(urls.length > 0 ? urls : (property?.imagen_principal ? [property.imagen_principal] : []))
      } else {
        // Sin imágenes, usar imagen principal si existe
        if (property?.imagen_principal) {
          setImages([property.imagen_principal])
        }
      }
    } catch (err) {
      console.error('Error loading images:', err)
      if (property?.imagen_principal) {
        setImages([property.imagen_principal])
      }
    } finally {
      setLoadingImages(false)
    }
  }

  if (!isOpen || !property) return null

  const whatsappMessage = encodeURIComponent(
    `Hola, estoy interesado en la propiedad "${property.nombre}" ubicada en ${property.direccion}. Precio: ${formatPrice(property.precio)}. ¿Podrían darme más información?`,
  )
  
  const nextImage = () => {
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length)
    }
  }

  const prevImage = () => {
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-card rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-300">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="overflow-y-auto max-h-[90vh]">
          {/* Image Gallery - using img instead of next/image */}
          <div className="relative aspect-video">
            {(() => {
              const url = images[currentImageIndex] || "/placeholder.svg?height=400&width=600&query=property interior"
              const isVideo = /\.(mp4|webm|ogg)(\?|$)/i.test(url) || url.includes('video')
              return isVideo ? (
                <video className="w-full h-full object-cover" src={url} controls playsInline />
              ) : (
                <img src={url} alt={property.nombre} className="w-full h-full object-cover" />
              )
            })()}

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={cn(
                      "w-3 h-3 rounded-full transition-colors",
                      index === currentImageIndex ? "bg-white" : "bg-white/50",
                    )}
                  />
                ))}
              </div>
            )}

            {/* Status Badge */}
            <Badge
              className={cn(
                "absolute top-4 left-4",
                property.estado === "Disponible" && "bg-green-500 text-white",
                property.estado === "Reservada" && "bg-yellow-500 text-white",
                property.estado === "Vendida" && "bg-red-500 text-white",
                property.estado === "Arrendada" && "bg-blue-500 text-white",
              )}
            >
              {estadoLabels[property.estado]}
            </Badge>
          </div>

          {/* Content */}
          <div className="p-6 md:p-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
              <div>
                <Badge className="mb-2 bg-primary text-primary-foreground">
                  {property.categoria.replace('_', '/')}
                </Badge>
                <h2 className="text-2xl md:text-3xl font-bold text-card-foreground">{property.nombre}</h2>
                <div className="flex items-center text-muted-foreground mt-2">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>{property.direccion}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-3xl md:text-4xl font-bold text-secondary">{formatPrice(property.precio)}</span>
              </div>
            </div>

            {/* Features Grid */}
            {(property.alcobas > 0 ||
              property.banos > 0 ||
              property.parqueaderos > 0 ||
              property.metros_cuadrados > 0) && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-muted rounded-xl">
                {property.alcobas > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Bed className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Alcobas</p>
                      <p className="font-semibold text-card-foreground">{property.alcobas}</p>
                    </div>
                  </div>
                )}
                {property.banos > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Bath className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Baños</p>
                      <p className="font-semibold text-card-foreground">{property.banos}</p>
                    </div>
                  </div>
                )}
                {property.parqueaderos > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Car className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Parqueaderos</p>
                      <p className="font-semibold text-card-foreground">{property.parqueaderos}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Maximize className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Área</p>
                    <p className="font-semibold text-card-foreground">{property.metros_cuadrados} m²</p>
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-card-foreground mb-3">Descripción</h3>
              <p className="text-muted-foreground leading-relaxed">{property.descripcion}</p>
            </div>

            {/* Location Placeholder */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-card-foreground mb-3">Ubicación</h3>
              <div className="aspect-[2/1] bg-muted rounded-xl flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>{property.direccion}</p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <Button
              onClick={() => window.open(`https://wa.me/573117284320?text=${whatsappMessage}`, "_blank")}
              size="lg"
              className="w-full bg-green-500 hover:bg-green-600 text-white text-lg py-6"
            >
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Contactar por WhatsApp
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
