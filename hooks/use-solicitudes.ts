"use client"

import { useState, useEffect } from 'react'
import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from '@/lib/api'
import type { Solicitud, SolicitudesQuery } from '@/lib/types'
import { toast } from 'sonner'

export function useSolicitudes(filters: SolicitudesQuery = {}) {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)

  const fetchSolicitudes = async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value))
        }
      })

      const endpoint = `/solicitudes${params.toString() ? `?${params.toString()}` : ''}`
      const response = await apiGet<Solicitud[]>(endpoint)

      if (response.success && response.data) {
        setSolicitudes(response.data)
        if (response.message && response.message.startsWith('Total:')) {
          const totalStr = response.message.replace('Total:', '').trim()
          setTotal(parseInt(totalStr) || 0)
        } else {
          setTotal(response.data.length)
        }
      } else {
        setError(response.error || 'Error al cargar solicitudes')
        setSolicitudes([])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      setSolicitudes([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSolicitudes()
  }, [JSON.stringify(filters)])

  const updateEstado = async (id: string, estado: string) => {
    try {
      const response = await apiPatch(`/solicitudes/${id}/estado`, { estado })
      
      if (response.success) {
        toast.success('Estado actualizado correctamente')
        fetchSolicitudes()
        return true
      } else {
        toast.error(response.error || 'Error al actualizar estado')
        return false
      }
    } catch (err) {
      toast.error('Error al actualizar estado')
      return false
    }
  }

  const deleteSolicitud = async (id: string) => {
    try {
      const response = await apiDelete(`/solicitudes/${id}`)
      
      if (response.success) {
        toast.success('Solicitud eliminada')
        fetchSolicitudes()
        return true
      } else {
        toast.error(response.error || 'Error al eliminar')
        return false
      }
    } catch (err) {
      toast.error('Error al eliminar')
      return false
    }
  }

  return {
    solicitudes,
    loading,
    error,
    total,
    refetch: fetchSolicitudes,
    updateEstado,
    deleteSolicitud,
  }
}
