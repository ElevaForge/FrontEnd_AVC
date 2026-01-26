import { render, screen } from '@testing-library/react'
import { DashboardStats } from '@/components/admin/dashboard-stats'

// Mock the hooks
jest.mock('@/hooks/use-propiedades', () => ({
  usePropiedades: () => ({
    propiedades: [
      { id: '1', estado: 'Disponible', nombre: 'Test 1' },
      { id: '2', estado: 'Vendida', nombre: 'Test 2' },
      { id: '3', estado: 'Reservada', nombre: 'Test 3' },
    ],
    loading: false,
  }),
}))

jest.mock('@/hooks/use-solicitudes', () => ({
  useSolicitudes: () => ({
    solicitudes: [
      {
        id: '1',
        tipo: 'Remodelacion',
        estado: 'Pendiente',
        nombre_persona: 'Juan Pérez',
        descripcion: 'Solicitud de remodelación de cocina',
        created_at: '2024-01-15T10:00:00Z',
      },
      {
        id: '2',
        tipo: 'Venta',
        estado: 'Completado',
        nombre_persona: 'María García',
        descripcion: 'Venta de apartamento',
        created_at: '2024-01-14T10:00:00Z',
      },
    ],
    loading: false,
  }),
}))

describe('DashboardStats', () => {
  it('renders the dashboard title', () => {
    render(<DashboardStats />)
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText(/Vista general de tu negocio inmobiliario/i)).toBeInTheDocument()
  })

  it('displays correct property statistics', () => {
    render(<DashboardStats />)
    
    expect(screen.getByText('Total Propiedades')).toBeInTheDocument()
    expect(screen.getByText('Disponibles')).toBeInTheDocument()
    expect(screen.getByText('Vendidas')).toBeInTheDocument()
    expect(screen.getByText('Reservadas')).toBeInTheDocument()
  })

  it('displays correct property counts', () => {
    render(<DashboardStats />)
    
    // Total: 3 properties
    const totalCards = screen.getAllByText('3')
    expect(totalCards.length).toBeGreaterThan(0)
  })

  it('displays solicitudes statistics', () => {
    render(<DashboardStats />)
    
    expect(screen.getByText('Total Solicitudes')).toBeInTheDocument()
    expect(screen.getByText('Remodelación')).toBeInTheDocument()
  })

  it('renders recent activity section', () => {
    render(<DashboardStats />)
    
    expect(screen.getByText('Actividad Reciente')).toBeInTheDocument()
  })

  it('displays recent solicitudes in activity feed', () => {
    render(<DashboardStats />)
    
    expect(screen.getByText(/Juan Pérez/i)).toBeInTheDocument()
    expect(screen.getByText(/María García/i)).toBeInTheDocument()
  })

  it('shows loading state when data is loading', () => {
    // Override the mock for this test
    jest.spyOn(require('@/hooks/use-propiedades'), 'usePropiedades').mockReturnValue({
      propiedades: [],
      loading: true,
    })

    render(<DashboardStats />)
    
    // Should show spinner
    const spinner = document.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })
})
