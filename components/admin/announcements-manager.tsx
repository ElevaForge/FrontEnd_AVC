"use client"

import { useMemo, useState } from 'react'
import { Megaphone, Plus, Pencil, Trash2, Upload, X } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useAnuncios } from '@/hooks/use-anuncios'
import type { Anuncio, TipoAnuncio } from '@/lib/types'
import { optimizeImageForUpload } from '@/lib/media-optimizer'
import { supabase, uploadFileToStorage, validateMultimediaFile } from '@/lib/supabase'

const defaultForm: Partial<Anuncio> = {
  titulo: '',
  resumen: '',
  contenido: '',
  tipo: 'General',
  prioridad: 0,
  activo: true,
  destacado: false,
  galeria_urls: [],
  cta_texto: '',
  cta_url: '',
  fecha_inicio: '',
  fecha_fin: '',
}

export function AnnouncementsManager() {
  const { anuncios, loading, error, createAnuncio, updateAnuncio, deleteAnuncio } = useAnuncios()
  const [isOpen, setIsOpen] = useState(false)
  const [editing, setEditing] = useState<Anuncio | null>(null)
  const [query, setQuery] = useState('')
  const [form, setForm] = useState<Partial<Anuncio>>(defaultForm)
  const [galleryInput, setGalleryInput] = useState('')
  const [pendingImages, setPendingImages] = useState<Array<{ id: string; file: File; preview: string }>>([])

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return anuncios
    return anuncios.filter((a) =>
      [a.titulo, a.resumen || '', a.contenido].join(' ').toLowerCase().includes(normalized),
    )
  }, [anuncios, query])

  const openCreate = () => {
    setEditing(null)
    setForm(defaultForm)
    setGalleryInput('')
    pendingImages.forEach((image) => URL.revokeObjectURL(image.preview))
    setPendingImages([])
    setIsOpen(true)
  }

  const openEdit = (anuncio: Anuncio) => {
    setEditing(anuncio)
    setForm({
      ...anuncio,
      fecha_inicio: anuncio.fecha_inicio ? anuncio.fecha_inicio.slice(0, 10) : '',
      fecha_fin: anuncio.fecha_fin ? anuncio.fecha_fin.slice(0, 10) : '',
    })
    setGalleryInput((anuncio.galeria_urls || []).join('\n'))
    pendingImages.forEach((image) => URL.revokeObjectURL(image.preview))
    setPendingImages([])
    setIsOpen(true)
  }

  const handleAddImages = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const incoming: Array<{ id: string; file: File; preview: string }> = []

    for (const originalFile of Array.from(files)) {
      let processedFile = originalFile

      if (originalFile.type.startsWith('image/')) {
        processedFile = await optimizeImageForUpload(originalFile)
      }

      const validation = validateMultimediaFile(processedFile)
      if (!validation.valid) {
        continue
      }

      incoming.push({
        id: `pending-${Math.random().toString(36).slice(2)}-${Date.now()}`,
        file: processedFile,
        preview: URL.createObjectURL(processedFile),
      })
    }

    if (incoming.length > 0) {
      setPendingImages((prev) => [...prev, ...incoming])
    }
  }

  const removePendingImage = (id: string) => {
    setPendingImages((prev) => {
      const next = prev.filter((item) => item.id !== id)
      const removed = prev.find((item) => item.id === id)
      if (removed) URL.revokeObjectURL(removed.preview)
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const parsedGallery = galleryInput
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)

    const uploadedFiles: string[] = []
    const uploadedStoragePaths: string[] = []

    for (const pending of pendingImages) {
      const { data, error: uploadError } = await uploadFileToStorage(pending.file, 'anuncios')
      if (uploadError || !data) {
        if (uploadedStoragePaths.length > 0) {
          await supabase.storage.from('propiedades-imagenes').remove(uploadedStoragePaths)
        }
        return
      }
      console.log('📸 URL subida para anuncio:', data.publicUrl, 'Ruta:', data.path)
      uploadedFiles.push(data.publicUrl)
      uploadedStoragePaths.push(data.path)
    }

    const galleryUrls = [...uploadedFiles, ...parsedGallery]
    const fallbackPrimaryImage = galleryUrls[0] || null

    const payload: Partial<Anuncio> = {
      titulo: String(form.titulo || '').trim(),
      resumen: form.resumen ? String(form.resumen).trim() : null,
      contenido: String(form.contenido || '').trim(),
      tipo: (form.tipo as TipoAnuncio) || 'General',
      prioridad: Number(form.prioridad || 0),
      activo: Boolean(form.activo),
      destacado: Boolean(form.destacado),
      galeria_urls: galleryUrls,
      imagen_url: form.imagen_url ? String(form.imagen_url).trim() : fallbackPrimaryImage,
      video_url: form.video_url ? String(form.video_url).trim() : null,
      cta_texto: form.cta_texto ? String(form.cta_texto).trim() : null,
      cta_url: form.cta_url ? String(form.cta_url).trim() : null,
      fecha_inicio: form.fecha_inicio ? new Date(String(form.fecha_inicio)).toISOString() : null,
      fecha_fin: form.fecha_fin ? new Date(String(form.fecha_fin)).toISOString() : null,
    }

    if (!payload.titulo || payload.titulo.length < 5) return
    if (!payload.contenido || payload.contenido.length < 10) return

    const ok = editing ? await updateAnuncio(editing.id, payload) : await createAnuncio(payload)
    if (ok) {
      setIsOpen(false)
      setEditing(null)
      setForm(defaultForm)
      setGalleryInput('')
      pendingImages.forEach((image) => URL.revokeObjectURL(image.preview))
      setPendingImages([])
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">Tablón de Anuncios</h2>
          <p className="text-muted-foreground text-sm md:text-base">Publica avisos, promociones y novedades visibles en la web.</p>
        </div>
        <Button onClick={openCreate} className="bg-secondary hover:bg-secondary/90 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo anuncio
        </Button>
      </div>

      <Card className="p-4">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar anuncio por título o contenido..."
        />
      </Card>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <Card className="p-6">
          <p className="text-destructive font-medium">No se pudieron cargar los anuncios.</p>
          <p className="text-muted-foreground text-sm mt-2">{error}</p>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="p-10 text-center border-dashed">
          <Megaphone className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No hay anuncios que coincidan con la búsqueda.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((a) => (
            <Card key={a.id} className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <Badge>{a.tipo}</Badge>
                    {a.destacado && <Badge className="bg-secondary text-white">Destacado</Badge>}
                    <Badge variant={a.activo ? 'default' : 'secondary'}>{a.activo ? 'Activo' : 'Inactivo'}</Badge>
                  </div>
                  <h3 className="text-lg font-semibold line-clamp-1">{a.titulo}</h3>
                  {a.resumen && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{a.resumen}</p>}
                </div>

                <div className="flex gap-2 shrink-0">
                  <Button variant="outline" size="sm" onClick={() => openEdit(a)}>
                    <Pencil className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => deleteAnuncio(a.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Eliminar
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-card rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-5 md:p-6 space-y-4">
              <h3 className="text-xl font-semibold">{editing ? 'Editar anuncio' : 'Nuevo anuncio'}</h3>

              <div className="space-y-2">
                <Label htmlFor="titulo">Título</Label>
                <Input
                  id="titulo"
                  value={String(form.titulo || '')}
                  onChange={(e) => setForm((prev) => ({ ...prev, titulo: e.target.value }))}
                  required
                  minLength={5}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="resumen">Resumen</Label>
                <Input
                  id="resumen"
                  value={String(form.resumen || '')}
                  onChange={(e) => setForm((prev) => ({ ...prev, resumen: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contenido">Contenido</Label>
                <Textarea
                  id="contenido"
                  value={String(form.contenido || '')}
                  onChange={(e) => setForm((prev) => ({ ...prev, contenido: e.target.value }))}
                  required
                  minLength={10}
                  rows={5}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo</Label>
                  <select
                    id="tipo"
                    value={String(form.tipo || 'General')}
                    onChange={(e) => setForm((prev) => ({ ...prev, tipo: e.target.value as TipoAnuncio }))}
                    className="w-full h-10 rounded-md border border-input bg-background px-3"
                  >
                    <option value="General">General</option>
                    <option value="Promocion">Promoción</option>
                    <option value="Urgente">Urgente</option>
                    <option value="Evento">Evento</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prioridad">Prioridad</Label>
                  <Input
                    id="prioridad"
                    type="number"
                    min={0}
                    max={100}
                    value={String(form.prioridad ?? 0)}
                    onChange={(e) => setForm((prev) => ({ ...prev, prioridad: Number(e.target.value || 0) }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estado">Estado</Label>
                  <select
                    id="estado"
                    value={form.activo ? 'activo' : 'inactivo'}
                    onChange={(e) => setForm((prev) => ({ ...prev, activo: e.target.value === 'activo' }))}
                    className="w-full h-10 rounded-md border border-input bg-background px-3"
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fecha_inicio">Fecha inicio</Label>
                  <Input
                    id="fecha_inicio"
                    type="date"
                    value={String(form.fecha_inicio || '')}
                    onChange={(e) => setForm((prev) => ({ ...prev, fecha_inicio: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fecha_fin">Fecha fin</Label>
                  <Input
                    id="fecha_fin"
                    type="date"
                    value={String(form.fecha_fin || '')}
                    onChange={(e) => setForm((prev) => ({ ...prev, fecha_fin: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="upload_images">Subir imágenes directamente</Label>
                  <div className="flex flex-col gap-3 rounded-lg border border-dashed border-border p-4">
                    <Input
                      id="upload_images"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleAddImages(e.target.files)}
                    />
                    {pendingImages.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {pendingImages.map((image) => (
                          <div key={image.id} className="relative rounded-lg overflow-hidden bg-muted">
                            <img src={image.preview} alt="Previsualización" className="h-24 w-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removePendingImage(image.id)}
                              className="absolute top-2 right-2 rounded-full bg-black/60 p-1 text-white"
                              aria-label="Eliminar imagen"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="galeria_urls">Fotos del anuncio (una URL por línea)</Label>
                  <Textarea
                    id="galeria_urls"
                    value={galleryInput}
                    onChange={(e) => setGalleryInput(e.target.value)}
                    rows={4}
                    placeholder={"https://.../foto1.webp\nhttps://.../foto2.webp"}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cta_texto">Texto botón</Label>
                  <Input
                    id="cta_texto"
                    value={String(form.cta_texto || '')}
                    onChange={(e) => setForm((prev) => ({ ...prev, cta_texto: e.target.value }))}
                    placeholder="Ver más"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cta_url">URL botón</Label>
                  <Input
                    id="cta_url"
                    value={String(form.cta_url || '')}
                    onChange={(e) => setForm((prev) => ({ ...prev, cta_url: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={Boolean(form.destacado)}
                    onChange={(e) => setForm((prev) => ({ ...prev, destacado: e.target.checked }))}
                  />
                  Marcar como destacado
                </label>

                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-secondary hover:bg-secondary/90 text-white">
                    {editing ? 'Guardar cambios' : 'Crear anuncio'}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
