import { createClient } from '@supabase/supabase-js'
import type { TipoArchivo, MultimediaUploadResult, MultimediaUploadError } from './types'

// Default to the known Supabase project URL if env var is not provided
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bjvzasgfdxlsgvaizrli.supabase.co'
// WARNING: anon key in source — only for local/testing when you chose not to use env vars.
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqdnphc2dmZHhsc2d2YWl6cmxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5NTYwMzYsImV4cCI6MjA4NDUzMjAzNn0.tJl5zlW3zHhaGnMGjExnM5ll7M9WU6Ds46QKW1p9O_M'

if (!supabaseAnonKey) {
  console.warn('NEXT_PUBLIC_SUPABASE_ANON_KEY no está disponible. Algunas funciones pueden fallar.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

const BUCKET_NAME = 'propiedades-imagenes'

/**
 * Detects if a file is an image or video based on its MIME type.
 * @param mimeType - The MIME type of the file (e.g., "image/png", "video/mp4")
 * @returns 'image' | 'video' | null if type is not recognized
 */
export function detectFileType(mimeType: string): TipoArchivo | null {
  if (mimeType.startsWith('image/')) {
    return 'image'
  }
  if (mimeType.startsWith('video/')) {
    return 'video'
  }
  return null
}

/**
 * Uploads a multimedia file to Supabase Storage and registers it in the database.
 * 
 * @param file - The file to upload (File object)
 * @param propertyId - The UUID of the property to associate the file with
 * @param esPrincipal - Whether this is the main/principal image (default: false)
 * @returns Promise with the upload result or error
 * 
 * The function performs the following operations:
 * 1. Validates the file type (must be image or video)
 * 2. Uploads the file to Storage bucket 'propiedades-imagenes' with path: ${propertyId}/${timestamp}_${filename}
 * 3. Gets the public URL for the uploaded file
 * 4. Inserts a record in 'imagenes_propiedad' table
 * 5. If database insert fails, automatically deletes the uploaded file (rollback)
 */
export async function uploadMultimedia(
  file: File,
  propertyId: string,
  esPrincipal: boolean = false
): Promise<{ data: MultimediaUploadResult | null; error: MultimediaUploadError | null }> {
  // Detect file type from MIME type
  const tipoArchivo = detectFileType(file.type)
  
  if (!tipoArchivo) {
    return {
      data: null,
      error: {
        message: `Invalid file type: ${file.type}. Only images and videos are allowed.`,
        code: 'INVALID_FILE_TYPE'
      }
    }
  }

  // Build the file path: ${propertyId}/${timestamp}_${filename}
  const timestamp = Date.now()
  const filePath = `${propertyId}/${timestamp}_${file.name}`

  // Step 1: Upload file to Storage
  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file)

  if (uploadError) {
    return {
      data: null,
      error: {
        message: `Failed to upload file: ${uploadError.message}`,
        code: 'UPLOAD_FAILED'
      }
    }
  }

  // Step 2: Get public URL
  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath)

  if (!urlData?.publicUrl) {
    // Rollback: delete the uploaded file
    await supabase.storage.from(BUCKET_NAME).remove([filePath])
    return {
      data: null,
      error: {
        message: 'Failed to get public URL for uploaded file',
        code: 'URL_FAILED'
      }
    }
  }

  // Step 3: Insert record in database
  const { data: insertData, error: insertError } = await supabase
    .from('imagenes_propiedad')
    .insert({
      propiedad_id: propertyId,
      url: urlData.publicUrl,
      tipo_archivo: tipoArchivo,
      es_principal: esPrincipal
    })
    .select('id, propiedad_id, url, tipo_archivo, es_principal')
    .single()

  if (insertError) {
    // Rollback: delete the uploaded file since DB insert failed
    await supabase.storage.from(BUCKET_NAME).remove([filePath])
    return {
      data: null,
      error: {
        message: `Failed to insert record in database: ${insertError.message}`,
        code: 'INSERT_FAILED'
      }
    }
  }

  return {
    data: insertData as MultimediaUploadResult,
    error: null
  }
}
