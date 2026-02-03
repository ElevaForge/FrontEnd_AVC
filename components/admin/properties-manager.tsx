"use client"

import { useState } from "react"
import { Plus, Search, Edit, Trash2, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PropertyFormModal, type PendingMediaFile } from "./property-form-modal"
import { usePropiedades } from "@/hooks/use-propiedades"
import type { PropiedadCompleta } from "@/lib/types"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/use-auth"

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(price)
}

export function PropertiesManager() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProperty, setEditingProperty] = useState<PropiedadCompleta | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const { user } = useAuth()
  
  const { propiedades, loading, refetch } = usePropiedades({})

  const filteredProperties = (propiedades || []).filter(property => {
    const name = property.nombre || ''
    const address = property.direccion || ''
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         address.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === "all" || property.categoria === filterCategory
    return matchesSearch && matchesCategory
  })

  const handleAddProperty = () => {
    setEditingProperty(null)
    setIsModalOpen(true)
  }

  const handleEditProperty = (property: PropiedadCompleta) => {
    setEditingProperty(property)
    setIsModalOpen(true)
  }

  const handleDeleteProperty = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta propiedad? Se eliminarán también todas sus imágenes.")) {
      return
    }

    try {
      // Primero eliminar las imágenes asociadas
      const { error: imgError } = await supabase
        .from('imagenes_propiedad')
        .delete()
        .eq('propiedad_id', id)

      if (imgError) {
        console.error('Error deleting property images:', imgError)
        // Continuar aunque falle la eliminación de imágenes
      }

      // Luego eliminar la propiedad usando Supabase directamente
      const { error } = await supabase
        .from('propiedades')
        .delete()
        .eq('id', id)
      
      if (error) {
        console.error('Error deleting property:', error)
        toast.error(error.message || "Error al eliminar la propiedad")
      } else {
        toast.success("Propiedad eliminada exitosamente")
        refetch()
      }
    } catch (error) {
      console.error('Error deleting property:', error)
      toast.error("Error al eliminar la propiedad")
    }
  }


  const getStatusColor = (estado: string) => {
    switch (estado) {
      case "Disponible": return "bg-green-500"
      case "Reservada": return "bg-yellow-500"
      case "Vendida": return "bg-red-500"
      case "Arrendada": return "bg-blue-500"
      default: return "bg-gray-500"
    }
  }

  const handleSaveProperty = async (
    property: Partial<PropiedadCompleta>,
    newMediaFiles: PendingMediaFile[] = [],
    deletedMediaIds: string[] = [],
    principalMediaId: string | null = null
  ) => {
    try {
      if (!user) {
        toast.error('Debes iniciar sesión para crear o editar propiedades')
        return
      }

      const propertyData: Record<string, unknown> = {}
      if (property.nombre !== undefined && property.nombre !== null) propertyData.nombre = property.nombre
      if (property.categoria !== undefined && property.categoria !== null) propertyData.categoria = property.categoria
      if (property.descripcion !== undefined && property.descripcion !== null) propertyData.descripcion = property.descripcion
      if (property.direccion !== undefined && property.direccion !== null) propertyData.direccion = property.direccion
      if (property.tipo_accion !== undefined && property.tipo_accion !== null) propertyData.tipo_accion = property.tipo_accion
      if (property.precio !== undefined && property.precio !== null) propertyData.precio = Number(property.precio)
      if (property.precio_administracion !== undefined && property.precio_administracion !== null) propertyData.precio_administracion = Number(property.precio_administracion)
      if (property.alcobas !== undefined && property.alcobas !== null) propertyData.alcobas = Number(property.alcobas)
      if (property.banos !== undefined && property.banos !== null) propertyData.banos = Number(property.banos)
      if (property.parqueaderos !== undefined && property.parqueaderos !== null) propertyData.parqueaderos = Number(property.parqueaderos)
      if (property.metros_cuadrados !== undefined && property.metros_cuadrados !== null) propertyData.metros_cuadrados = Number(property.metros_cuadrados)
      if (property.metros_construidos !== undefined && property.metros_construidos !== null) propertyData.metros_construidos = Number(property.metros_construidos)
      if (property.estado !== undefined && property.estado !== null) propertyData.estado = property.estado
      if (property.destacada !== undefined) propertyData.destacada = Boolean(property.destacada)
      if (property.activo !== undefined) propertyData.activo = Boolean(property.activo)

      let propertyId: string | undefined

      if (editingProperty?.id) {
        const { error } = await supabase.from('propiedades').update(propertyData).eq('id', editingProperty.id)
        if (error) {
          console.error('Error updating property:', error)
          toast.error('Error al actualizar la propiedad')
          return
        }
        propertyId = editingProperty.id
        toast.success('Propiedad actualizada exitosamente')
      } else {
        // Ensure owner is set so RLS policies that check ownership pass
        if (!propertyData['owner_id']) propertyData['owner_id'] = user.id

        // Fill defaults for numeric NOT NULL columns to avoid DB constraint errors
        const numericDefaults: Record<string, number> = {
          alcobas: 0,
          banos: 0,
          parqueaderos: 0,
          metros_cuadrados: 0,
          metros_construidos: 0,
          precio: 0,
          precio_administracion: 0,
        }
        for (const [key, val] of Object.entries(numericDefaults)) {
          if (propertyData[key] === undefined || propertyData[key] === null) {
            propertyData[key] = val
          }
        }

        // Sanitize and ensure description meets simple constraints to avoid DB check violations
        try {
          let desc: string = String(propertyData['descripcion'] ?? '')
          desc = desc.replace(/[\u0000-\u001F\u007F]/g, ' ').trim()
          // Limit length to 1000 chars
          if (desc.length > 1000) desc = desc.slice(0, 1000)
          if (!desc) desc = 'Sin descripción'
          propertyData['descripcion'] = desc
        } catch (err) {
          propertyData['descripcion'] = 'Sin descripción'
        }

        const { data, error } = await supabase.from('propiedades').insert(propertyData).select().single()
        if (error || !data) {
          console.error('Error creating property:', error)
          toast.error('Error al crear la propiedad')
          return
        }
        propertyId = (data as any).id
        toast.success('Propiedad creada exitosamente')
      }

      if (propertyId) {
        // Ejecutar operaciones de BD en paralelo donde sea posible
        
        // Resetear imagen principal y eliminar imágenes marcadas
        const initialOps: Promise<any>[] = [
          (async () => {
            await supabase.from('imagenes_propiedad').update({ es_principal: false }).eq('propiedad_id', propertyId)
          })()
        ]

        // Eliminar imágenes marcadas para eliminación
        if (deletedMediaIds.length > 0) {
          initialOps.push(
            (async () => {
              await supabase.from('imagenes_propiedad').delete().in('id', deletedMediaIds)
            })()
          )
        }

        await Promise.all(initialOps)

        // Subir nuevos archivos en paralelo (máximo 3 a la vez para no sobrecargar)
        if (newMediaFiles.length > 0) {
          const uploadPromises = newMediaFiles.map(async (media, i) => {
            try {
              const fileExt = media.file.name.split('.').pop()
              const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}-${i}.${fileExt}`
              const filePath = `${propertyId}/${fileName}`

              const { error: uploadError } = await supabase.storage
                .from('propiedades-imagenes')
                .upload(filePath, media.file, { cacheControl: '3600', upsert: false })
              
              if (uploadError) {
                console.error('Upload error:', uploadError)
                return null
              }

              const { data: publicData } = await supabase.storage
                .from('propiedades-imagenes')
                .getPublicUrl(filePath)
              const publicUrl = (publicData as any)?.publicUrl || ''

              const esPrincipal = principalMediaId === media.id

              const { error: insertErr } = await supabase.from('imagenes_propiedad').insert({
                propiedad_id: propertyId,
                url: publicUrl,
                url_thumbnail: null,
                titulo: null,
                descripcion: null,
                orden: i,
                es_principal: esPrincipal,
              })

              if (insertErr) {
                console.error('Insert media error:', insertErr)
                return null
              }
              return true
            } catch (err) {
              console.error('Error processing media:', err)
              return null
            }
          })

          const results = await Promise.all(uploadPromises)
          const uploadedCount = results.filter(r => r !== null).length
          if (uploadedCount > 0) toast.success(`${uploadedCount} archivo(s) multimedia subidos`)
        }

        // Establecer imagen principal si es una existente
        if (principalMediaId && !principalMediaId.startsWith('pending-')) {
          await supabase.from('imagenes_propiedad').update({ es_principal: true }).eq('id', principalMediaId)
        }
      }

      // Cerrar modal inmediatamente y refetch en background
      setIsModalOpen(false)
      refetch()
    } catch (error) {
      console.error('Error saving property:', error)
      toast.error('Error al guardar la propiedad')
    }
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 md:gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-1 md:mb-2">Gestión de Propiedades</h2>
          <p className="text-sm md:text-base text-muted-foreground">{filteredProperties.length} propiedades encontradas</p>
        </div>
        <Button onClick={handleAddProperty} className="bg-secondary hover:bg-secondary/90 text-white shadow-md w-full sm:w-auto">
          <Plus className="h-4 w-4 md:h-5 md:w-5 mr-2" />
          <span className="text-sm md:text-base">Nueva Propiedad</span>
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-3 md:p-4">
        <div className="flex flex-col md:flex-row gap-3 md:gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o ubicación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 md:pl-10 text-sm md:text-base h-9 md:h-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={filterCategory === "all" ? "default" : "outline"}
              onClick={() => setFilterCategory("all")}
              size="sm"
              className="text-xs md:text-sm h-8 md:h-9"
            >
              Todas
            </Button>
            <Button
              variant={filterCategory === "Vivienda" ? "default" : "outline"}
              onClick={() => setFilterCategory("Vivienda")}
              size="sm"
              className="text-xs md:text-sm h-8 md:h-9"
            >
              Vivienda
            </Button>
            <Button
              variant={filterCategory === "Apartamento" ? "default" : "outline"}
              onClick={() => setFilterCategory("Apartamento")}
              size="sm"
              className="text-xs md:text-sm h-8 md:h-9"
            >
              Apartamento
            </Button>
            <Button
              variant={filterCategory === "Local/Oficina" ? "default" : "outline"}
              onClick={() => setFilterCategory("Local/Oficina")}
              size="sm"
              className="text-xs md:text-sm h-8 md:h-9"
            >
              Local/Oficina
            </Button>
            <Button
              variant={filterCategory === "Lote" ? "default" : "outline"}
              onClick={() => setFilterCategory("Lote")}
              size="sm"
              className="text-xs md:text-sm h-8 md:h-9"
            >
              Lote
            </Button>
          </div>
        </div>
      </Card>

      {/* Properties List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:gap-4">
          {filteredProperties.map((property) => (
            <Card key={property.id} className="p-4 md:p-6 hover:shadow-lg transition-shadow">
              <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                {/* Image */}
                <div className="w-full md:w-48 h-40 md:h-48 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <img
                    src={property.imagen_principal || "/placeholder.svg"}
                    alt={property.nombre}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 space-y-2 md:space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                          <h3 className="text-lg md:text-xl font-semibold text-foreground mb-1 truncate">{property.nombre ?? 'Sin nombre'}</h3>
                      <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                        <span className="truncate">{property.direccion}</span>
                      </div>
                    </div>
                    <Badge className={`${getStatusColor(property.estado)} text-white text-xs flex-shrink-0`}>
                      {property.estado}
                    </Badge>
                  </div>

                  <p className="text-sm md:text-base text-muted-foreground line-clamp-2">{property.descripcion}</p>

                  <div className="flex flex-wrap gap-2 md:gap-4 text-xs md:text-sm">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-foreground">Categoría:</span>
                      <span className="text-muted-foreground">{property.categoria}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-foreground">Precio:</span>
                      <span className="text-primary font-bold">{formatPrice(Number(property.precio ?? 0))}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-foreground">m²:</span>
                      <span className="text-muted-foreground">{property.metros_cuadrados}</span>
                    </div>
                  </div>
                  {(property.alcobas ?? 0) > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-foreground">Alcobas:</span>
                      <span className="text-muted-foreground">{property.alcobas}</span>
                    </div>
                  )}
                  {(property.banos ?? 0) > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-foreground">Baños:</span>
                      <span className="text-muted-foreground">{property.banos}</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-3 md:pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditProperty(property)}
                      className="text-xs md:text-sm h-8 md:h-9"
                    >
                      <Edit className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteProperty(property.id)}
                      className="text-destructive hover:text-destructive text-xs md:text-sm h-8 md:h-9"
                    >
                      <Trash2 className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                      Eliminar
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredProperties.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No se encontraron propiedades</p>
        </Card>
      )}

      {/* Property Form Modal */}
      <PropertyFormModal
        key={editingProperty?.id || 'new'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProperty}
        property={editingProperty}
      />
    </div>
  )
}
