"use client"

import type React from "react"

import { MapPin, Phone, Mail, Facebook, Instagram, Linkedin, Twitter } from "lucide-react"

const quickLinks = [
  { label: "Comprar", href: "#comprar" },
  { label: "Remodelar", href: "#remodelar" },
  { label: "Vender", href: "#vender" },
]

const socialLinks = [
  { icon: Facebook, href: "https://www.facebook.com/avcinmobiliariayconstructora/", label: "Facebook" },
]

export function Footer() {
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault()
      const element = document.getElementById(href.slice(1))
      if (element) {
        element.scrollIntoView({ behavior: "smooth" })
      }
    }
  }

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Column 1 - Logo & Slogan */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center p-2">
                <img src="/Logo.svg" alt="AVC Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="font-bold text-lg">AVC</h3>
                <p className="text-sm text-primary-foreground/70">Inmobiliaria y Constructora</p>
              </div>
            </div>
            <p className="text-primary-foreground/80 leading-relaxed">
              Soluciones sólidas para tus proyectos de vida. Tu socio de confianza en el mercado inmobiliario
              colombiano.
            </p>
          </div>

          {/* Column 2 - Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    onClick={(e) => scrollToSection(e, link.href)}
                    className="text-primary-foreground/80 hover:text-secondary transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 - Contact Info */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contáctanos</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
                <span className="text-primary-foreground/80">Mz 4 cs 1 Villa Aurora, Pasto, Nariño, Colombia</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-secondary flex-shrink-0" />
                <a
                  href="https://wa.me/573117284320"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-foreground/80 hover:text-secondary transition-colors"
                >
                  +57 311 7284320
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-secondary flex-shrink-0" />
                <a
                  href="mailto:avcinmobiliariayconstructora@gmail.com"
                  className="text-primary-foreground/80 hover:text-secondary transition-colors"
                >
                  avcinmobiliariayconstructora@gmail.com
                </a>
              </li>
            </ul>

            {/* Social Links */}
            <div className="flex gap-3 mt-6">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center hover:bg-secondary/80 transition-colors"
                >
                  <social.icon className="h-5 w-5 text-white" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-primary-foreground/20 mt-10 pt-6 text-center">
          <p className="text-sm text-primary-foreground/60">
            © {new Date().getFullYear()} AVC Inmobiliaria y Constructora. Todos los derechos reservados. Un producto de ElevaForge.
          </p>
        </div>
      </div>
    </footer>
  )
}
