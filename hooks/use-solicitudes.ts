"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
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
      let query = supabase.from('solicitudes').select('*')

      // Aplicar filtros
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          // Ignorar parámetros de paginación para el filtro eq
          if (key !== 'limit' && key !== 'offset' && key !== 'order_by' && key !== 'order_dir') {
            query = query.eq(key, value)
          }
        }
      })

      // Ordenar por fecha de creación descendente
      query = query.order('created_at', { ascending: false })

      // Aplicar límite si existe
      if (filters.limit) {
        query = query.limit(filters.limit)
      }

      const { data, error: fetchError } = await query

      if (fetchError) {
        console.error('Error fetching solicitudes:', fetchError)
        setError(fetchError.message)
        setSolicitudes([])
      } else if (data) {
        setSolicitudes(data as Solicitud[])
        setTotal(data.length)
      } else {
        setSolicitudes([])
        setTotal(0)
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
      const { error } = await supabase
        .from('solicitudes')
        .update({ estado, updated_at: new Date().toISOString() })
        .eq('id', id)
      
      if (error) {
        console.error('Error updating estado:', error)
        toast.error(error.message || 'Error al actualizar estado')
        return false
      }
      
      toast.success('Estado actualizado correctamente')
      fetchSolicitudes()
      return true
    } catch (err) {
      console.error('Error updating estado:', err)
      toast.error('Error al actualizar estado')
      return false
    }
  }

  const deleteSolicitud = async (id: string) => {
    try {
      const { error } = await supabase
        .from('solicitudes')
        .delete()
        .eq('id', id)
      
      if (error) {
        console.error('Error deleting solicitud:', error)
        toast.error(error.message || 'Error al eliminar')
        return false
      }
      
      toast.success('Solicitud eliminada')
      fetchSolicitudes()
      return true
    } catch (err) {
      console.error('Error deleting solicitud:', err)
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
