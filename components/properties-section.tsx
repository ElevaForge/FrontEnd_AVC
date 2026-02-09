"use client"

import { useState, useEffect, useCallback } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { CategoryCard } from "./category-card"
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
import type { PropiedadCompleta, CategoriaPropiedad } from "@/lib/types"

type Category = CategoriaPropiedad

const categories: {
  title: string
  description: string
  icon: "vivienda" | "apartamento" | "local" | "lote"
  value: Category
}[] = [
  { title: "Vivienda", description: "Casas y casas campestres para tu familia", icon: "vivienda", value: "Vivienda" },
  {
    title: "Apartamento",
    description: "Apartamentos modernos y funcionales",
    icon: "apartamento",
    value: "Apartamento",
  },
  { title: "Local/Oficina", description: "Espacios comerciales y oficinas", icon: "local", value: "Local/Oficina" },
  { title: "Lotes/Finca", description: "Terrenos y fincas para construir tu proyecto", icon: "lote", value: "Lotes/Finca" },
]

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
  const [activeCategory, setActiveCategory] = useState<Category>("Vivienda")
  const [selectedProperty, setSelectedProperty] = useState<PropiedadCompleta | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [emblaApi, setEmblaApi] = useState<CarouselApi | null>(null)
  const visibleCards = useVisibleCards()
  
  // Fetch properties from backend (solo filtra por categoría, RLS se encarga de mostrar solo las activas)
  const { propiedades, loading } = usePropiedades({
    categoria: activeCategory,
  })
  
  const filteredProperties = propiedades || []

  // Calcular el índice máximo basado en tarjetas visibles
  const maxIndex = Math.max(0, filteredProperties.length - visibleCards)

  // Asegurar que currentIndex no exceda maxIndex cuando cambian las propiedades
  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex)
    }
  }, [currentIndex, maxIndex])

  // legacy currentIndex state kept for dots selection fallback; embla will handle scrolling

  const openModal = (property: PropiedadCompleta) => {
    setSelectedProperty(property)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedProperty(null)
  }

  // Reset index when category changes
  const handleCategoryChange = (category: Category) => {
    setActiveCategory(category)
    setCurrentIndex(0)
  }

  // Sync embla selected index with local currentIndex state for dots and fallbacks
  useEffect(() => {
    if (!emblaApi) return

    const onSelect = () => {
      try {
        const selected = emblaApi.selectedScrollSnap()
        setCurrentIndex(selected)
      } catch (e) {
        // ignore
      }
    }

    onSelect()
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)

    return () => {
      emblaApi.off('select', onSelect)
      emblaApi.off('reInit', onSelect)
    }
  }, [emblaApi])

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

        {/* Category Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {categories.map((category) => (
            <CategoryCard
              key={category.value}
              title={category.title}
              description={category.description}
              icon={category.icon}
              isActive={activeCategory === category.value}
              onClick={() => handleCategoryChange(category.value)}
            />
          ))}
        </div>

        {/* Properties Carousel */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="relative">
            {/* Navigation Buttons - Solo mostrar si hay más propiedades que las visibles */}
            {filteredProperties.length > visibleCards && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-card shadow-lg hidden md:flex"
                  onClick={() => emblaApi?.scrollPrev()}
                  disabled={!emblaApi || !emblaApi.canScrollPrev()}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 bg-card shadow-lg hidden md:flex"
                  onClick={() => emblaApi?.scrollNext()}
                  disabled={!emblaApi || !emblaApi.canScrollNext()}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </>
            )}

            {/* Carousel - Embla (swipe/drag enabled) */}
            <Carousel
              setApi={setEmblaApi}
              opts={{ align: 'start', containScroll: 'trimSnaps' }}
            >
              <CarouselContent className="gap-6 transition-transform duration-300 ease-in-out">
                {filteredProperties.map((property) => (
                  <CarouselItem
                    key={property.id}
                    className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
                  >
                    <PropertyCard property={property} onClick={() => openModal(property)} />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>

            {/* Mobile Navigation Dots - Solo mostrar si hay más propiedades que las visibles */}
            {filteredProperties.length > visibleCards && (
              <div className="flex justify-center gap-2 mt-6 md:hidden">
                {Array.from({ length: emblaApi ? emblaApi.scrollSnapList().length : maxIndex + 1 }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => emblaApi?.scrollTo(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      // highlight selected dot if embla available, fall back to currentIndex
                      (emblaApi ? emblaApi.selectedScrollSnap() === index : index === currentIndex)
                        ? "bg-primary"
                        : "bg-primary/30"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {filteredProperties.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No hay propiedades disponibles en esta categoría.</p>
          </div>
        )}
      </div>

      {/* Property Modal */}
      <PropertyModal property={selectedProperty} isOpen={isModalOpen} onClose={closeModal} />
    </section>
  )
}
