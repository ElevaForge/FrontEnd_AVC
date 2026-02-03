import { NextRequest, NextResponse } from 'next/server'

// Default to the Supabase REST endpoint if BACKEND_URL isn't set. If you have a
// custom backend, set `BACKEND_URL` in the environment to that URL.
const BACKEND_URL = process.env.BACKEND_URL || 'https://bjvzasgfdxlsgvaizrli.supabase.co/rest/v1'

// Prefer a server-side key for proxied requests (service_role). Falls back to
// NEXT_PUBLIC_SUPABASE_ANON_KEY if set. We will attach this as `apikey` and
// `Authorization` when forwarding requests to Supabase REST.
// Fallback to the project's public anon key if no server key is provided.
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqdnphc2dmZHhsc2d2YWl6cmxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5NTYwMzYsImV4cCI6MjA4NDUzMjAzNn0.tJl5zlW3zHhaGnMGjExnM5ll7M9WU6Ds46QKW1p9O_M'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const params = await context.params
  return proxyRequest(request, params.path, 'GET')
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const params = await context.params
  return proxyRequest(request, params.path, 'POST')
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const params = await context.params
  return proxyRequest(request, params.path, 'PUT')
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const params = await context.params
  return proxyRequest(request, params.path, 'PATCH')
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const params = await context.params
  return proxyRequest(request, params.path, 'DELETE')
}

async function proxyRequest(
  request: NextRequest,
  path: string[],
  method: string
) {
  try {
    const url = `${BACKEND_URL}/${path.join('/')}`
    const searchParams = request.nextUrl.searchParams.toString()
    const fullUrl = searchParams ? `${url}?${searchParams}` : url

    // Obtener el body si existe
    let body: string | undefined
    if (method !== 'GET' && method !== 'DELETE') {
      body = await request.text()
    }

    // Copiar headers relevantes
    const headers: Record<string, string> = {
      'Content-Type': request.headers.get('content-type') || 'application/json',
    }

    // Pasar el token de autorización si existe
    const authHeader = request.headers.get('authorization')
    if (authHeader) {
      headers['Authorization'] = authHeader
    }

    // If a SUPABASE_KEY is configured (or fallback anon key), attach it so
    // proxied requests to Supabase REST include the expected `apikey` header.
    // Do not overwrite an explicit Authorization header sent by the client,
    // but always send `apikey` when available because Supabase REST requires it.
    if (SUPABASE_KEY) {
      headers['apikey'] = SUPABASE_KEY
      if (!headers['Authorization']) {
        headers['Authorization'] = `Bearer ${SUPABASE_KEY}`
      }
    }

    const response = await fetch(fullUrl, {
      method,
      headers,
      body,
    })

    const data = await response.text()
    
    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json',
      },
    })
  } catch (error) {
    console.error('Proxy error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error del servidor'
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000/api'
    
    // Si es un error de conexión, dar más contexto
    if (errorMessage.includes('fetch failed') || errorMessage.includes('ECONNREFUSED')) {
      return NextResponse.json(
        { 
          success: false, 
          error: `No se pudo conectar al servidor backend (${backendUrl}). Verifica que el backend esté corriendo.`
        },
        { status: 503 }
      )
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage
      },
      { status: 500 }
    )
  }
}
