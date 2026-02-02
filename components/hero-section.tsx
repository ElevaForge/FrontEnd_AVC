"use client"

import { Home, Wrench, Tag, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-primary to-[#1a1f3a] text-primary-foreground overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        {/* Logo */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-3">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-xl flex items-center justify-center shadow-lg p-2">
              <img
                src="/Logo.svg"
                alt="Logo de AVC Inmobiliaria y Constructora - Servicios inmobiliarios en Pasto y Colombia"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          <p className="mt-4 text-sm md:text-base text-primary-foreground/80 tracking-widest uppercase">
            Inmobiliaria y Constructora
          </p>
        </div>

        {/* Main Title */}
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 text-balance leading-tight">
          Soluciones sólidas para tus <span className="text-secondary">proyectos de vida</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-12">
          Tu socio de confianza en el mercado inmobiliario. Compra, vende o remodela con expertos que te acompañan en
          cada paso.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            onClick={() => scrollToSection("comprar")}
            size="lg"
            className="bg-secondary hover:bg-secondary/90 text-white px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 w-full sm:w-auto"
          >
            <Home className="mr-2 h-5 w-5" />
            Comprar Propiedad
          </Button>

          <Button
            onClick={() => scrollToSection("remodelar")}
            size="lg"
            variant="outline"
            className="border-2 border-white/30 bg-white/10 hover:bg-secondary hover:border-secondary text-white px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 w-full sm:w-auto"
          >
            <Wrench className="mr-2 h-5 w-5" />
            Remodelar
          </Button>

          <Button
            onClick={() => scrollToSection("vender")}
            size="lg"
            variant="outline"
            className="border-2 border-white/30 bg-white/10 hover:bg-secondary hover:border-secondary text-white px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 w-full sm:w-auto"
          >
            <Tag className="mr-2 h-5 w-5" />
            Vender Propiedad
          </Button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ChevronDown className="h-8 w-8 text-primary-foreground/60" />
      </div>
    </section>
  )
}
