"use client"

import { useState, useEffect } from "react"
import { X, Upload, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { type PropiedadCompleta, type CategoriaPropiedad, type EstadoPropiedad } from "@/lib/types"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface PropertyFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (property: Partial<PropiedadCompleta>) => void
  property: PropiedadCompleta | null
}

export function PropertyFormModal({ isOpen, onClose, onSave, property }: PropertyFormModalProps) {
  // Inicializar formData directamente con la propiedad si existe
  const getInitialFormData = (): Partial<PropiedadCompleta> => {
    if (property) {
      return {
        ...property,
        precio_administracion: property.precio_administracion || 0,
        metros_construidos: property.metros_construidos || 0,
      }
    }
    return {
      nombre: "",
      categoria: "Vivienda" as CategoriaPropiedad,
      descripcion: "",
      direccion: "",
      tipo_accion: "Venta" as const,
      precio: 0,
      precio_administracion: 0,
      alcobas: 0,
      banos: 0,
      parqueaderos: 0,
      metros_cuadrados: 0,
      metros_construidos: 0,
      imagen_principal: "",
      estado: "Disponible" as EstadoPropiedad,
      destacada: false,
      activo: true,
    }
  }

  const [formData, setFormData] = useState<Partial<PropiedadCompleta>>(getInitialFormData)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>(property?.imagen_principal || "")
  const [uploading, setUploading] = useState(false)

  const uploadImageToSupabase = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
      const filePath = `propiedades/${fileName}`

      const { data, error } = await supabase.storage
        .from('propiedades-imagenes')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Error uploading image:', error)
        toast.error(`Error al subir imagen: ${error.message}`)
        return null
      }

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('propiedades-imagenes')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Error al subir la imagen')
      return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)

    try {
      let imagenUrl = formData.imagen_principal

      // Si hay una nueva imagen seleccionada, subirla primero
      if (imageFile) {
        const uploadedUrl = await uploadImageToSupabase(imageFile)
        if (uploadedUrl) {
          imagenUrl = uploadedUrl
        } else {
          setUploading(false)
          return // No continuar si falló la subida
        }
      }

      // Guardar la propiedad con la URL de la imagen
      await onSave({
        ...formData,
        imagen_principal: imagenUrl
      })
    } catch (error) {
      console.error('Error submitting form:', error)
      toast.error('Error al guardar la propiedad')
    } finally {
      setUploading(false)
    }
  }

  const handleImageSelect = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      
      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('La imagen no debe superar los 5MB')
        return
      }

      // Guardar el archivo para subirlo después
      setImageFile(file)
      
      // Crear preview
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        if (result) {
          setImagePreview(result)
        }
      }
      reader.readAsDataURL(file)
    }
    
    input.click()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 md:p-4">
      <div className="bg-card rounded-xl md:rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] md:max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">
            {property ? "Editar Propiedad" : "Nueva Propiedad"}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
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
                type="number"
                value={formData.precio || 0}
                onChange={(e) => setFormData({ ...formData, precio: Number(e.target.value) })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="precio_administracion">Precio Administración (COP)</Label>
              <Input
                id="precio_administracion"
                type="number"
                value={formData.precio_administracion || 0}
                onChange={(e) => setFormData({ ...formData, precio_administracion: Number(e.target.value) })}
              />
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <div className="space-y-2">
              <Label htmlFor="metros_cuadrados">Metros² Totales *</Label>
              <Input
                id="metros_cuadrados"
                type="number"
                value={formData.metros_cuadrados || 0}
                onChange={(e) => setFormData({ ...formData, metros_cuadrados: Number(e.target.value) })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="metros_construidos">Metros² Construidos</Label>
              <Input
                id="metros_construidos"
                type="number"
                value={formData.metros_construidos || 0}
                onChange={(e) => setFormData({ ...formData, metros_construidos: Number(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="alcobas">Alcobas</Label>
              <Input
                id="alcobas"
                type="number"
                value={formData.alcobas || 0}
                onChange={(e) => setFormData({ ...formData, alcobas: Number(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="banos">Baños</Label>
              <Input
                id="banos"
                type="number"
                value={formData.banos || 0}
                onChange={(e) => setFormData({ ...formData, banos: Number(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="parqueaderos">Parqueaderos</Label>
              <Input
                id="parqueaderos"
                type="number"
                value={formData.parqueaderos || 0}
                onChange={(e) => setFormData({ ...formData, parqueaderos: Number(e.target.value) })}
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

          {/* Imagen Principal */}
          <div className="space-y-1.5 md:space-y-2">
            <Label className="text-sm">Imagen Principal</Label>
            <div className="flex flex-col gap-3 md:gap-4">
              {imagePreview ? (
                <div className="relative rounded-lg overflow-hidden bg-muted max-w-xs">
                  <img src={imagePreview} alt="Preview" className="w-full h-auto object-cover" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setImagePreview("")
                      setImageFile(null)
                      setFormData({ ...formData, imagen_principal: "" })
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleImageSelect}
                  className="w-full max-w-xs aspect-video rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 flex flex-col items-center justify-center gap-1.5 md:gap-2 transition-colors"
                >
                  <Upload className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground" />
                  <span className="text-xs md:text-sm text-muted-foreground">Seleccionar Imagen</span>
                  <span className="text-xs text-muted-foreground">Máximo 5MB</span>
                </button>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row gap-2 md:gap-3 justify-end pt-3 md:pt-4 border-t border-border sticky bottom-0 bg-card pb-2 md:pb-0">
            <Button type="button" variant="outline" onClick={onClose} disabled={uploading} className="w-full sm:w-auto text-sm md:text-base h-9 md:h-10">
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
                  <span className="text-sm md:text-base">Subiendo...</span>
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
