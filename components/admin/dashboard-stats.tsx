"use client"

import { Home, FileText, DollarSign, TrendingUp, Users, CheckCircle } from "lucide-react"
import { Card } from "@/components/ui/card"
import { usePropiedades } from "@/hooks/use-propiedades"
import { useSolicitudes } from "@/hooks/use-solicitudes"

export function DashboardStats() {
  // Obtener datos reales del backend
  const { propiedades, loading: loadingProps } = usePropiedades({})
  const { solicitudes, loading: loadingSols } = useSolicitudes()

  const stats = {
    totalProperties: propiedades?.length || 0,
    availableProperties: propiedades?.filter(p => p.estado === "Disponible").length || 0,
    soldProperties: propiedades?.filter(p => p.estado === "Vendida").length || 0,
    reservedProperties: propiedades?.filter(p => p.estado === "Reservada").length || 0,
    arrendadas: propiedades?.filter(p => p.estado === "Arrendada").length || 0,
    totalRequests: solicitudes?.length || 0,
    remodelingRequests: solicitudes?.filter(s => s.tipo === "Remodelacion").length || 0,
    saleRequests: solicitudes?.filter(s => s.tipo === "Venta").length || 0,
  }

  const loading = loadingProps || loadingSols

  const cards = [
    {
      title: "Total Propiedades",
      value: stats.totalProperties,
      icon: Home,
      color: "text-primary",
      bgColor: "bg-primary/10",
      trend: "+2 este mes"
    },
    {
      title: "Disponibles",
      value: stats.availableProperties,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Reservadas",
      value: stats.reservedProperties,
      icon: TrendingUp,
      color: "text-yellow-600",
      bgColor: "bg-yellow-500/10",
    },
    {
      title: "Vendidas",
      value: stats.soldProperties,
      icon: DollarSign,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
    {
      title: "Total Solicitudes",
      value: stats.totalRequests,
      icon: FileText,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
      trend: "+3 esta semana"
    },
    {
      title: "Remodelación",
      value: stats.remodelingRequests,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ]

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-1 md:mb-2">Dashboard</h2>
        <p className="text-sm md:text-base text-muted-foreground">Vista general de tu negocio inmobiliario</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4 lg:gap-6">
            {cards.map((card, index) => (
              <Card key={index} className="p-4 md:p-5 lg:p-6 hover:shadow-lg transition-shadow min-w-0">
                <div className="flex items-center justify-between mb-2 md:mb-3 gap-2">
                  <div className={`p-2 md:p-2.5 lg:p-3 rounded-lg ${card.bgColor} flex-shrink-0`}>
                    <card.icon className={`h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 ${card.color}`} />
                  </div>
                  {card.trend && (
                    <span className="text-[10px] sm:text-xs text-secondary font-medium truncate">{card.trend}</span>
                  )}
                </div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground mb-1">{card.value}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">{card.title}</p>
              </Card>
            ))}
          </div>

          {/* Recent Activity */}
          <Card className="p-4 md:p-6">
            <h3 className="text-lg md:text-xl font-semibold text-foreground mb-3 md:mb-4">Actividad Reciente</h3>
            {solicitudes && solicitudes.length > 0 ? (
              <div className="space-y-2 sm:space-y-3 md:space-y-4">
                {solicitudes.slice(0, 5).map((solicitud, index) => (
                  <div key={solicitud.id} className="flex items-start gap-2 sm:gap-3 md:gap-4 pb-2 sm:pb-3 md:pb-4 border-b border-border last:border-0">
                    <div className={`h-2 w-2 rounded-full mt-2 ${
                      solicitud.estado === 'Pendiente' ? 'bg-yellow-500' :
                      solicitud.estado === 'Contactado' ? 'bg-orange-500' :
                      solicitud.estado === 'En_Proceso' ? 'bg-blue-500' :
                      solicitud.estado === 'Completado' ? 'bg-green-500' :
                      'bg-gray-500'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm md:text-base text-foreground font-medium line-clamp-1">
                        Solicitud de {solicitud.tipo}: {solicitud.descripcion?.substring(0, 50)}...
                      </p>
                      <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground truncate">
                        {solicitud.nombre_persona} • {new Date(solicitud.created_at).toLocaleDateString('es-CO')}
                      </p>
                    </div>
                    <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full flex-shrink-0 ${
                      solicitud.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-700' :
                      solicitud.estado === 'Contactado' ? 'bg-orange-100 text-orange-700' :
                      solicitud.estado === 'En_Proceso' ? 'bg-blue-100 text-blue-700' :
                      solicitud.estado === 'Completado' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {solicitud.estado === 'En_Proceso' ? 'En Proceso' : solicitud.estado}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No hay actividad reciente</p>
            )}
          </Card>
        </>
      )}
    </div>
  )
}
