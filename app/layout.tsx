import type React from "react"
import type { Metadata } from "next"
import { Poppins, Inter } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
})

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "AVC Inmobiliaria y Constructora | Soluciones sólidas para tus proyectos de vida",
  description:
    "Compra, vende y remodela propiedades con AVC Inmobiliaria y Constructora. Tu socio de confianza en el mercado inmobiliario colombiano. Servicios en Pasto, Nariño y más.",
  keywords: "inmobiliaria Pasto, venta propiedades Colombia, remodelación casas, constructor Nariño, compra apartamento Bogotá, lote urbanizable",
  generator: 'v0.app',
  icons: {
    icon: '/Logo.svg',
    shortcut: '/Logo.svg',
    apple: '/Logo.svg',
  },
  openGraph: {
    title: "AVC Inmobiliaria y Constructora | Soluciones sólidas para tus proyectos de vida",
    description: "Compra, vende y remodela propiedades con AVC. Servicios inmobiliarios en Colombia, especialidad en Pasto y Nariño.",
    url: "https://www.avcinmobiliaria.com", // Reemplaza con la URL real
    siteName: "AVC Inmobiliaria y Constructora",
    images: [
      {
        url: "/Logo.svg",
        width: 1200,
        height: 630,
        alt: "Logo de AVC Inmobiliaria y Constructora",
      },
    ],
    locale: "es_CO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AVC Inmobiliaria y Constructora | Soluciones sólidas para tus proyectos de vida",
    description: "Compra, vende y remodela propiedades con AVC. Servicios inmobiliarios en Colombia.",
    images: ["/Logo.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: "https://www.avcinmobiliaria.com", // Reemplaza con la URL real
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "RealEstateAgent",
              "name": "AVC Inmobiliaria y Constructora",
              "description": "Soluciones sólidas para tus proyectos de vida. Compra, vende y remodela propiedades en Colombia.",
              "url": "https://www.avcinmobiliaria.com",
              "logo": "https://www.avcinmobiliaria.com/Logo.svg",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Mz 4 cs 1 Villa Aurora",
                "addressLocality": "Pasto",
                "addressRegion": "Nariño",
                "addressCountry": "CO"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+57-311-7284320",
                "contactType": "customer service",
                "email": "avcinmobiliariayconstructora@gmail.com"
              },
              "sameAs": [
                "https://www.facebook.com/avcinmobiliariayconstructora/"
              ]
            }),
          }}
        />
      </head>
      <body className={`${poppins.variable} ${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
