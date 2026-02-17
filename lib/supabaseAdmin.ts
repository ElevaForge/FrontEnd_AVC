import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bjvzasgfdxlsgvaizrli.supabase.co'
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!serviceRoleKey) {
  console.warn('SUPABASE_SERVICE_ROLE_KEY no está configurada. La API admin no funcionará en producción sin ella.')
}

export const HAS_SERVICE_ROLE = Boolean(serviceRoleKey)
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

export const BUCKET_NAME = 'propiedades-imagenes'
