"use client"

import { LogOut, Bell, FileText, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSolicitudes } from "@/hooks/use-solicitudes"
import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

interface AdminHeaderProps {
  onLogout: () => void
  onNavigate?: (section: string) => void
}

export function AdminHeader({ onLogout, onNavigate }: AdminHeaderProps) {
  const { solicitudes } = useSolicitudes()
  const [open, setOpen] = useState(false)
  
  // Obtener solo las solicitudes pendientes
  const pendingSolicitudes = solicitudes?.filter(s => s.estado === 'Pendiente') || []
  const recentSolicitudes = solicitudes?.slice(0, 5) || []

  const handleViewAll = () => {
    setOpen(false)
    if (onNavigate) {
      onNavigate('solicitudes')
    }
  }
  return (
    <header className="bg-gradient-to-r from-primary to-[#1a1f3a] border-b border-primary/20 fixed top-0 left-0 right-0 z-50 shadow-lg h-16 md:h-[73px]">
      <div className="flex items-center justify-between px-4 md:px-6 h-full">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-lg flex items-center justify-center shadow-md p-1">
            <img src="/Logo.svg" alt="AVC Logo" className="w-full h-full object-contain" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg md:text-xl font-bold text-white">Panel de Administración</h1>
            <p className="text-xs text-white/70">AVC Inmobiliaria y Constructora</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative hover:bg-white/10 text-white" aria-label="Notificaciones">
                <Bell className="h-5 w-5" />
                {pendingSolicitudes.length > 0 && (
                  <Badge 
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-secondary text-white border-2 border-primary text-xs"
                  >
                    {pendingSolicitudes.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notificaciones</span>
                {pendingSolicitudes.length > 0 && (
                  <Badge variant="secondary">{pendingSolicitudes.length} nuevas</Badge>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {recentSolicitudes.length > 0 ? (
                <>
                  <div className="max-h-96 overflow-y-auto">
                    {recentSolicitudes.map((solicitud) => (
                      <DropdownMenuItem 
                        key={solicitud.id}
                        className="flex flex-col items-start gap-1 p-3 cursor-pointer"
                      >
                        <div className="flex items-start gap-2 w-full">
                          <FileText className="h-4 w-4 mt-0.5 flex-shrink-0 text-secondary" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              Solicitud de {solicitud.tipo}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {solicitud.nombre_persona}
                            </p>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {solicitud.descripcion}
                            </p>
                          </div>
                          <Badge 
                            variant={solicitud.estado === 'Pendiente' ? 'default' : 'secondary'}
                            className="text-xs flex-shrink-0"
                          >
                            {solicitud.estado === 'En_Proceso' ? 'En Proceso' : solicitud.estado}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground ml-6">
                          {new Date(solicitud.created_at).toLocaleDateString('es-CO', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </DropdownMenuItem>
                    ))}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-center justify-center text-secondary cursor-pointer"
                    onClick={handleViewAll}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver todas las solicitudes
                  </DropdownMenuItem>
                </>
              ) : (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No hay notificaciones
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <div className="hidden md:flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-white">Administrador</p>
              <p className="text-xs text-white/70">admin@avc.com</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center shadow-md">
              <span className="text-white font-semibold">A</span>
            </div>
          </div>
          
          <div className="md:hidden h-8 w-8 rounded-full bg-secondary flex items-center justify-center shadow-md">
            <span className="text-white text-sm font-semibold">A</span>
          </div>
          
          <Button 
            onClick={onLogout} 
            size="sm" 
            className="bg-white/10 border border-white/30 text-white hover:bg-white/20 hover:border-white/50 transition-all hidden md:flex"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Salir
          </Button>
        </div>
      </div>
    </header>
  )
}
