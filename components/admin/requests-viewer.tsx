"use client"

import { useState } from "react"
import { Calendar, User, Phone, MapPin, FileText, Eye, Trash2, CheckCircle, Clock } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSolicitudes } from "@/hooks/use-solicitudes"
import type { Solicitud, TipoSolicitud, EstadoSolicitud } from "@/lib/types"

export function RequestsViewer() {
  const [selectedRequest, setSelectedRequest] = useState<Solicitud | null>(null)
  const [activeTab, setActiveTab] = useState<"todas" | "Remodelacion" | "Venta">("todas")

  const { solicitudes, loading, total, updateEstado, deleteSolicitud } = useSolicitudes(
    activeTab === "todas" ? {} : { tipo: activeTab as TipoSolicitud }
  )

  const filteredRequests = solicitudes

  const handleStatusChange = async (id: string, newStatus: EstadoSolicitud) => {
    await updateEstado(id, newStatus)
  }

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar esta solicitud?")) {
      const success = await deleteSolicitud(id)
      if (success && selectedRequest?.id === id) {
        setSelectedRequest(null)
      }
    }
  }

  const getStatusBadge = (estado: EstadoSolicitud) => {
    const styles = {
      Pendiente: "bg-yellow-500",
      Contactado: "bg-primary",
      En_Proceso: "bg-secondary",
      Completado: "bg-green-600",
      Cancelado: "bg-red-500",
    }
    return <Badge className={`${styles[estado]} text-white`}>{estado.replace('_', ' ')}</Badge>
  }

  const stats = {
    total: solicitudes.length,
    pendientes: solicitudes.filter(r => r.estado === "Pendiente").length,
    remodelacion: solicitudes.filter(r => r.tipo === "Remodelacion").length,
    venta: solicitudes.filter(r => r.tipo === "Venta").length,
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-1 md:mb-2">Solicitudes de Clientes</h2>
        <p className="text-sm md:text-base text-muted-foreground">Gestiona las solicitudes de remodelación y venta</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
        <Card className="p-3 md:p-4">
          <p className="text-xs md:text-sm text-muted-foreground mb-1">Total Solicitudes</p>
          <p className="text-xl md:text-2xl font-bold text-foreground">{stats.total}</p>
        </Card>
        <Card className="p-3 md:p-4">
          <p className="text-xs md:text-sm text-muted-foreground mb-1">Pendientes</p>
          <p className="text-xl md:text-2xl font-bold text-yellow-600">{stats.pendientes}</p>
        </Card>
        <Card className="p-3 md:p-4">
          <p className="text-xs md:text-sm text-muted-foreground mb-1">Remodelación</p>
          <p className="text-xl md:text-2xl font-bold text-primary">{stats.remodelacion}</p>
        </Card>
        <Card className="p-3 md:p-4">
          <p className="text-xs md:text-sm text-muted-foreground mb-1">Venta</p>
          <p className="text-xl md:text-2xl font-bold text-secondary">{stats.venta}</p>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="todas" className="text-xs md:text-sm">Todas ({total})</TabsTrigger>
          <TabsTrigger value="Remodelacion" className="text-xs md:text-sm">Remodelación ({stats.remodelacion})</TabsTrigger>
          <TabsTrigger value="Venta" className="text-xs md:text-sm">Venta ({stats.venta})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4 md:mt-6">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Cargando solicitudes...</p>
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-4 md:gap-6">
              {/* Requests List */}
              <div className="space-y-3 md:space-y-4">
                {filteredRequests.map((request) => (
                  <Card
                    key={request.id}
                    className={`p-3 md:p-4 cursor-pointer transition-all hover:shadow-lg ${
                      selectedRequest?.id === request.id ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => setSelectedRequest(request)}
                  >
                    <div className="flex items-start justify-between mb-2 md:mb-3 gap-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className={`p-1.5 md:p-2 rounded-lg flex-shrink-0 ${
                          request.tipo === "Remodelacion" ? "bg-primary/10" : "bg-secondary/10"
                        }`}>
                          {request.tipo === "Remodelacion" ? (
                            <FileText className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                          ) : (
                            <FileText className="h-4 w-4 md:h-5 md:w-5 text-secondary" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm md:text-base font-semibold text-foreground truncate">{request.nombre_persona}</h3>
                          <p className="text-xs text-muted-foreground">
                            {new Date(request.created_at).toLocaleDateString("es-CO")}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(request.estado)}
                    </div>

                    <div className="space-y-1.5 md:space-y-2 text-xs md:text-sm">
                      <div className="flex items-center gap-1.5 md:gap-2 text-muted-foreground">
                        <Phone className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                        <span className="truncate">{request.telefono}</span>
                      </div>
                      {request.ubicacion && (
                        <div className="flex items-center gap-1.5 md:gap-2 text-muted-foreground">
                          <MapPin className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                          {request.ubicacion}
                        </div>
                      )}
                      <p className="text-muted-foreground line-clamp-2">{request.descripcion}</p>
                    </div>
                  </Card>
                ))}

                {filteredRequests.length === 0 && !loading && (
                  <Card className="p-12 text-center">
                    <p className="text-muted-foreground">No hay solicitudes en esta categoría</p>
                  </Card>
                )}
              </div>

              {/* Request Detail */}
              {selectedRequest ? (
                <Card className="p-4 md:p-6 lg:sticky lg:top-6 h-fit">
                  <div className="flex items-start justify-between mb-4 md:mb-6 gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg md:text-xl font-bold text-foreground mb-1 truncate">{selectedRequest.nombre_persona}</h3>
                      <Badge className={selectedRequest.tipo === "Remodelacion" ? "bg-primary text-white" : "bg-secondary text-white"}>
                        {selectedRequest.tipo === "Remodelacion" ? "Remodelación" : selectedRequest.tipo}
                      </Badge>
                    </div>
                    {getStatusBadge(selectedRequest.estado)}
                  </div>

                  <div className="space-y-3 md:space-y-4">
                    <div>
                      <label className="text-xs md:text-sm font-medium text-muted-foreground">Contacto</label>
                      <div className="flex items-center gap-1.5 md:gap-2 mt-1">
                        <Phone className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground flex-shrink-0" />
                        <p className="text-sm md:text-base text-foreground truncate">{selectedRequest.telefono}</p>
                      </div>
                      {selectedRequest.email && (
                        <p className="text-foreground ml-6">{selectedRequest.email}</p>
                      )}
                    </div>

                    {selectedRequest.ubicacion && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Ubicación</label>
                        <div className="flex items-center gap-2 mt-1">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <p className="text-foreground">{selectedRequest.ubicacion}</p>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Descripción</label>
                      <p className="text-foreground mt-1">{selectedRequest.descripcion}</p>
                    </div>

                    {selectedRequest.fecha_visita_preferida && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Fecha de Visita</label>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <p className="text-foreground">
                            {new Date(selectedRequest.fecha_visita_preferida).toLocaleDateString("es-CO")}
                            {selectedRequest.hora_preferida && ` - ${selectedRequest.hora_preferida}`}
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedRequest.presupuesto_estimado && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Presupuesto Estimado</label>
                        <p className="text-foreground mt-1">
                          {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(selectedRequest.presupuesto_estimado)}
                        </p>
                      </div>
                    )}

                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Tipo de Servicio</label>
                      <p className="text-foreground mt-1 capitalize">{selectedRequest.tipo_servicio}</p>
                    </div>

                    <div className="pt-3 md:pt-4 border-t border-border">
                      <label className="text-xs md:text-sm font-medium text-muted-foreground mb-2 md:mb-3 block">Cambiar Estado</label>
                      <div className="grid grid-cols-2 gap-1.5 md:gap-2">
                        <Button
                          variant={selectedRequest.estado === "Pendiente" ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleStatusChange(selectedRequest.id, "Pendiente")}
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          Pendiente
                        </Button>
                        <Button
                          variant={selectedRequest.estado === "Contactado" ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleStatusChange(selectedRequest.id, "Contactado")}
                        >
                          <Phone className="h-4 w-4 mr-2" />
                          Contactado
                        </Button>
                        <Button
                          variant={selectedRequest.estado === "En_Proceso" ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleStatusChange(selectedRequest.id, "En_Proceso")}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          En Proceso
                        </Button>
                        <Button
                          variant={selectedRequest.estado === "Completado" ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleStatusChange(selectedRequest.id, "Completado")}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Completado
                        </Button>
                      </div>
                    </div>

                    <Button
                      variant="destructive"
                      className="w-full text-xs md:text-sm h-9 md:h-10"
                      onClick={() => handleDelete(selectedRequest.id)}
                    >
                      <Trash2 className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                      Eliminar Solicitud
                    </Button>
                  </div>
                </Card>
              ) : (
                <Card className="p-12 text-center flex items-center justify-center h-64">
                  <p className="text-muted-foreground">Selecciona una solicitud para ver los detalles</p>
                </Card>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
