interface OptimizeImageOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  outputType?: 'image/webp' | 'image/jpeg'
}

const DEFAULT_OPTIONS: Required<OptimizeImageOptions> = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 0.78,
  outputType: 'image/webp',
}

function stripExtension(fileName: string): string {
  return fileName.replace(/\.[^.]+$/, '')
}

function computeResizedDimensions(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number,
): { width: number; height: number } {
  if (width <= maxWidth && height <= maxHeight) {
    return { width, height }
  }

  const ratio = Math.min(maxWidth / width, maxHeight / height)
  return {
    width: Math.max(1, Math.round(width * ratio)),
    height: Math.max(1, Math.round(height * ratio)),
  }
}

/**
 * Optimiza imágenes para reducir consumo de storage y ancho de banda.
 * Si la versión optimizada no mejora el tamaño, retorna el archivo original.
 */
export async function optimizeImageForUpload(
  file: File,
  options: OptimizeImageOptions = {},
): Promise<File> {
  if (!file.type.startsWith('image/')) return file
  if (file.type === 'image/svg+xml') return file
  if (typeof window === 'undefined') return file

  const settings = { ...DEFAULT_OPTIONS, ...options }
  let bitmap: ImageBitmap | null = null

  try {
    bitmap = await createImageBitmap(file)
    const target = computeResizedDimensions(
      bitmap.width,
      bitmap.height,
      settings.maxWidth,
      settings.maxHeight,
    )

    const canvas = document.createElement('canvas')
    canvas.width = target.width
    canvas.height = target.height

    const ctx = canvas.getContext('2d')
    if (!ctx) return file

    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(bitmap, 0, 0, target.width, target.height)

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, settings.outputType, settings.quality)
    })

    if (!blob || blob.size >= file.size) {
      return file
    }

    const ext = settings.outputType === 'image/jpeg' ? 'jpg' : 'webp'
    const optimizedName = `${stripExtension(file.name)}.${ext}`

    return new File([blob], optimizedName, {
      type: settings.outputType,
      lastModified: Date.now(),
    })
  } catch {
    return file
  } finally {
    bitmap?.close()
  }
}
