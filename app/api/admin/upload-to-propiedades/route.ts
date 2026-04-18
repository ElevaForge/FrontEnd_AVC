import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const fileName = formData.get('fileName') as string

    if (!file || !fileName) {
      return NextResponse.json(
        { error: 'Falta archivo o nombre de archivo' },
        { status: 400 }
      )
    }

    // Generate unique path
    const timestamp = Date.now()
    const randomSuffix = Math.random().toString(36).substring(2, 8)
    const sanitizedName = fileName
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9._-]/g, '')
      .substring(0, 100)

    const path = `propiedades/${timestamp}_${randomSuffix}_${sanitizedName}`

    // Convert file to bytes
    const bytes = await file.arrayBuffer()

    console.log(`[Server Upload Propiedades] Starting upload: ${path}, size: ${bytes.byteLength}`)

    // Attempt to upload with retry logic
    let lastError: Error | null = null
    const maxAttempts = 5

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`[Server Upload Propiedades] Attempt ${attempt}/${maxAttempts}`)

        const { error } = await supabaseAdmin.storage
          .from('propiedades-imagenes')
          .upload(path, new Uint8Array(bytes), {
            cacheControl: '3600',
            upsert: false,
            contentType: file.type,
          })

        if (!error) {
          console.log(`[Server Upload Propiedades] Success on attempt ${attempt}`)

          const { data: urlData } = supabaseAdmin.storage
            .from('propiedades-imagenes')
            .getPublicUrl(path)

          return NextResponse.json({
            publicUrl: urlData.publicUrl,
            path,
          })
        }

        lastError = new Error(error.message)
        console.warn(`[Server Upload Propiedades] Error on attempt ${attempt}: ${error.message}`)

        // Check if error is retryable
        const statusCode = (error as any)?.statusCode || 0
        const message = error.message.toLowerCase()

        const isRetryable =
          statusCode >= 500 ||
          statusCode === 408 ||
          statusCode === 429 ||
          message.includes('502') ||
          message.includes('bad gateway') ||
          message.includes('timeout')

        if (!isRetryable) {
          console.log('[Server Upload Propiedades] Non-retryable error, giving up')
          return NextResponse.json(
            { error: `Error subiendo archivo: ${error.message}` },
            { status: 400 }
          )
        }

        // Exponential backoff
        if (attempt < maxAttempts) {
          const waitMs = 500 * Math.pow(1.5, attempt - 1)
          console.log(`[Server Upload Propiedades] Waiting ${waitMs}ms before retry`)
          await new Promise((resolve) => setTimeout(resolve, waitMs))
        }
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err))
        console.error(`[Server Upload Propiedades] Exception on attempt ${attempt}:`, lastError)

        if (attempt < maxAttempts) {
          const waitMs = 500 * Math.pow(1.5, attempt - 1)
          await new Promise((resolve) => setTimeout(resolve, waitMs))
        }
      }
    }

    console.error('[Server Upload Propiedades] Failed after all attempts:', lastError)
    return NextResponse.json(
      { error: `No se pudo subir archivo tras ${maxAttempts} intentos: ${lastError?.message}` },
      { status: 503 }
    )
  } catch (error) {
    console.error('[Server Upload Propiedades] Fatal error:', error)
    return NextResponse.json(
      { error: 'Error fatal durante subida al servidor' },
      { status: 500 }
    )
  }
}
