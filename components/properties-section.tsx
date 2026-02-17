"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { PropertyCard } from "./property-card"
import { PropertyModal } from "./property-modal"
import { Button } from "@/components/ui/button"
import {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import { usePropiedades } from "@/hooks/use-propiedades"
import type { PropiedadCompleta } from "@/lib/types"

// Hook para obtener el número de tarjetas visibles según el tamaño de pantalla
function useVisibleCards() {
  const [visibleCards, setVisibleCards] = useState(3)

  useEffect(() => {
    const updateVisibleCards = () => {
      if (window.innerWidth < 640) {
        setVisibleCards(1) // mobile
      } else if (window.innerWidth < 1024) {
        setVisibleCards(2) // tablet
      } else {
        setVisibleCards(3) // desktop
      }
    }

    updateVisibleCards()
    window.addEventListener('resize', updateVisibleCards)
    return () => window.removeEventListener('resize', updateVisibleCards)
  }, [])

  return visibleCards
}

export function PropertiesSection() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [emblaVentaApi, setEmblaVentaApi] = useState<CarouselApi | null>(null)
  const [emblaArriendoApi, setEmblaArriendoApi] = useState<CarouselApi | null>(null)
  const visibleCards = useVisibleCards()

  // Obtener propiedades por tipo (cada tipo es un catálogo separado)
  const { propiedades: ventaPropiedades = [], loading: loadingVenta } = usePropiedades({ tipo_accion: 'Venta' })
  const { propiedades: arriendoPropiedades = [], loading: loadingArriendo } = usePropiedades({ tipo_accion: 'Arriendo' })

  const loading = loadingVenta || loadingArriendo

  const combinedCount = (ventaPropiedades?.length || 0) + (arriendoPropiedades?.length || 0)
  // Calcular el índice máximo basado en tarjetas visibles
  const maxIndexVenta = Math.max(0, (ventaPropiedades?.length || 0) - visibleCards)
  const maxIndexArriendo = Math.max(0, (arriendoPropiedades?.length || 0) - visibleCards)

  // Asegurar que currentIndex no exceda maxIndex cuando cambian las propiedades (por catálogo)
  useEffect(() => {
    if (currentIndex > Math.max(maxIndexVenta, maxIndexArriendo)) {
      setCurrentIndex(Math.max(maxIndexVenta, maxIndexArriendo))
    }
  }, [currentIndex, maxIndexVenta, maxIndexArriendo])

  // legacy currentIndex state kept for dots selection fallback; embla will handle scrolling

  const openModal = (index: number) => {
    setSelectedIndex(index)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedIndex(null)
  }

  // (sin categorías) - no-op

  // Sync embla selected index with local currentIndex state for dots and fallbacks (per catálogo)
  useEffect(() => {
    let cleanupVenta: (() => void) | undefined
    let cleanupArriendo: (() => void) | undefined

    if (emblaVentaApi) {
      const onSelectVenta = () => {
        try {
          const selected = emblaVentaApi.selectedScrollSnap()
          setCurrentIndex(selected)
        } catch (e) {
          // ignore
        }
      }
      onSelectVenta()
      emblaVentaApi.on('select', onSelectVenta)
      emblaVentaApi.on('reInit', onSelectVenta)
      cleanupVenta = () => {
        emblaVentaApi.off('select', onSelectVenta)
        emblaVentaApi.off('reInit', onSelectVenta)
      }
    }

    if (emblaArriendoApi) {
      const onSelectArriendo = () => {
        try {
          const selected = emblaArriendoApi.selectedScrollSnap()
          setCurrentIndex(selected)
        } catch (e) {
          // ignore
        }
      }
      onSelectArriendo()
      emblaArriendoApi.on('select', onSelectArriendo)
      emblaArriendoApi.on('reInit', onSelectArriendo)
      cleanupArriendo = () => {
        emblaArriendoApi.off('select', onSelectArriendo)
        emblaArriendoApi.off('reInit', onSelectArriendo)
      }
    }

    return () => {
      cleanupVenta?.()
      cleanupArriendo?.()
    }
  }, [emblaVentaApi, emblaArriendoApi])

  // Modal: mantenemos la lista de propiedades que abrió el modal para navegación interna
  const [modalProperties, setModalProperties] = useState<PropiedadCompleta[]>([])

  const openModalFrom = (propsList: PropiedadCompleta[], index: number) => {
    setModalProperties(propsList)
    setSelectedIndex(index)
    setIsModalOpen(true)
  }

  return (
    <section id="comprar" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Encuentra tu <span className="text-secondary">Propiedad Ideal</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explora nuestra selección de propiedades cuidadosamente seleccionadas para ti
          </p>
        </div>

        {/* Se eliminó la selección por categorías: mostramos un solo catálogo de venta */}

        {/* Properties Carousel */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="relative">
            {/* Navigation per-catalog handled below */}

            {/* Se muestran ambos catálogos por separado más abajo (sin botones de ancla) */}

            {/* Carousel Venta */}
            <div id="catalogo-comprar" className="mb-12">
              <h3 className="text-2xl font-semibold mb-4">Catálogo - Comprar</h3>
              <div className="relative">
                {ventaPropiedades.length > visibleCards && (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-card shadow-lg hidden md:flex"
                      onClick={() => emblaVentaApi?.scrollPrev()}
                      disabled={!emblaVentaApi || !emblaVentaApi.canScrollPrev()}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 bg-card shadow-lg hidden md:flex"
                      onClick={() => emblaVentaApi?.scrollNext()}
                      disabled={!emblaVentaApi || !emblaVentaApi.canScrollNext()}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </>
                )}

                <Carousel setApi={setEmblaVentaApi}>
                  <CarouselContent className="-ml-4">
                    {ventaPropiedades.map((property, idx) => (
                      <CarouselItem
                        key={property.id}
                        className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3"
                      >
                        <PropertyCard property={property} onClick={() => openModalFrom(ventaPropiedades, idx)} />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>

                {ventaPropiedades.length > visibleCards && (
                  <div className="flex justify-center gap-2 mt-6 md:hidden">
                    {Array.from({ length: emblaVentaApi ? emblaVentaApi.scrollSnapList().length : maxIndexVenta + 1 }).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => emblaVentaApi?.scrollTo(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          (emblaVentaApi ? emblaVentaApi.selectedScrollSnap() === index : index === currentIndex)
                            ? "bg-primary"
                            : "bg-primary/30"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Carousel Arriendo */}
            <div id="catalogo-arrendar" className="mb-12">
              <h3 className="text-2xl font-semibold mb-4">Catálogo - Arrendar</h3>
              <div className="relative">
                {arriendoPropiedades.length > visibleCards && (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-card shadow-lg hidden md:flex"
                      onClick={() => emblaArriendoApi?.scrollPrev()}
                      disabled={!emblaArriendoApi || !emblaArriendoApi.canScrollPrev()}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 bg-card shadow-lg hidden md:flex"
                      onClick={() => emblaArriendoApi?.scrollNext()}
                      disabled={!emblaArriendoApi || !emblaArriendoApi.canScrollNext()}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </>
                )}

                <Carousel setApi={setEmblaArriendoApi}>
                  <CarouselContent className="-ml-4">
                    {arriendoPropiedades.map((property, idx) => (
                      <CarouselItem
                        key={property.id}
                        className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3"
                      >
                        <PropertyCard property={property} onClick={() => openModalFrom(arriendoPropiedades, idx)} />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>

                {arriendoPropiedades.length > visibleCards && (
                  <div className="flex justify-center gap-2 mt-6 md:hidden">
                    {Array.from({ length: emblaArriendoApi ? emblaArriendoApi.scrollSnapList().length : maxIndexArriendo + 1 }).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => emblaArriendoApi?.scrollTo(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          (emblaArriendoApi ? emblaArriendoApi.selectedScrollSnap() === index : index === currentIndex)
                            ? "bg-primary"
                            : "bg-primary/30"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Mobile navigation dots are shown per-catalog above */}
          </div>
        )}

        {/* Empty State */}
        {combinedCount === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No hay propiedades disponibles.</p>
          </div>
        )}
      </div>

      {/* Property Modal: pasamos la lista que abrió el modal y el índice seleccionado para navegación */}
      <PropertyModal
        properties={modalProperties}
        selectedIndex={selectedIndex}
        isOpen={isModalOpen}
        onClose={closeModal}
        onNavigate={(newIndex: number) => setSelectedIndex(newIndex)}
      />
    </section>
  )
}
