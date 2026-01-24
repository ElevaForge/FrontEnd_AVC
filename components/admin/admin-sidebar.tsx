"use client"

import { LayoutDashboard, Home, FileText, Settings, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { Button } from "@/components/ui/button"

interface AdminSidebarProps {
  currentView: string
  onViewChange: (view: "dashboard" | "properties" | "requests") => void
}

export function AdminSidebar({ currentView, onViewChange }: AdminSidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "properties", label: "Propiedades", icon: Home },
    { id: "requests", label: "Solicitudes", icon: FileText },
  ]

  const handleMenuClick = (id: string) => {
    onViewChange(id as any)
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="fixed bottom-4 right-4 lg:hidden z-50 h-12 w-12 rounded-full bg-secondary text-white shadow-lg hover:bg-secondary/90"
      >
        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={cn(
        "fixed top-16 md:top-[73px] bottom-0 left-0 z-40 w-64 bg-card border-r border-border shadow-lg transform transition-transform duration-300 ease-in-out lg:hidden",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <nav className="flex-1 px-4 py-6 space-y-2 h-full overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item.id)}
              className={cn(
                "flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left transition-all",
                currentView === item.id
                  ? "bg-gradient-to-r from-secondary to-secondary/90 text-white shadow-md"
                  : "text-foreground hover:bg-muted"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
          
          <div className="pt-4 mt-4 border-t border-border">
            <button className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-foreground hover:bg-muted transition-colors">
              <Settings className="h-5 w-5" />
              <span className="font-medium">Configuración</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:top-16 md:lg:top-[73px] lg:bottom-0 lg:left-0 lg:w-64 lg:bg-card lg:border-r lg:border-border lg:shadow-lg">
        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id as any)}
              className={cn(
                "flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left transition-all",
                currentView === item.id
                  ? "bg-gradient-to-r from-secondary to-secondary/90 text-white shadow-md"
                  : "text-foreground hover:bg-muted"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
        
        <div className="p-4 border-t border-border">
          <button className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-foreground hover:bg-muted transition-colors">
            <Settings className="h-5 w-5" />
            <span className="font-medium">Configuración</span>
          </button>
        </div>
      </aside>
    </>
  )
}
