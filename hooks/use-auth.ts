"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.access_token) {
        localStorage.setItem('supabase_token', session.access_token)
      }
      setLoading(false)
    })

    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.access_token) {
        localStorage.setItem('supabase_token', session.access_token)
      } else {
        localStorage.removeItem('supabase_token')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    const safeEmail = email.trim()
    const safePassword = password.trim()

    if (!safeEmail || !safePassword) {
      throw new Error('Debes completar el correo y la contraseña')
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: safeEmail,
      password: safePassword,
    })

    if (error) throw error

    if (data.session) {
      localStorage.setItem('supabase_token', data.session.access_token)
    }

    return data
  }

  const logout = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('supabase_token')
  }

  return { user, loading, login, logout }
}
