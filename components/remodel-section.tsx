"use client"

import { Paintbrush, Hammer, Ruler, Lightbulb } from "lucide-react"
import { ContactForm } from "./contact-form"

const benefits = [
  { icon: Paintbrush, text: "Diseños personalizados según tu estilo" },
  { icon: Hammer, text: "Mano de obra calificada y profesional" },
  { icon: Ruler, text: "Presupuestos detallados sin sorpresas" },
  { icon: Lightbulb, text: "Asesoría integral en cada paso" },
]

const projectImages = [
  "/modern-kitchen-renovation.png",
  "/bathroom-remodel-modern.jpg",
  "/living-room-renovation.png",
  "/bedroom-makeover-design.jpg",
]

export function RemodelSection() {
  return (
    <section id="remodelar" className="py-20 bg-muted">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Transforma tu <span className="text-secondary">Espacio</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Hacemos realidad la renovación que siempre soñaste con calidad y compromiso
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Column - Info */}
          <div className="space-y-8">
            {/* Benefits List */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-foreground mb-4">¿Por qué elegirnos?</h3>
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="p-3 bg-secondary/10 rounded-lg">
                    <benefit.icon className="h-6 w-6 text-secondary" />
                  </div>
                  <span className="text-foreground">{benefit.text}</span>
                </div>
              ))}
            </div>

            {/* Project Gallery */}
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Proyectos Realizados</h3>
              <div className="grid grid-cols-2 gap-4">
                {projectImages.map((src, index) => (
                  <div
                    key={index}
                    className="relative aspect-square rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow"
                  >
                    <img
                      src={src || "/placeholder.svg"}
                      alt={`Proyecto de remodelación ${index + 1} realizado por AVC Inmobiliaria - Ejemplo de renovación de espacios en Colombia`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="bg-card rounded-2xl shadow-xl p-6 md:p-8">
            <h3 className="text-xl font-semibold text-card-foreground mb-6">Solicita una visita gratuita</h3>
            <ContactForm type="remodelacion" />
          </div>
        </div>
      </div>
    </section>
  )
}
