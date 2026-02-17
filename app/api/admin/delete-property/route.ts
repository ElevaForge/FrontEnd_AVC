import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { supabaseAdmin, BUCKET_NAME, HAS_SERVICE_ROLE } from '@/lib/supabaseAdmin'

function extractPathFromUrl(raw: string | null): string | null {
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
    if (!HAS_SERVICE_ROLE) {
      console.error('SUPABASE_SERVICE_ROLE_KEY no configurada en el servidor')
      return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY no configurada en el servidor' }, { status: 500 })
    }
    const body = await req.json()
    const id: string | undefined = body?.id
    const authHeader = req.headers.get('authorization') || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : body?.token || null
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    if (!token) return NextResponse.json({ error: 'Missing user token' }, { status: 401 })

    // Validate user token and ensure requester is owner of the property
    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token)
    if (userErr || !userData?.user) {
      console.error('Admin: invalid user token', userErr)
      return NextResponse.json({ error: 'Invalid user token' }, { status: 401 })
    }
    const requesterId = userData.user.id

    // Check property owner
    const { data: prop, error: propErr } = await supabaseAdmin
      .from('propiedades')
      .select('owner_id')
      .eq('id', id)
      .single()

    if (propErr) {
      console.error('Admin: error fetching property owner:', propErr)
      return NextResponse.json({ error: 'Error fetching property' }, { status: 500 })
    }

    if (!prop || prop.owner_id !== requesterId) {
      console.error('Admin: requester is not the owner')
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 1) Obtener registros de imágenes asociados para eliminar del Storage
    const { data: imagenes, error: selectErr } = await supabaseAdmin
      .from('imagenes_propiedad')
      .select('id, url')
      .eq('propiedad_id', id)

    if (selectErr) {
      // Solo log, no abortamos - la propiedad puede no tener imágenes
      console.error('Admin: error fetching property images:', selectErr)
    }

    // 2) Extraer rutas y eliminar archivos del Storage usando la Storage API
    if (imagenes && imagenes.length > 0) {
      const paths = (imagenes as any[])
        .map(img => extractPathFromUrl(String(img.url || '')))
        .filter(Boolean) as string[]

      if (paths.length > 0) {
        try {
          const storageRes = await supabaseAdmin.storage.from(BUCKET_NAME).remove(paths)
          if (storageRes.error) {
            console.error('Admin: error removing storage files:', storageRes.error)
            // No abortamos; intentamos continuar con la eliminación de registros
          } else {
            console.info(`Admin: removed ${paths.length} file(s) from storage`)
          }
        } catch (e) {
          console.error('Admin: exception removing storage files:', e)
          // No abortamos; intentamos continuar
        }
      }
    }

    // 3) Eliminar registros de imagenes_propiedad ANTES de eliminar la propiedad.
    //    Esto evita que el CASCADE dispare la protección de Supabase contra
    //    eliminaciones directas de tablas vinculadas a Storage.
    const { error: imgDeleteErr } = await supabaseAdmin
      .from('imagenes_propiedad')
      .delete()
      .eq('propiedad_id', id)

    if (imgDeleteErr) {
      console.error('Admin: error deleting imagenes_propiedad:', imgDeleteErr)
      return NextResponse.json({ error: imgDeleteErr.message || 'Error deleting image records' }, { status: 500 })
    }

    // 4) Ahora eliminar la propiedad (ya sin hijos que disparen triggers de Storage)
    const { error: propDeleteError } = await supabaseAdmin
      .from('propiedades')
      .delete()
      .eq('id', id)

    if (propDeleteError) {
      console.error('Admin: error deleting propiedad:', propDeleteError)
      return NextResponse.json({ error: propDeleteError.message || 'Error deleting property' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Admin delete-property error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
