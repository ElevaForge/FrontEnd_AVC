import { render, screen } from '@testing-library/react'
import { HeroSection } from '@/components/hero-section'

describe('HeroSection', () => {
  it('renders the main title correctly', () => {
    render(<HeroSection />)
    
    const title = screen.getByText(/Soluciones sólidas para tus/i)
    expect(title).toBeInTheDocument()
  })

  it('renders the AVC logo', () => {
    render(<HeroSection />)
    
    const logo = screen.getByAltText('AVC Logo')
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveAttribute('src', '/Logo.svg')
  })

  it('renders all three CTA buttons', () => {
    render(<HeroSection />)
    
    expect(screen.getByText(/Comprar Propiedad/i)).toBeInTheDocument()
    expect(screen.getByText(/Remodelar/i)).toBeInTheDocument()
    expect(screen.getByText(/Vender Propiedad/i)).toBeInTheDocument()
  })

  it('renders the company slogan', () => {
    render(<HeroSection />)
    
    const slogan = screen.getByText(/Inmobiliaria y Constructora/i)
    expect(slogan).toBeInTheDocument()
  })

  it('renders the subtitle', () => {
    render(<HeroSection />)
    
    const subtitle = screen.getByText(/Tu socio de confianza en el mercado inmobiliario/i)
    expect(subtitle).toBeInTheDocument()
  })
})
