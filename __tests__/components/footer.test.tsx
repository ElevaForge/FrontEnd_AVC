import { render, screen } from '@testing-library/react'
import { Footer } from '@/components/footer'

describe('Footer', () => {
  it('renders the company name and logo', () => {
    render(<Footer />)
    
    const logo = screen.getByAltText('AVC Logo')
    expect(logo).toBeInTheDocument()
    expect(screen.getByText('AVC')).toBeInTheDocument()
    expect(screen.getByText('Inmobiliaria y Constructora')).toBeInTheDocument()
  })

  it('renders the company slogan', () => {
    render(<Footer />)
    
    const slogan = screen.getByText(/Soluciones sólidas para tus proyectos de vida/i)
    expect(slogan).toBeInTheDocument()
  })

  it('renders quick links section', () => {
    render(<Footer />)
    
    expect(screen.getByText('Enlaces Rápidos')).toBeInTheDocument()
    expect(screen.getByText('Comprar')).toBeInTheDocument()
    expect(screen.getByText('Remodelar')).toBeInTheDocument()
    expect(screen.getByText('Vender')).toBeInTheDocument()
  })

  it('renders contact information', () => {
    render(<Footer />)
    
    expect(screen.getByText('Contáctanos')).toBeInTheDocument()
    expect(screen.getByText(/Mz 4 cs 1 Villa Aurora, Pasto/i)).toBeInTheDocument()
    expect(screen.getByText(/\+57 311 7284320/i)).toBeInTheDocument()
    expect(screen.getByText(/avcinmobiliariayconstructora@gmail.com/i)).toBeInTheDocument()
  })

  it('renders social media link', () => {
    render(<Footer />)
    
    const facebookLink = screen.getByLabelText('Facebook')
    expect(facebookLink).toBeInTheDocument()
    expect(facebookLink).toHaveAttribute('href', 'https://www.facebook.com/avcinmobiliariayconstructora/')
  })

  it('renders copyright text with current year', () => {
    render(<Footer />)
    
    const currentYear = new Date().getFullYear()
    const copyright = screen.getByText(new RegExp(`© ${currentYear} AVC Inmobiliaria y Constructora`))
    expect(copyright).toBeInTheDocument()
  })

  it('renders ElevaForge credit', () => {
    render(<Footer />)
    
    expect(screen.getByText(/Un producto de ElevaForge/i)).toBeInTheDocument()
  })
})
