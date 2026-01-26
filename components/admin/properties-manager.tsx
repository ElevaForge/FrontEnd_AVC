"use client"

import { useState } from "react"
import { Plus, Search, Filter, Edit, Trash2, Eye, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PropertyFormModal } from "./property-form-modal"
import { usePropiedades } from "@/hooks/use-propiedades"
import type { PropiedadCompleta, CategoriaPropiedad } from "@/lib/types"
import { toast } from "sonner"
import { apiPost, apiPut, apiDelete } from "@/lib/api"

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
  
  const { propiedades, loading, refetch } = usePropiedades({})

  const filteredProperties = (propiedades || []).filter(property => {
    const matchesSearch = property.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.direccion.toLowerCase().includes(searchTerm.toLowerCase())
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
    if (!confirm("¿Estás seguro de eliminar esta propiedad?")) {
      return
    }

    try {
      const response = await apiDelete(`/propiedades/${id}`)
      
      if (response.success) {
        toast.success("Propiedad eliminada exitosamente")
        refetch()
      } else {
        toast.error(response.error || "Error al eliminar la propiedad")
      }
    } catch (error) {
      console.error('Error deleting property:', error)
      toast.error("Error al eliminar la propiedad")
    }
  }

  const handleSaveProperty = async (property: Partial<PropiedadCompleta>) => {
    try {
      // Filtrar solo los campos que el backend acepta y eliminar undefined/null
      const propertyData: Record<string, unknown> = {}
      
      // Solo agregar campos que tienen valores definidos
      if (property.nombre !== undefined && property.nombre !== null) {
        propertyData.nombre = property.nombre
      }
      if (property.categoria !== undefined && property.categoria !== null) {
        propertyData.categoria = property.categoria
      }
      if (property.descripcion !== undefined && property.descripcion !== null) {
        propertyData.descripcion = property.descripcion
      }
      if (property.direccion !== undefined && property.direccion !== null) {
        propertyData.direccion = property.direccion
      }
      if (property.tipo_accion !== undefined && property.tipo_accion !== null) {
        propertyData.tipo_accion = property.tipo_accion
      }
      if (property.precio !== undefined && property.precio !== null) {
        propertyData.precio = Number(property.precio)
      }
      if (property.precio_administracion !== undefined && property.precio_administracion !== null) {
        propertyData.precio_administracion = Number(property.precio_administracion)
      }
      if (property.alcobas !== undefined && property.alcobas !== null) {
        propertyData.alcobas = Number(property.alcobas)
      }
      if (property.banos !== undefined && property.banos !== null) {
        propertyData.banos = Number(property.banos)
      }
      if (property.parqueaderos !== undefined && property.parqueaderos !== null) {
        propertyData.parqueaderos = Number(property.parqueaderos)
      }
      if (property.metros_cuadrados !== undefined && property.metros_cuadrados !== null) {
        propertyData.metros_cuadrados = Number(property.metros_cuadrados)
      }
      if (property.metros_construidos !== undefined && property.metros_construidos !== null) {
        propertyData.metros_construidos = Number(property.metros_construidos)
      }
      if (property.estado !== undefined && property.estado !== null) {
        propertyData.estado = property.estado
      }
      if (property.destacada !== undefined) {
        propertyData.destacada = Boolean(property.destacada)
      }
      if (property.activo !== undefined) {
        propertyData.activo = Boolean(property.activo)
      }
      
      console.log('Datos a enviar (filtrados):', JSON.stringify(propertyData, null, 2))
      console.log('Es edición:', !!editingProperty?.id)
      console.log('Imagen a guardar:', property.imagen_principal)
      
      // Si tiene ID, es una edición
      if (editingProperty?.id) {
        const response = await apiPut(`/propiedades/${editingProperty.id}`, propertyData) as any
        
        console.log('Respuesta del servidor (PUT):', response)
        console.log('Detalles de validación:', response.details)
        
        if (response.success) {
          toast.success("Propiedad actualizada exitosamente")
          setIsModalOpen(false)
          refetch()
        } else {
          console.error('Error del servidor:', response.error)
          console.error('Detalles del error:', response.details)
          
          // Mostrar detalles específicos del error de validación
          if (response.details && Array.isArray(response.details)) {
            const errorMessages = response.details.map((d: any) => `${d.field}: ${d.message}`).join(', ')
            toast.error(`Error de validación: ${errorMessages}`)
          } else {
            toast.error(response.error || "Error al actualizar la propiedad")
          }
        }
      } else {
        // Es una creación nueva
        const response = await apiPost<PropiedadCompleta>('/propiedades', propertyData)
        
        console.log('Respuesta del servidor (POST):', response)
        
        if (response.success && response.data) {
          // Si hay imagen, agregarla después de crear la propiedad
          if (property.imagen_principal && response.data.id) {
            console.log('Agregando imagen a propiedad:', response.data.id)
            const imageResponse = await apiPost(`/propiedades/${response.data.id}/imagenes`, {
              url: property.imagen_principal,
              es_principal: true,
              orden: 0
            })
            
            if (!imageResponse.success) {
              console.error('Error al agregar imagen:', imageResponse.error)
              toast.warning("Propiedad creada pero la imagen no se pudo agregar")
            }
          }
          
          toast.success("Propiedad creada exitosamente")
          setIsModalOpen(false)
          refetch()
        } else {
          console.error('Error del servidor:', response.error)
          toast.error(response.error || "Error al crear la propiedad")
        }
      }
    } catch (error) {
      console.error('Error saving property:', error)
      toast.error("Error al guardar la propiedad")
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
                      <h3 className="text-lg md:text-xl font-semibold text-foreground mb-1 truncate">{property.nombre}</h3>
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
                      <span className="text-primary font-bold">{formatPrice(property.precio)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-foreground">m²:</span>
                      <span className="text-muted-foreground">{property.metros_cuadrados}</span>
                    </div>
                  </div>
                  {property.alcobas > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-foreground">Alcobas:</span>
                      <span className="text-muted-foreground">{property.alcobas}</span>
                    </div>
                  )}
                  {property.banos > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-foreground">Baños:</span>
                      <span className="text-muted-foreground">{property.banos}</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-3 md:pt-4 border-t">
                    <Button variant="outline" size="sm" className="text-xs md:text-sm h-8 md:h-9">
                      <Eye className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                      Ver
                    </Button>
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
