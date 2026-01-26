import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AdminHeader } from '@/components/admin/admin-header'

// Mock the hooks
jest.mock('@/hooks/use-solicitudes', () => ({
  useSolicitudes: () => ({
    solicitudes: [
      {
        id: '1',
        tipo: 'Remodelacion',
        estado: 'Pendiente',
        nombre_persona: 'Juan Pérez',
        descripcion: 'Solicitud de remodelación',
        created_at: '2024-01-15T10:00:00Z',
      },
      {
        id: '2',
        tipo: 'Venta',
        estado: 'Contactado',
        nombre_persona: 'María García',
        descripcion: 'Venta de apartamento',
        created_at: '2024-01-14T10:00:00Z',
      },
    ],
  }),
}))

describe('AdminHeader', () => {
  const mockOnLogout = jest.fn()
  const mockOnNavigate = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the admin header with logo', () => {
    render(<AdminHeader onLogout={mockOnLogout} onNavigate={mockOnNavigate} />)
    
    const logo = screen.getByAltText('AVC Logo')
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveAttribute('src', '/Logo.svg')
  })

  it('renders the admin panel title', () => {
    render(<AdminHeader onLogout={mockOnLogout} onNavigate={mockOnNavigate} />)
    
    expect(screen.getByText('Panel de Administración')).toBeInTheDocument()
    expect(screen.getByText('AVC Inmobiliaria y Constructora')).toBeInTheDocument()
  })

  it('displays notification bell with badge when there are pending solicitudes', () => {
    render(<AdminHeader onLogout={mockOnLogout} onNavigate={mockOnNavigate} />)
    
    // Should show badge with count of pending solicitudes
    const badge = screen.getByText('1') // 1 pending solicitude
    expect(badge).toBeInTheDocument()
  })

  it('renders administrator info', () => {
    render(<AdminHeader onLogout={mockOnLogout} onNavigate={mockOnNavigate} />)
    
    expect(screen.getByText('Administrador')).toBeInTheDocument()
    expect(screen.getByText('admin@avc.com')).toBeInTheDocument()
  })

  it('renders logout button', () => {
    render(<AdminHeader onLogout={mockOnLogout} onNavigate={mockOnNavigate} />)
    
    const logoutButton = screen.getByText('Salir')
    expect(logoutButton).toBeInTheDocument()
  })

  it('calls onLogout when logout button is clicked', () => {
    render(<AdminHeader onLogout={mockOnLogout} onNavigate={mockOnNavigate} />)
    
    const logoutButton = screen.getByText('Salir')
    fireEvent.click(logoutButton)
    
    expect(mockOnLogout).toHaveBeenCalledTimes(1)
  })

  it('renders notification bell button', () => {
    render(<AdminHeader onLogout={mockOnLogout} onNavigate={mockOnNavigate} />)
    
    // Find the notification bell button
    const bellButton = screen.getByRole('button', { name: 'Notificaciones' })
    expect(bellButton).toBeInTheDocument()
    expect(bellButton).toHaveAttribute('aria-haspopup', 'menu')
  })

  it('renders avatar with initial letter', () => {
    render(<AdminHeader onLogout={mockOnLogout} onNavigate={mockOnNavigate} />)
    
    // Should show 'A' for Administrador
    const avatars = screen.getAllByText('A')
    expect(avatars.length).toBeGreaterThan(0)
  })
})
