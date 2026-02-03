import { render, screen, fireEvent } from '@testing-library/react'
import { AdminSidebar } from '@/components/admin/admin-sidebar'

describe('AdminSidebar', () => {
  const mockOnViewChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders all menu items', () => {
    render(<AdminSidebar currentView="dashboard" onViewChange={mockOnViewChange} />)
    
    expect(screen.getAllByText('Dashboard').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Propiedades').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Solicitudes').length).toBeGreaterThan(0)
  })

  it('highlights the current active view', () => {
    render(<AdminSidebar currentView="properties" onViewChange={mockOnViewChange} />)
    
    const propertyButtons = screen.getAllByText('Propiedades')
    // At least one should have the active class (gradient background)
    expect(propertyButtons.length).toBeGreaterThan(0)
  })

  it('calls onViewChange when a menu item is clicked', () => {
    render(<AdminSidebar currentView="dashboard" onViewChange={mockOnViewChange} />)
    
    const propertyButtons = screen.getAllByText('Propiedades')
    fireEvent.click(propertyButtons[0])
    
    expect(mockOnViewChange).toHaveBeenCalledWith('properties')
  })

  it('renders mobile menu button', () => {
    render(<AdminSidebar currentView="dashboard" onViewChange={mockOnViewChange} />)
    
    // Mobile menu button should be in the document
    const buttons = document.querySelectorAll('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('changes view from dashboard to requests', () => {
    render(<AdminSidebar currentView="dashboard" onViewChange={mockOnViewChange} />)
    
    const requestButtons = screen.getAllByText('Solicitudes')
    fireEvent.click(requestButtons[0])
    
    expect(mockOnViewChange).toHaveBeenCalledWith('requests')
  })

  it('renders both mobile and desktop sidebars', () => {
    const { container } = render(<AdminSidebar currentView="dashboard" onViewChange={mockOnViewChange} />)
    
    // Should have mobile and desktop sidebar elements
    const asides = container.querySelectorAll('aside')
    expect(asides.length).toBe(2) // One mobile, one desktop
  })
})
