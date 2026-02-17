import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseUrl) {
  console.error('⚠️ NEXT_PUBLIC_SUPABASE_URL no está configurada')
}

if (!serviceRoleKey) {
  console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY no está configurada. La API admin no funcionará sin ella.')
}

export const HAS_SERVICE_ROLE = Boolean(serviceRoleKey && supabaseUrl)

// Solo crear el cliente si tenemos las credenciales necesarias
export const supabaseAdmin: SupabaseClient = HAS_SERVICE_ROLE 
  ? createClient(supabaseUrl, serviceRoleKey)
  : createClient(supabaseUrl || 'https://placeholder.supabase.co', 'placeholder-key')

export const BUCKET_NAME = 'propiedades-imagenes'
