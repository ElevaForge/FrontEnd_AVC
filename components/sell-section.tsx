"use client"

import { FileCheck, Search, Handshake, BadgeDollarSign, Quote } from "lucide-react"
import { ContactForm } from "./contact-form"

const steps = [
  { icon: FileCheck, title: "Evaluación", description: "Valoramos tu propiedad de forma gratuita" },
  { icon: Search, title: "Marketing", description: "Publicamos en las mejores plataformas" },
  { icon: Handshake, title: "Negociación", description: "Gestionamos ofertas y visitas" },
  { icon: BadgeDollarSign, title: "Cierre", description: "Acompañamiento legal completo" },
]

const testimonials = [
  {
    name: "María González",
    location: "Barrio El Bosque, Pasto",
    text: "Vendí mi apartamento en tiempo récord. El equipo de AVC fue profesional y transparente en todo momento.",
    rating: 5,
  },
  {
    name: "Carlos Rodríguez",
    location: "Barrio Laureles, Pasto",
    text: "Excelente servicio. Me ayudaron a obtener el mejor precio por mi casa. Los recomiendo totalmente.",
    rating: 5,
  },
  {
    name: "Ana Martínez",
    location: "Barrio Santa Barbara, Pasto",
    text: "El proceso fue muy sencillo. Siempre estuvieron disponibles para resolver mis dudas.",
    rating: 5,
  },
]

export function SellSection() {
  return (
    <section id="vender" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Vende tu Propiedad <span className="text-secondary">con Nosotros</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Te acompañamos en cada paso para que obtengas el mejor valor por tu propiedad
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Column - Info */}
          <div className="space-y-10">
            {/* Process Timeline */}
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-6">Nuestro Proceso</h3>
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

                {steps.map((step, index) => (
                  <div key={index} className="relative flex gap-6 pb-8 last:pb-0">
                    {/* Icon Circle */}
                    <div className="relative z-10 flex-shrink-0 w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg">
                      <step.icon className="h-6 w-6 text-primary-foreground" />
                    </div>

                    {/* Content */}
                    <div className="pt-1">
                      <h4 className="font-semibold text-foreground mb-1">{step.title}</h4>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Testimonials */}
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-6">Lo que dicen nuestros clientes</h3>
              <div className="space-y-4">
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="bg-card p-5 rounded-xl shadow-md border border-border">
                    <Quote className="h-6 w-6 text-secondary mb-3" />
                    <p className="text-card-foreground mb-3 italic">"{testimonial.text}"</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-card-foreground">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                      </div>
                      <div className="flex gap-1">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="bg-card rounded-2xl shadow-xl p-6 md:p-8">
            <h3 className="text-xl font-semibold text-card-foreground mb-6">Solicita una valoración gratuita</h3>
            <ContactForm type="venta" />
          </div>
        </div>
      </div>
    </section>
  )
}
