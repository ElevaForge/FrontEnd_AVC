"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { PropiedadCompleta, PropiedadesQuery, ImagenPropiedad } from '@/lib/types'

export function usePropiedades(filters: PropiedadesQuery = {}) {
  const [propiedades, setPropiedades] = useState<PropiedadCompleta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [refetchTrigger, setRefetchTrigger] = useState(0)

  useEffect(() => {
    async function fetchPropiedades() {
      setLoading(true)
      setError(null)

      try {
        // Construir la consulta con filtros simples (eq)
        let query = supabase.from('propiedades').select('*')

        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            query = query.eq(key, value as any)
          }
        })

        const { data, error } = await query.order('created_at', { ascending: false })

        if (error) {
          console.error('Supabase fetch error:', error)
          setError(error.message)
          setPropiedades([])
        } else if (data && data.length > 0) {
          // Obtener los IDs de las propiedades para cargar sus imágenes principales
          const propiedadIds = data.map((p: any) => p.id)
          
          // Cargar todas las imágenes principales en una sola consulta
          const { data: imagenes, error: imgError } = await supabase
            .from('imagenes_propiedad')
            .select('*')
            .in('propiedad_id', propiedadIds)
            .eq('es_principal', true)

          // Crear un mapa de propiedad_id -> imagen principal
          const imagenPrincipalMap: Record<string, string> = {}
          if (!imgError && imagenes) {
            imagenes.forEach((img: ImagenPropiedad) => {
              imagenPrincipalMap[img.propiedad_id] = img.url
            })
          }

          // Si no hay imagen principal, buscar la primera imagen por orden
          const propiedadesSinImagen = propiedadIds.filter((id: string) => !imagenPrincipalMap[id])
          if (propiedadesSinImagen.length > 0) {
            const { data: primerasImagenes } = await supabase
              .from('imagenes_propiedad')
              .select('*')
              .in('propiedad_id', propiedadesSinImagen)
              .order('orden', { ascending: true })

            if (primerasImagenes) {
              // Solo tomar la primera imagen de cada propiedad
              primerasImagenes.forEach((img: ImagenPropiedad) => {
                if (!imagenPrincipalMap[img.propiedad_id]) {
                  imagenPrincipalMap[img.propiedad_id] = img.url
                }
              })
            }
          }

          // Combinar propiedades con sus imágenes principales
          const propiedadesConImagenes = data.map((p: any) => ({
            ...p,
            imagen_principal: imagenPrincipalMap[p.id] || null
          }))

          setPropiedades(propiedadesConImagenes as PropiedadCompleta[])
          setTotal(propiedadesConImagenes.length)
        } else {
          setPropiedades([])
          setTotal(0)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
        setPropiedades([])
      } finally {
        setLoading(false)
      }
    }

    fetchPropiedades()
  }, [JSON.stringify(filters), refetchTrigger])

  const refetch = () => {
    setRefetchTrigger(prev => prev + 1)
  }

  return { propiedades, loading, error, total, refetch }
}
