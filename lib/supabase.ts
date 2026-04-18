import { createClient } from '@supabase/supabase-js'
import type { TipoArchivo, MultimediaUploadResult, MultimediaUploadError } from './types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const SUPABASE_STORAGE_OBJECT_SEGMENT = '/storage/v1/object/'

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️ Faltan variables de entorno: NEXT_PUBLIC_SUPABASE_URL y/o NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

const BUCKET_NAME = 'propiedades-imagenes'

export const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024
export const MAX_VIDEO_SIZE_BYTES = 80 * 1024 * 1024

export const ALLOWED_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
])

export const ALLOWED_VIDEO_MIME_TYPES = new Set([
  'video/mp4',
  'video/webm',
  'video/quicktime',
])

function sanitizeFileName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9._-]/g, '')
    .replace(/-+/g, '-')
}

export function validateMultimediaFile(
  file: File,
): { valid: true } | { valid: false; code: MultimediaUploadError['code']; message: string } {
  const tipoArchivo = detectFileType(file.type)

  if (!tipoArchivo) {
    return {
      valid: false,
      code: 'INVALID_FILE_TYPE',
      message: `Tipo de archivo inválido: ${file.type}`,
    }
  }

  if (tipoArchivo === 'image' && !ALLOWED_IMAGE_MIME_TYPES.has(file.type)) {
    return {
      valid: false,
      code: 'UNSUPPORTED_MIME_TYPE',
      message: `Formato de imagen no permitido: ${file.type}`,
    }
  }

  if (tipoArchivo === 'video' && !ALLOWED_VIDEO_MIME_TYPES.has(file.type)) {
    return {
      valid: false,
      code: 'UNSUPPORTED_MIME_TYPE',
      message: `Formato de video no permitido: ${file.type}`,
    }
  }

  const maxSize = tipoArchivo === 'image' ? MAX_IMAGE_SIZE_BYTES : MAX_VIDEO_SIZE_BYTES
  if (file.size > maxSize) {
    return {
      valid: false,
      code: 'FILE_TOO_LARGE',
      message: `Archivo demasiado grande. Límite: ${tipoArchivo === 'image' ? '8MB' : '80MB'}`,
    }
  }

  return { valid: true }
}

function buildStoragePath(folder: string, fileName: string): string {
  const timestamp = Date.now()
  return `${folder}/${timestamp}_${sanitizeFileName(fileName)}`
}

export function normalizeSupabaseStorageUrl(value: string | null | undefined, bucketName: string = BUCKET_NAME): string {
  const rawValue = String(value || '').trim()

  if (!rawValue) {
    return ''
  }

  if (/^https?:\/\//i.test(rawValue)) {
    try {
      const parsedUrl = new URL(rawValue)

      if (parsedUrl.pathname.includes(`${SUPABASE_STORAGE_OBJECT_SEGMENT}public/`)) {
        return rawValue
      }

      if (parsedUrl.pathname.includes(SUPABASE_STORAGE_OBJECT_SEGMENT)) {
        parsedUrl.pathname = parsedUrl.pathname.replace(
          SUPABASE_STORAGE_OBJECT_SEGMENT,
          `${SUPABASE_STORAGE_OBJECT_SEGMENT}public/`,
        )
        return parsedUrl.toString()
      }

      return rawValue
    } catch {
      return rawValue
    }
  }

  if (rawValue.startsWith(SUPABASE_STORAGE_OBJECT_SEGMENT)) {
    return `${supabaseUrl}${rawValue.replace(SUPABASE_STORAGE_OBJECT_SEGMENT, `${SUPABASE_STORAGE_OBJECT_SEGMENT}public/`)}`
  }

  if (rawValue.startsWith(`${bucketName}/`)) {
    return `${supabaseUrl}${SUPABASE_STORAGE_OBJECT_SEGMENT}public/${rawValue}`
  }

  if (rawValue.startsWith('/')) {
    return `${supabaseUrl}${rawValue}`
  }

  return `${supabaseUrl}${SUPABASE_STORAGE_OBJECT_SEGMENT}public/${bucketName}/${rawValue}`
}

export async function uploadFileToStorage(file: File, folder: string, bucketName: string = BUCKET_NAME): Promise<{
  data: { publicUrl: string; path: string } | null
  error: string | null
}> {
  const path = buildStoragePath(folder, file.name)

  const { error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    })

  if (uploadError) {
    return {
      data: null,
      error: uploadError.message,
    }
  }

  const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(path)

  if (!urlData?.publicUrl) {
    await supabase.storage.from(bucketName).remove([path])
    return {
      data: null,
      error: 'No se pudo obtener la URL pública del archivo',
    }
  }

  return {
    data: {
      publicUrl: urlData.publicUrl,
      path,
    },
    error: null,
  }
}

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
  const fileValidation = validateMultimediaFile(file)
  if (!fileValidation.valid) {
    return {
      data: null,
      error: {
        message: fileValidation.message,
        code: fileValidation.code,
      }
    }
  }

  const tipoArchivo = detectFileType(file.type) as TipoArchivo

  // Build the file path: ${propertyId}/${timestamp}_${filename}
  const timestamp = Date.now()
  const filePath = `${propertyId}/${timestamp}_${sanitizeFileName(file.name)}`

  // Step 1: Upload file to Storage
  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    })

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
