"use client"

import { useState, useEffect } from "react"
import { X, Upload, Trash2, Star, Play, Image as ImageIcon, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { type PropiedadCompleta, type CategoriaPropiedad, type EstadoPropiedad, type ImagenPropiedad } from "@/lib/types"
import { apiGet } from "@/lib/api"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Tipo para archivos nuevos pendientes de subir
export interface PendingMediaFile {
  id: string
  file: File
  preview: string
  type: 'image' | 'video'
}

// Tipo para archivos existentes en la base de datos
interface ExistingMedia extends ImagenPropiedad {
  tipo_archivo?: 'image' | 'video'
}

interface PropertyFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (property: Partial<PropiedadCompleta>, newMediaFiles: PendingMediaFile[], deletedMediaIds: string[], principalMediaId: string | null) => void
  property: PropiedadCompleta | null
}

export function PropertyFormModal({ isOpen, onClose, onSave, property }: PropertyFormModalProps) {
  // Inicializar formData directamente con la propiedad si existe
  const getInitialFormData = (): Partial<PropiedadCompleta> => {
    if (property) {
      return property
    }
    return {
      nombre: "",
      categoria: "Vivienda" as CategoriaPropiedad,
      descripcion: "",
      direccion: "",
      tipo_accion: "Venta" as const,
      imagen_principal: "",
      estado: "Disponible" as EstadoPropiedad,
      destacada: false,
      activo: true,
    }
  }

  const [formData, setFormData] = useState<Partial<PropiedadCompleta>>(getInitialFormData)
  // Media existente de la propiedad (cargado desde BD)
  const [existingMedia, setExistingMedia] = useState<ExistingMedia[]>([])
  // Media nueva pendiente de subir
  const [pendingMedia, setPendingMedia] = useState<PendingMediaFile[]>([])
  // IDs de media existente que se eliminará
  const [deletedMediaIds, setDeletedMediaIds] = useState<string[]>([])
  // ID de la imagen principal (puede ser existente o pendiente)
  const [principalMediaId, setPrincipalMediaId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [loadingMedia, setLoadingMedia] = useState(false)

  // Cargar media existente cuando se edita una propiedad
  useEffect(() => {
    if (isOpen && property?.id) {
      loadExistingMedia(property.id)
    } else if (isOpen && !property) {
      // Reset estado para nueva propiedad
      setExistingMedia([])
      setPendingMedia([])
      setDeletedMediaIds([])
      setPrincipalMediaId(null)
    }
  }, [isOpen, property?.id])

  // Resetear formulario cuando cambia la propiedad
  useEffect(() => {
    setFormData(getInitialFormData())
  }, [property])

  const loadExistingMedia = async (propertyId: string) => {
    setLoadingMedia(true)
    try {
      // Cargar desde la propiedad si ya tiene imágenes
      if (property?.imagenes && property.imagenes.length > 0) {
        const mediaWithType: ExistingMedia[] = property.imagenes.map(img => ({
          ...img,
          tipo_archivo: detectMediaType(img.url)
        }))
        setExistingMedia(mediaWithType)
        // Establecer la imagen principal
        const principal = mediaWithType.find(m => m.es_principal)
        if (principal) {
          setPrincipalMediaId(principal.id)
        }
      } else {
        // Intentar cargar desde API usando la tabla imagenes_propiedad
        // Agregar limit para asegurar que se cargan todas (hasta el máximo permitido de 20)
        const response = await apiGet<ImagenPropiedad[]>(`/imagenes_propiedad?propiedad_id=eq.${propertyId}&order=orden.asc&limit=20`)
        if (response.success && response.data) {
          const mediaWithType: ExistingMedia[] = response.data.map(img => ({
            ...img,
            tipo_archivo: detectMediaType(img.url)
          }))
          setExistingMedia(mediaWithType)
          const principal = mediaWithType.find(m => m.es_principal)
          if (principal) {
            setPrincipalMediaId(principal.id)
          }
        }
      }
    } catch (error) {
      console.error('Error loading existing media:', error)
    } finally {
      setLoadingMedia(false)
    }
  }

  // Detectar tipo de archivo por extensión de URL
  const detectMediaType = (url: string): 'image' | 'video' => {
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv']
    const lowerUrl = url.toLowerCase()
    return videoExtensions.some(ext => lowerUrl.includes(ext)) ? 'video' : 'image'
  }

  // Helper function to handle numeric input - allows only numbers and empty values
  const handleNumericInput = (value: string, field: keyof PropiedadCompleta) => {
    // Allow empty string
    if (value === "") {
      setFormData({ ...formData, [field]: undefined })
      return
    }
    // Only allow numeric characters and decimal point
    const numericValue = value.replace(/[^0-9.]/g, "")
    // Prevent multiple decimal points
    const parts = numericValue.split(".")
    const sanitized = parts.length > 2 ? parts[0] + "." + parts.slice(1).join("") : numericValue
    
    if (sanitized !== "" && sanitized !== ".") {
      setFormData({ ...formData, [field]: Number(sanitized) })
    }
  }

  // Agregar nuevos archivos multimedia
  const handleAddMedia = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*,video/*'
    input.multiple = true

    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files
      if (!files || files.length === 0) return

      const newPendingMedia: PendingMediaFile[] = []

      Array.from(files).forEach(file => {
        const isVideo = file.type.startsWith('video/')
        const maxSize = isVideo ? 50 * 1024 * 1024 : 5 * 1024 * 1024

        if (file.size > maxSize) {
          toast.error(`${file.name}: ${isVideo ? 'Video no debe superar 50MB' : 'Imagen no debe superar 5MB'}`)
          return
        }

        const id = `pending-${Math.random().toString(36).substring(2)}-${Date.now()}`
        const preview = URL.createObjectURL(file)

        newPendingMedia.push({
          id,
          file,
          preview,
          type: isVideo ? 'video' : 'image'
        })
      })

      if (newPendingMedia.length > 0) {
        setPendingMedia(prev => [...prev, ...newPendingMedia])
        
        // Si no hay principal seleccionado, establecer la primera imagen como principal
        if (!principalMediaId && existingMedia.length === 0 && pendingMedia.length === 0) {
          const firstImage = newPendingMedia.find(m => m.type === 'image')
          if (firstImage) {
            setPrincipalMediaId(firstImage.id)
          }
        }
      }
    }

    input.click()
  }

  // Eliminar media existente (marcar para eliminación)
  const handleDeleteExistingMedia = (mediaId: string) => {
    setDeletedMediaIds(prev => [...prev, mediaId])
    const remainingExisting = existingMedia.filter(m => m.id !== mediaId)
    setExistingMedia(remainingExisting)
    
    // Si era la principal, resetear
    if (principalMediaId === mediaId) {
      const firstRemaining = remainingExisting.find(m => m.tipo_archivo === 'image') || pendingMedia.find(m => m.type === 'image')
      setPrincipalMediaId(firstRemaining?.id || null)
    }
  }

  // Eliminar media pendiente (no subida aún)
  const handleDeletePendingMedia = (mediaId: string) => {
    const media = pendingMedia.find(m => m.id === mediaId)
    if (media) {
      URL.revokeObjectURL(media.preview)
    }
    const remainingPending = pendingMedia.filter(m => m.id !== mediaId)
    setPendingMedia(remainingPending)
    
    // Si era la principal, resetear
    if (principalMediaId === mediaId) {
      const firstRemaining = existingMedia.find(m => m.tipo_archivo === 'image') || remainingPending.find(m => m.type === 'image')
      setPrincipalMediaId(firstRemaining?.id || null)
    }
  }

  // Establecer como imagen principal (solo imágenes, no videos)
  const handleSetPrincipal = (mediaId: string, isVideo: boolean) => {
    if (isVideo) {
      toast.error('Solo las imágenes pueden ser establecidas como principal')
      return
    }
    setPrincipalMediaId(mediaId)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)

    // Validaciones cliente para respetar constraints en base de datos
    const validateForm = (): boolean => {
      const nombre = String(formData.nombre ?? '').trim()
      if (nombre.length < 3) {
        toast.error('El nombre debe tener al menos 3 caracteres')
        return false
      }

      const direccion = String(formData.direccion ?? '').trim()
      if (direccion.length < 5) {
        toast.error('La dirección debe tener al menos 5 caracteres')
        return false
      }

      const descripcion = String(formData.descripcion ?? '').trim()
      if (descripcion.length < 10) {
        toast.error('La descripción debe tener al menos 10 caracteres')
        return false
      }
      if (descripcion.length > 5000) {
        toast.error('La descripción no puede exceder 5000 caracteres')
        return false
      }

      const precio = Number(formData.precio ?? 0)
      if (precio <= 0) {
        toast.error('El precio debe ser mayor que 0')
        return false
      }

      const metros_cuadrados = Number(formData.metros_cuadrados ?? 0)
      if (metros_cuadrados <= 0) {
        toast.error('Los metros cuadrados deben ser mayores que 0')
        return false
      }

      const metros_construidos = Number(formData.metros_construidos ?? 0)
      if (metros_construidos < 0) {
        toast.error('Los metros construidos no pueden ser negativos')
        return false
      }

      const alcobas = Number(formData.alcobas ?? 0)
      if (alcobas < 0 || alcobas > 50) {
        toast.error('Alcobas debe estar entre 0 y 50')
        return false
      }

      const banos = Number(formData.banos ?? 0)
      if (banos < 0 || banos > 50) {
        toast.error('Baños debe estar entre 0 y 50')
        return false
      }

      const parqueaderos = Number(formData.parqueaderos ?? 0)
      if (parqueaderos < 0 || parqueaderos > 20) {
        toast.error('Parqueaderos debe estar entre 0 y 20')
        return false
      }

      return true
    }

    try {
      if (!validateForm()) return

      // Pasar todos los datos al manager para que procese
      await onSave(formData, pendingMedia, deletedMediaIds, principalMediaId)
    } catch (error) {
      console.error('Error submitting form:', error)
      toast.error('Error al guardar la propiedad')
    } finally {
      setUploading(false)
    }
  }

  // Limpiar al cerrar
  const handleClose = () => {
    // Limpiar URLs de objeto para liberar memoria
    pendingMedia.forEach(m => URL.revokeObjectURL(m.preview))
    setPendingMedia([])
    setExistingMedia([])
    setDeletedMediaIds([])
    setPrincipalMediaId(null)
    onClose()
  }

  if (!isOpen) return null

  const totalMedia = existingMedia.length + pendingMedia.length

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 md:p-4">
      <div className="bg-card rounded-xl md:rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] md:max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-foreground">
            {property ? "Editar Propiedad" : "Nueva Propiedad"}
          </h2>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4 md:space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div className="space-y-1.5 md:space-y-2">
              <Label htmlFor="nombre" className="text-sm">Nombre de la Propiedad *</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required
                className="text-sm md:text-base h-9 md:h-10"
              />
            </div>

            <div className="space-y-1.5 md:space-y-2">
              <Label htmlFor="categoria">Categoría *</Label>
              <Select
                value={formData.categoria}
                onValueChange={(value: any) => setFormData({ ...formData, categoria: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Vivienda">Vivienda</SelectItem>
                  <SelectItem value="Apartamento">Apartamento</SelectItem>
                  <SelectItem value="Local/Oficina">Local/Oficina</SelectItem>
                  <SelectItem value="Lote">Lote</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5 md:space-y-2">
            <Label htmlFor="descripcion" className="text-sm">Descripción *</Label>
            <Textarea
              id="descripcion"
              rows={3}
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              required
              className="text-sm md:text-base resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="direccion">Dirección *</Label>
              <Input
                id="direccion"
                value={formData.direccion || ""}
                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo_accion">Tipo de Acción *</Label>
              <Select
                value={formData.tipo_accion}
                onValueChange={(value: "Venta" | "Arriendo") => setFormData({ ...formData, tipo_accion: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Venta">Venta</SelectItem>
                  <SelectItem value="Arriendo">Arriendo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="precio">Precio (COP) *</Label>
              <Input
                id="precio"
                type="text"
                inputMode="decimal"
                value={String(formData.precio ?? "")}
                onChange={(e) => handleNumericInput(e.target.value, "precio")}
                placeholder="0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="precio_administracion">Precio Administración (COP)</Label>
              <Input
                id="precio_administracion"
                type="text"
                inputMode="decimal"
                value={String(formData.precio_administracion ?? "")}
                onChange={(e) => handleNumericInput(e.target.value, "precio_administracion")}
                placeholder="0"
              />
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <div className="space-y-2">
              <Label htmlFor="metros_cuadrados">Metros² Totales *</Label>
              <Input
                id="metros_cuadrados"
                type="text"
                inputMode="decimal"
                value={String(formData.metros_cuadrados ?? "")}
                onChange={(e) => handleNumericInput(e.target.value, "metros_cuadrados")}
                placeholder="0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="metros_construidos">Metros² Construidos</Label>
              <Input
                id="metros_construidos"
                type="text"
                inputMode="decimal"
                value={String(formData.metros_construidos ?? "")}
                onChange={(e) => handleNumericInput(e.target.value, "metros_construidos")}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="alcobas">Alcobas</Label>
              <Input
                id="alcobas"
                type="text"
                inputMode="numeric"
                value={String(formData.alcobas ?? "")}
                onChange={(e) => handleNumericInput(e.target.value, "alcobas")}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="banos">Baños</Label>
              <Input
                id="banos"
                type="text"
                inputMode="numeric"
                value={String(formData.banos ?? "")}
                onChange={(e) => handleNumericInput(e.target.value, "banos")}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="parqueaderos">Parqueaderos</Label>
              <Input
                id="parqueaderos"
                type="text"
                inputMode="numeric"
                value={String(formData.parqueaderos ?? "")}
                onChange={(e) => handleNumericInput(e.target.value, "parqueaderos")}
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estado">Estado *</Label>
              <Select
                value={formData.estado}
                onValueChange={(value: EstadoPropiedad) => setFormData({ ...formData, estado: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Disponible">Disponible</SelectItem>
                  <SelectItem value="Reservada">Reservada</SelectItem>
                  <SelectItem value="Vendida">Vendida</SelectItem>
                  <SelectItem value="Arrendada">Arrendada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.destacada || false}
                  onChange={(e) => setFormData({ ...formData, destacada: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">Propiedad Destacada</span>
              </label>
            </div>
          </div>

          {/* Galería Multimedia - CRUD Completo */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Galería Multimedia ({totalMedia} archivos)</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddMedia}
                className="gap-1"
              >
                <Plus className="h-4 w-4" />
                Agregar
              </Button>
            </div>
            
            {loadingMedia ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : totalMedia === 0 ? (
              <button
                type="button"
                onClick={handleAddMedia}
                className="w-full aspect-video max-w-md rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 flex flex-col items-center justify-center gap-2 transition-colors"
              >
                <Upload className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Agregar Fotos o Videos</span>
                <span className="text-xs text-muted-foreground">Imagen: máx 5MB · Video: máx 50MB</span>
              </button>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {/* Media existente */}
                {existingMedia.map((media) => (
                  <div 
                    key={media.id} 
                    className={`relative group rounded-lg overflow-hidden bg-muted aspect-square border-2 ${
                      principalMediaId === media.id ? 'border-yellow-500' : 'border-transparent'
                    }`}
                  >
                    {media.tipo_archivo === 'video' ? (
                      <div className="w-full h-full relative">
                        <video 
                          src={media.url} 
                          className="w-full h-full object-cover"
                          muted
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <Play className="h-8 w-8 text-white" />
                        </div>
                      </div>
                    ) : (
                      <img 
                        src={media.url_thumbnail || media.url} 
                        alt={media.titulo || 'Imagen'} 
                        className="w-full h-full object-cover"
                      />
                    )}
                    
                    {/* Overlay con acciones */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      {media.tipo_archivo !== 'video' && (
                        <Button
                          type="button"
                          variant={principalMediaId === media.id ? "default" : "secondary"}
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleSetPrincipal(media.id, false)}
                          title="Establecer como principal"
                        >
                          <Star className={`h-4 w-4 ${principalMediaId === media.id ? 'fill-current' : ''}`} />
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleDeleteExistingMedia(media.id)}
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Badge de tipo */}
                    <div className="absolute top-1 left-1">
                      {media.tipo_archivo === 'video' ? (
                        <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1">
                          <Play className="h-3 w-3" /> Video
                        </span>
                      ) : (
                        <span className="bg-green-500 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1">
                          <ImageIcon className="h-3 w-3" /> Foto
                        </span>
                      )}
                    </div>

                    {/* Indicador de principal */}
                    {principalMediaId === media.id && (
                      <div className="absolute top-1 right-1">
                        <span className="bg-yellow-500 text-black text-xs px-1.5 py-0.5 rounded flex items-center gap-1 font-medium">
                          <Star className="h-3 w-3 fill-current" /> Principal
                        </span>
                      </div>
                    )}
                  </div>
                ))}

                {/* Media pendiente de subir */}
                {pendingMedia.map((media) => (
                  <div 
                    key={media.id} 
                    className={`relative group rounded-lg overflow-hidden bg-muted aspect-square border-2 ${
                      principalMediaId === media.id ? 'border-yellow-500' : 'border-dashed border-primary/50'
                    }`}
                  >
                    {media.type === 'video' ? (
                      <div className="w-full h-full relative">
                        <video 
                          src={media.preview} 
                          className="w-full h-full object-cover"
                          muted
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <Play className="h-8 w-8 text-white" />
                        </div>
                      </div>
                    ) : (
                      <img 
                        src={media.preview} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                    )}
                    
                    {/* Overlay con acciones */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      {media.type !== 'video' && (
                        <Button
                          type="button"
                          variant={principalMediaId === media.id ? "default" : "secondary"}
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleSetPrincipal(media.id, false)}
                          title="Establecer como principal"
                        >
                          <Star className={`h-4 w-4 ${principalMediaId === media.id ? 'fill-current' : ''}`} />
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleDeletePendingMedia(media.id)}
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Badge de tipo y estado */}
                    <div className="absolute top-1 left-1 flex gap-1">
                      {media.type === 'video' ? (
                        <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1">
                          <Play className="h-3 w-3" /> Video
                        </span>
                      ) : (
                        <span className="bg-green-500 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1">
                          <ImageIcon className="h-3 w-3" /> Foto
                        </span>
                      )}
                      <span className="bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded">
                        Nuevo
                      </span>
                    </div>

                    {/* Indicador de principal */}
                    {principalMediaId === media.id && (
                      <div className="absolute top-1 right-1">
                        <span className="bg-yellow-500 text-black text-xs px-1.5 py-0.5 rounded flex items-center gap-1 font-medium">
                          <Star className="h-3 w-3 fill-current" /> Principal
                        </span>
                      </div>
                    )}
                  </div>
                ))}

                {/* Botón para agregar más */}
                <button
                  type="button"
                  onClick={handleAddMedia}
                  className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 flex flex-col items-center justify-center gap-1 transition-colors"
                >
                  <Plus className="h-6 w-6 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Agregar</span>
                </button>
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Haz clic en la estrella para establecer la imagen principal. Los videos no pueden ser imagen principal.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row gap-2 md:gap-3 justify-end pt-3 md:pt-4 border-t border-border sticky bottom-0 bg-card pb-2 md:pb-0 z-10">
            <Button type="button" variant="outline" onClick={handleClose} disabled={uploading} className="w-full sm:w-auto text-sm md:text-base h-9 md:h-10">
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-secondary hover:bg-secondary/90 text-white shadow-md w-full sm:w-auto text-sm md:text-base h-9 md:h-10"
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 md:h-4 md:w-4 border-b-2 border-white mr-2"></div>
                  <span className="text-sm md:text-base">Guardando...</span>
                </>
              ) : (
                <span className="text-sm md:text-base">{property ? "Guardar Cambios" : "Crear Propiedad"}</span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
