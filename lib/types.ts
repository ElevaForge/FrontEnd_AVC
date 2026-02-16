/**
 * Tipos para la integración con el backend
 */

// Enums
// Se simplifica categoría para soportar un único catálogo (valor libre)
export type CategoriaPropiedad = string
export type TipoAccion = 'Venta' | 'Arriendo'
export type EstadoPropiedad = 'Disponible' | 'Vendida' | 'Arrendada' | 'Reservada'
export type TipoSolicitud = 'Informacion' | 'Visita' | 'Remodelacion' | 'Venta'
export type EstadoSolicitud = 'Pendiente' | 'Contactado' | 'En_Proceso' | 'Completado' | 'Cancelado'
export type TipoArchivo = 'image' | 'video'

// Propiedad
export interface Propiedad {
  id: string
  codigo: string | null
  nombre: string
  categoria: CategoriaPropiedad
  descripcion: string
  zona_id: string | null
  direccion: string
  latitud: number | null
  longitud: number | null
  tipo_accion: TipoAccion
  precio: number
  precio_administracion: number
  alcobas: number
  banos: number
  parqueaderos: number
  metros_cuadrados: number
  metros_construidos: number | null
  estrato: number | null
  ano_construccion: number | null
  piso: number | null
  estado: EstadoPropiedad
  destacada: boolean
  activo: boolean
  created_at: string
  updated_at: string
}

export interface PropiedadCompleta extends Propiedad {
  zona_nombre: string | null
  ciudad: string | null
  departamento: string | null
  imagen_principal: string | null
  total_imagenes: number
  total_solicitudes: number
  total_favoritos: number
  caracteristicas: string[] | null
  amenidades: string[] | null
  imagenes?: ImagenPropiedad[]
}

// Imagen
export interface ImagenPropiedad {
  id: string
  propiedad_id: string
  url: string
  url_thumbnail: string | null
  titulo: string | null
  descripcion: string | null
  orden: number
  es_principal: boolean
  created_at: string
}

// Solicitud
export interface Solicitud {
  id: string
  propiedad_id: string | null
  tipo: TipoSolicitud
  tipo_servicio: string
  nombre_persona: string
  email: string | null
  telefono: string
  ubicacion: string | null
  descripcion: string
  fecha_visita_preferida: string | null
  hora_preferida: string | null
  presupuesto_estimado: number | null
  estado: EstadoSolicitud
  notas_internas: string | null
  atendida_por: string | null
  fecha_contacto: string | null
  fecha_completado: string | null
  created_at: string
  updated_at: string
}

// Catalogos
export interface Zona {
  id: string
  nombre: string
  ciudad: string
  departamento: string
  descripcion: string | null
  activo: boolean
}

export interface Caracteristica {
  id: string
  nombre: string
  descripcion: string | null
  activo: boolean
  categoria: string
}

export interface Amenidad {
  id: string
  nombre: string
  descripcion: string | null
  activo: boolean
  categoria: string
}

// Query types
export interface PropiedadesQuery {
  categoria?: CategoriaPropiedad
  tipo_accion?: TipoAccion
  estado?: EstadoPropiedad
  zona_id?: string
  ciudad?: string
  precio_min?: number
  precio_max?: number
  alcobas_min?: number
  banos_min?: number
  metros_min?: number
  metros_max?: number
  destacada?: boolean
  limit?: number
  offset?: number
  order_by?: 'precio' | 'metros_cuadrados' | 'created_at' | 'alcobas'
  order_dir?: 'asc' | 'desc'
}

export interface SolicitudesQuery {
  tipo?: TipoSolicitud
  estado?: EstadoSolicitud
  propiedad_id?: string
  atendida_por?: string
  fecha_desde?: string
  fecha_hasta?: string
  limit?: number
  offset?: number
}

// Forms
export interface SolicitudInformacionForm {
  propiedad_id: string
  nombre_persona: string
  email: string
  telefono: string
  descripcion: string
}

export interface SolicitudVisitaForm {
  propiedad_id: string
  nombre_persona: string
  email: string
  telefono: string
  descripcion: string
  fecha_visita_preferida: string
  hora_preferida: string
}

export interface SolicitudRemodelacionForm {
  nombre_persona: string
  email: string
  telefono: string
  ubicacion: string
  descripcion: string
  presupuesto_estimado?: number
}

export interface SolicitudVentaForm {
  nombre_persona: string
  email: string
  telefono: string
  ubicacion: string
  descripcion: string
  presupuesto_estimado?: number
}

export interface PropiedadCreateForm {
  nombre: string
  categoria: CategoriaPropiedad
  descripcion: string
  zona_id?: string
  direccion: string
  latitud?: number
  longitud?: number
  tipo_accion: TipoAccion
  precio: number
  precio_administracion?: number
  alcobas: number
  banos: number
  parqueaderos: number
  metros_cuadrados: number
  metros_construidos?: number
  estrato?: number
  ano_construccion?: number
  piso?: number
  estado: EstadoPropiedad
  destacada?: boolean
  caracteristicas_ids?: string[]
  amenidades_ids?: string[]
}

// Multimedia upload
export interface MultimediaUploadResult {
  id: string
  propiedad_id: string
  url: string
  tipo_archivo: TipoArchivo
  es_principal: boolean
}

export interface MultimediaUploadError {
  message: string
  code: 'UPLOAD_FAILED' | 'URL_FAILED' | 'INSERT_FAILED' | 'INVALID_FILE_TYPE'
}
