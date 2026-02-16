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
        <link rel="canonical" href="https://www.avcinmobiliaria.com" />
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
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            function serializeError(err){
              try{ return { message: err && err.message, stack: err && err.stack, name: err && err.name } }catch(e){ return { message: String(err) } }
            }
            window.__client_last_error = null;
            // Capture JS runtime errors
            window.addEventListener('error', function(e){
              try{
                var info = serializeError(e.error || e.message || 'Unknown error');
                console.error('Global error captured:', info);
                window.__client_last_error = info;
              }catch(err){ console.error('Error serializing global error', err) }
            });
            // Capture unhandled promise rejections
            window.addEventListener('unhandledrejection', function(e){
              try{
                var reason = e.reason || 'Unhandled rejection';
                var info = serializeError(reason);
                console.error('Unhandled rejection captured:', info);
                window.__client_last_error = info;
              }catch(err){ console.error('Error serializing rejection', err) }
            });

            // Global media fallback: replace missing images with a placeholder
            function handleMediaError(ev){
              try{
                var t = ev.target || ev.srcElement;
                if (!t) return;
                var tag = (t.tagName || '').toLowerCase();
                if (tag === 'img'){
                  if (!t.__replaced_with_placeholder) {
                    t.__replaced_with_placeholder = true;
                    t.src = '/placeholder.svg';
                    t.removeAttribute('srcset');
                  }
                } else if (tag === 'video'){
                  if (!t.__handled_video_error) {
                    t.__handled_video_error = true;
                    // hide the broken video and optionally show a poster
                    t.style.display = 'none';
                    var p = document.createElement('img');
                    p.src = '/placeholder.svg';
                    p.alt = 'Media no disponible';
                    p.className = t.className || '';
                    t.parentNode && t.parentNode.insertBefore(p, t);
                  }
                }
              } catch (err){ console.warn('Error handling media fallback', err) }
            }

            // Use capture to catch load errors from descendants
            document.addEventListener('error', handleMediaError, true);
          })();
        `}} />
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
