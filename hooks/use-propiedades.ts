"use client"

import { useState, useEffect } from 'react'
import { apiGet } from '@/lib/api'
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
        // Construir query params
        const params = new URLSearchParams()
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, String(value))
          }
        })

        const endpoint = `/propiedades${params.toString() ? `?${params.toString()}` : ''}`
        const response = await apiGet<PropiedadCompleta[]>(endpoint)

        if (response.success && response.data) {
          setPropiedades(response.data)
          // Extraer total del mensaje si está disponible
          if (response.message && response.message.startsWith('Total:')) {
            const totalStr = response.message.replace('Total:', '').trim()
            setTotal(parseInt(totalStr) || 0)
          } else {
            setTotal(response.data.length)
          }
        } else {
          setError(response.error || 'Error al cargar propiedades')
          setPropiedades([])
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
