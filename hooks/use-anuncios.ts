"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Anuncio } from '@/lib/types'
import { toast } from 'sonner'

interface UseAnunciosFilters {
  activo?: boolean
  destacadosOnly?: boolean
  limit?: number
}

function getNowIsoDate() {
  return new Date().toISOString()
}

function isAnuncioVigente(anuncio: Anuncio, nowIso: string): boolean {
  const started = !anuncio.fecha_inicio || anuncio.fecha_inicio <= nowIso
  const notExpired = !anuncio.fecha_fin || anuncio.fecha_fin >= nowIso
  return started && notExpired
}

export function useAnuncios(filters: UseAnunciosFilters = {}) {
  const [anuncios, setAnuncios] = useState<Anuncio[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAnuncios = async () => {
    setLoading(true)
    setError(null)

    try {
      let query = supabase.from('anuncios').select('*')

      if (filters.activo !== undefined) {
        query = query.eq('activo', filters.activo)
      }

      if (filters.destacadosOnly) {
        query = query.eq('destacado', true)
      }

      query = query
        .order('destacado', { ascending: false })
        .order('prioridad', { ascending: false })
        .order('created_at', { ascending: false })

      if (filters.limit) {
        query = query.limit(filters.limit)
      }

      const { data, error: fetchError } = await query

      if (fetchError) {
        setError(fetchError.message)
        setAnuncios([])
        return
      }

      const anunciosData = (data || []) as Anuncio[]

      if (filters.activo) {
        const nowIso = getNowIsoDate()
        setAnuncios(anunciosData.filter((item) => isAnuncioVigente(item, nowIso)))
      } else {
        setAnuncios(anunciosData)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      setAnuncios([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnuncios()
  }, [JSON.stringify(filters)])

  const createAnuncio = async (payload: Partial<Anuncio>) => {
    const { error: insertError } = await supabase.from('anuncios').insert(payload)
    if (insertError) {
      toast.error(insertError.message || 'No se pudo crear el anuncio')
      return false
    }
    toast.success('Anuncio creado')
    await fetchAnuncios()
    return true
  }

  const updateAnuncio = async (id: string, payload: Partial<Anuncio>) => {
    const { error: updateError } = await supabase.from('anuncios').update(payload).eq('id', id)
    if (updateError) {
      toast.error(updateError.message || 'No se pudo actualizar el anuncio')
      return false
    }
    toast.success('Anuncio actualizado')
    await fetchAnuncios()
    return true
  }

  const deleteAnuncio = async (id: string) => {
    const { error: deleteError } = await supabase.from('anuncios').delete().eq('id', id)
    if (deleteError) {
      toast.error(deleteError.message || 'No se pudo eliminar el anuncio')
      return false
    }
    toast.success('Anuncio eliminado')
    await fetchAnuncios()
    return true
  }

  return {
    anuncios,
    loading,
    error,
    refetch: fetchAnuncios,
    createAnuncio,
    updateAnuncio,
    deleteAnuncio,
  }
}
