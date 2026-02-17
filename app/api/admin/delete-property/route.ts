import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { supabaseAdmin, BUCKET_NAME } from '@/lib/supabaseAdmin'

async function extractPathFromUrl(raw: string | null) {
  if (!raw) return null
  try {
    const marker = '/propiedades-imagenes/'
    const idx = raw.indexOf(marker)
    if (idx >= 0) return decodeURIComponent(raw.slice(idx + marker.length).split('?')[0])
    const urlObj = new URL(raw)
    const parts = urlObj.pathname.split('/').filter(Boolean)
    const bIdx = parts.findIndex(p => p === 'propiedades-imagenes')
    if (bIdx >= 0) return parts.slice(bIdx + 1).join('/')
    return parts.slice(-2).join('/')
  } catch (e) {
    return null
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const id: string | undefined = body?.id
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    // 1) Obtener registros de imágenes asociados
    const { data: imagenes, error: selectErr } = await supabaseAdmin
      .from('imagenes_propiedad')
      .select('id, url')
      .eq('propiedad_id', id)

    if (selectErr) {
      console.error('Admin: error fetching property images:', selectErr)
      return NextResponse.json({ error: selectErr.message || 'Error fetching images' }, { status: 500 })
    }

    // 2) Extraer rutas y eliminar archivos usando Storage API
    if (imagenes && imagenes.length > 0) {
      const paths = (imagenes as any[])
        .map(img => extractPathFromUrl(String(img.url || '')))
        .filter(Boolean) as string[]

      if (paths.length > 0) {
        const { error: storageErr } = await supabaseAdmin.storage.from(BUCKET_NAME).remove(paths)
        if (storageErr) console.error('Admin: error removing storage files:', storageErr)
      }
    }

    // 3) Eliminar registros de imágenes en la tabla
    const { error: imgDeleteErr } = await supabaseAdmin
      .from('imagenes_propiedad')
      .delete()
      .eq('propiedad_id', id)

    if (imgDeleteErr) console.error('Admin: error deleting imagenes_propiedad rows:', imgDeleteErr)

    // 4) Eliminar propiedad
    const { error } = await supabaseAdmin
      .from('propiedades')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Admin: error deleting propiedad:', error)
      return NextResponse.json({ error: error.message || 'Error deleting property' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Admin delete-property error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
