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
    <footer className="bg-primary text-primary-foreground w-full">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Column 1 - Logo & Slogan */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-lg flex items-center justify-center p-1.5 sm:p-2">
                <img
                  src="/Logo.svg"
                  alt="AVC Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg">AVC</h3>
                <p className="text-xs sm:text-sm text-primary-foreground/70">Inmobiliaria y Constructora</p>
              </div>
            </div>
            <p className="text-sm sm:text-base text-primary-foreground/80 leading-relaxed max-w-md">
              Soluciones sólidas para tus proyectos de vida. Tu socio de confianza en el mercado inmobiliario
              colombiano.
            </p>
          </div>

          {/* Column 2 - Quick Links */}
          <div>
            <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2 sm:space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    onClick={(e) => scrollToSection(e, link.href)}
                    className="text-sm sm:text-base text-primary-foreground/80 hover:text-secondary transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 - Contact Info */}
          <div>
            <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">Contáctanos</h3>
            <ul className="space-y-2 sm:space-y-3">
              <li className="flex items-start gap-2 sm:gap-3">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-secondary flex-shrink-0 mt-0.5" />
                <span className="text-sm sm:text-base text-primary-foreground/80">Mz 4 cs 1 Villa Aurora, Pasto, Nariño, Colombia</span>
              </li>
              <li className="flex items-center gap-2 sm:gap-3">
                <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-secondary flex-shrink-0" />
                <a
                  href="https://wa.me/573117284320"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm sm:text-base text-primary-foreground/80 hover:text-secondary transition-colors"
                >
                  +57 311 7284320
                </a>
              </li>
              <li className="flex items-center gap-2 sm:gap-3">
                <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-secondary flex-shrink-0" />
                <a
                  href="mailto:avcinmobiliariayconstructora@gmail.com"
                  className="text-sm sm:text-base text-primary-foreground/80 hover:text-secondary transition-colors break-all sm:break-normal"
                >
                  avcinmobiliariayconstructora@gmail.com
                </a>
              </li>
            </ul>

            {/* Social Links */}
            <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-6">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-9 h-9 sm:w-10 sm:h-10 bg-secondary rounded-full flex items-center justify-center hover:bg-secondary/80 transition-colors"
                >
                  <social.icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-primary-foreground/20 mt-8 sm:mt-10 pt-4 sm:pt-6 text-center">
          <p className="text-xs sm:text-sm text-primary-foreground/60">
            © {new Date().getFullYear()} AVC Inmobiliaria y Constructora. Todos los derechos reservados. Un producto de ElevaForge.
          </p>
        </div>
      </div>
    </footer>
  )
}
