export interface Property {
  id: number
  nombre: string
  categoria: "Vivienda" | "Apartamento" | "Local/Oficina" | "Lote"
  descripcion: string
  ubicacion: string
  precio: number
  alcobas: number
  baños: number
  parqueaderos: number
  metrosCuadrados: number
  fotos: string[]
  estado: "Disponible" | "Vendido" | "Reservado"
}

export const properties: Property[] = [
  {
    id: 1,
    nombre: "Casa Campestre Los Arrayanes",
    categoria: "Vivienda",
    descripcion:
      "Hermosa casa campestre con vista panorámica a las montañas. Acabados de lujo, cocina integral, zonas verdes amplias y ambiente tranquilo ideal para familias.",
    ubicacion: "Pasto, Nariño",
    precio: 450000000,
    alcobas: 4,
    baños: 3,
    parqueaderos: 2,
    metrosCuadrados: 280,
    fotos: ["/modern-country-house-exterior.png", "/luxury-living-room.png", "/modern-kitchen-island.png"],
    estado: "Disponible",
  },
  {
    id: 2,
    nombre: "Apartamento Centro Histórico",
    categoria: "Apartamento",
    descripcion:
      "Moderno apartamento en el corazón de la ciudad. Excelente ubicación cerca de centros comerciales, restaurantes y transporte público.",
    ubicacion: "Bogotá, Cundinamarca",
    precio: 320000000,
    alcobas: 3,
    baños: 2,
    parqueaderos: 1,
    metrosCuadrados: 95,
    fotos: ["/modern-apartment-exterior.png", "/modern-apartment-bedroom.png", "/apartment-balcony-city-view.png"],
    estado: "Disponible",
  },
  {
    id: 3,
    nombre: "Local Comercial Plaza Norte",
    categoria: "Local/Oficina",
    descripcion:
      "Amplio local comercial en zona de alto tráfico. Ideal para negocio de retail, restaurante o servicios. Incluye baño y área de bodega.",
    ubicacion: "Medellín, Antioquia",
    precio: 180000000,
    alcobas: 0,
    baños: 2,
    parqueaderos: 0,
    metrosCuadrados: 120,
    fotos: ["/commercial-retail-store-interior.jpg", "/modern-office-interior.png", "/modern-commercial-building.png"],
    estado: "Disponible",
  },
  {
    id: 4,
    nombre: "Lote Urbanizable Sector Norte",
    categoria: "Lote",
    descripcion:
      "Excelente lote urbanizable con todos los servicios públicos. Perfecto para proyecto de vivienda o inversión. Documentación al día.",
    ubicacion: "Cali, Valle del Cauca",
    precio: 250000000,
    alcobas: 0,
    baños: 0,
    parqueaderos: 0,
    metrosCuadrados: 500,
    fotos: ["/empty-land-lot-for-construction.jpg", "/residential-land-subdivision.jpg", "/building-lot-aerial-view.jpg"],
    estado: "Disponible",
  },
  {
    id: 5,
    nombre: "Casa Moderna Sector Exclusivo",
    categoria: "Vivienda",
    descripcion:
      "Espectacular casa de diseño contemporáneo en conjunto cerrado. Piscina privada, jardín, sistema de seguridad 24/7.",
    ubicacion: "Cartagena, Bolívar",
    precio: 890000000,
    alcobas: 5,
    baños: 4,
    parqueaderos: 3,
    metrosCuadrados: 450,
    fotos: ["/luxury-modern-house-with-pool.jpg", "/modern-master-bedroom-suite.jpg", "/luxury-home-garden.jpg"],
    estado: "Reservado",
  },
  {
    id: 6,
    nombre: "Apartamento Vista al Mar",
    categoria: "Apartamento",
    descripcion:
      "Apartamento de lujo con vista directa al mar. Acabados premium, cocina abierta, terraza amplia y amenidades del edificio.",
    ubicacion: "Santa Marta, Magdalena",
    precio: 520000000,
    alcobas: 2,
    baños: 2,
    parqueaderos: 1,
    metrosCuadrados: 85,
    fotos: ["/ocean-view-apartment-terrace.jpg", "/beachfront-condo-interior.jpg", "/modern-bathroom.png"],
    estado: "Disponible",
  },
  {
    id: 7,
    nombre: "Oficina Empresarial Torre Central",
    categoria: "Local/Oficina",
    descripcion:
      "Oficina ejecutiva en torre empresarial de prestigio. Aire acondicionado central, recepción compartida, sala de juntas.",
    ubicacion: "Bogotá, Cundinamarca",
    precio: 420000000,
    alcobas: 0,
    baños: 3,
    parqueaderos: 2,
    metrosCuadrados: 150,
    fotos: ["/modern-executive-office.jpg", "/corporate-meeting-room.png", "/office-building-lobby.png"],
    estado: "Disponible",
  },
  {
    id: 8,
    nombre: "Lote Campestre con Vista",
    categoria: "Lote",
    descripcion:
      "Hermoso lote campestre con vista a las montañas. Acceso pavimentado, agua y luz disponibles. Ideal para casa de descanso.",
    ubicacion: "Manizales, Caldas",
    precio: 180000000,
    alcobas: 0,
    baños: 0,
    parqueaderos: 0,
    metrosCuadrados: 1200,
    fotos: ["/mountain-view-land-lot.jpg", "/countryside-property-view.jpg", "/rural-land-for-sale.jpg"],
    estado: "Disponible",
  },
]

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}
