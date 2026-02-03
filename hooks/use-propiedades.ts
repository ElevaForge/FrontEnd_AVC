"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { PropiedadCompleta, PropiedadesQuery } from '@/lib/types'

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
        } else if (data) {
          setPropiedades(data as PropiedadCompleta[])
          setTotal((data as any).length || 0)
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
