"use client"

import { useState } from "react"
import { DashboardStats } from "@/components/admin/dashboard-stats"
import { PropertiesManager } from "@/components/admin/properties-manager"
import { RequestsViewer } from "@/components/admin/requests-viewer"
import { AdminHeader } from "@/components/admin/admin-header"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { useAuth } from "@/hooks/use-auth"
import { Loader2 } from "lucide-react"

type AdminView = "dashboard" | "properties" | "requests" | "solicitudes"

export default function AdminPage() {
  const [currentView, setCurrentView] = useState<AdminView>("dashboard")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loginError, setLoginError] = useState("")
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  
  const { user, loading: authLoading, login, logout } = useAuth()

  const handleNavigate = (section: string) => {
    if (section === 'solicitudes' || section === 'requests') {
      setCurrentView('requests')
    } else if (section === 'dashboard' || section === 'properties') {
      setCurrentView(section as AdminView)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError("")
    setIsLoggingIn(true)

    try {
      await login(email, password)
    } catch (error: any) {
      setLoginError(error.message || "Credenciales incorrectas")
    } finally {
      setIsLoggingIn(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary to-[#1a1f3a] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary to-[#1a1f3a] flex items-center justify-center p-4">
        <div className="bg-card rounded-2xl shadow-2xl p-8 w-full max-w-md border border-border">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-lg p-3">
                <img src="/Logo.svg" alt="AVC Logo" className="w-full h-full object-contain" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Panel de Administración</h1>
            <p className="text-muted-foreground">AVC Inmobiliaria y Constructora</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
                placeholder="admin@avc.com"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
                placeholder="Ingresa tu contraseña"
                required
              />
            </div>
            {loginError && (
              <p className="text-sm text-destructive">{loginError}</p>
            )}
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-secondary hover:bg-secondary/90 text-white font-semibold py-3 rounded-lg transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Iniciando...
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader onLogout={logout} onNavigate={handleNavigate} user={user} />
      
      <div className="flex pt-16 md:pt-[73px]">
        <AdminSidebar currentView={currentView} onViewChange={setCurrentView} />
        
        <main className="flex-1 p-4 md:p-6 lg:p-8 ml-0 lg:ml-64 min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-73px)]">
          {currentView === "dashboard" && <DashboardStats />}
          {currentView === "properties" && <PropertiesManager />}
          {(currentView === "requests" || currentView === "solicitudes") && <RequestsViewer />}
        </main>
      </div>
    </div>
  )
}