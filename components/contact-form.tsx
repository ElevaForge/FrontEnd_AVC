"use client"

import type React from "react"

import { useState } from "react"
import { MapPin, User, Phone, Calendar, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"

interface ContactFormProps {
  type: "remodelacion" | "venta"
}

interface FormData {
  ubicacion: string
  descripcion: string
  nombre: string
  contacto: string
  fechaVisita: string
  tipoServicio: string
}

interface FormErrors {
  ubicacion?: string
  descripcion?: string
  nombre?: string
  contacto?: string
  fechaVisita?: string
}

export function ContactForm({ type }: ContactFormProps) {
  const [formData, setFormData] = useState<FormData>({
    ubicacion: "",
    descripcion: "",
    nombre: "",
    contacto: "",
    fechaVisita: "",
    tipoServicio: type === "remodelacion" ? "renovacion" : "vender",
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case "ubicacion":
        if (!value.trim()) return "La ubicación es requerida"
        if (value.length < 5) return "Ingresa una ubicación válida"
        break
      case "descripcion":
        if (!value.trim()) return "La descripción es requerida"
        if (value.length < 20) return "La descripción debe tener al menos 20 caracteres"
        break
      case "nombre":
        if (!value.trim()) return "El nombre es requerido"
        if (value.length < 3) return "El nombre debe tener al menos 3 caracteres"
        break
      case "contacto":
        if (!value.trim()) return "El contacto es requerido"
        const phoneRegex = /^[0-9]{10}$/
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!phoneRegex.test(value) && !emailRegex.test(value)) {
          return "Ingresa un teléfono (10 dígitos) o email válido"
        }
        break
      case "fechaVisita":
        if (!value) return "La fecha de visita es requerida"
        const selectedDate = new Date(value)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        if (selectedDate < today) return "La fecha debe ser futura"
        break
    }
    return undefined
  }

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (touched[name]) {
      const error = validateField(name, value)
      setErrors((prev) => ({ ...prev, [name]: error }))
    }
  }

  const handleBlur = (name: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }))
    const error = validateField(name, formData[name as keyof FormData])
    setErrors((prev) => ({ ...prev, [name]: error }))
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    let isValid = true
    ;["ubicacion", "descripcion", "nombre", "contacto", "fechaVisita"].forEach((field) => {
      const error = validateField(field, formData[field as keyof FormData])
      if (error) {
        newErrors[field as keyof FormErrors] = error
        isValid = false
      }
    })

    setErrors(newErrors)
    setTouched({
      ubicacion: true,
      descripcion: true,
      nombre: true,
      contacto: true,
      fechaVisita: true,
    })

    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error("Por favor corrige los errores en el formulario")
      return
    }

    setIsSubmitting(true)

    try {
      // Preparar datos según el tipo
      const telefono = formData.contacto.match(/^\d+$/) ? formData.contacto : ''
      const email = formData.contacto.includes('@') ? formData.contacto : ''

      // Crear solicitud directamente en Supabase
      const solicitudData = {
        tipo: type === "remodelacion" ? "Remodelacion" : "Venta",
        tipo_servicio: formData.tipoServicio,
        nombre_persona: formData.nombre,
        email: email || null,
        telefono: telefono || formData.contacto,
        ubicacion: formData.ubicacion,
        descripcion: formData.descripcion,
        estado: "Pendiente",
      }

      const { error } = await supabase.from('solicitudes').insert(solicitudData)

      if (error) {
        console.error('Error inserting solicitud:', error)
        throw new Error(error.message || 'Error al enviar solicitud')
      }

      toast.success(
        type === "remodelacion" ? "¡Solicitud de remodelación enviada!" : "¡Solicitud de venta enviada!",
        {
          description: "Nos pondremos en contacto contigo pronto.",
        }
      )

      // Reset form
      setFormData({
        ubicacion: "",
        descripcion: "",
        nombre: "",
        contacto: "",
        fechaVisita: "",
        tipoServicio: type === "remodelacion" ? "renovacion" : "vender",
      })
      setTouched({})
      setErrors({})
    } catch (error) {
      console.error('Error:', error)
      toast.error(error instanceof Error ? error.message : "Error al enviar la solicitud")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getInputState = (name: string): "default" | "error" | "success" => {
    if (!touched[name]) return "default"
    if (errors[name as keyof FormErrors]) return "error"
    return "success"
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Ubicación */}
      <div className="space-y-2">
        <Label htmlFor={`${type}-ubicacion`} className="text-card-foreground">
          Ubicación de la propiedad
        </Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            id={`${type}-ubicacion`}
            placeholder="Ej: Calle 123 #45-67, Bogotá"
            value={formData.ubicacion}
            onChange={(e) => handleChange("ubicacion", e.target.value)}
            onBlur={() => handleBlur("ubicacion")}
            className={cn(
              "pl-10",
              getInputState("ubicacion") === "error" && "border-destructive focus-visible:ring-destructive",
              getInputState("ubicacion") === "success" && "border-green-500 focus-visible:ring-green-500",
            )}
          />
          {getInputState("ubicacion") === "success" && (
            <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
          )}
        </div>
        {errors.ubicacion && touched.ubicacion && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {errors.ubicacion}
          </p>
        )}
      </div>

      {/* Descripción */}
      <div className="space-y-2">
        <Label htmlFor={`${type}-descripcion`} className="text-card-foreground">
          {type === "remodelacion" ? "Describe tu proyecto" : "Describe tu propiedad"}
        </Label>
        <div className="relative">
          <Textarea
            id={`${type}-descripcion`}
            placeholder={
              type === "remodelacion"
                ? "Cuéntanos qué deseas remodelar, materiales preferidos, etc."
                : "Describe las características principales de tu propiedad..."
            }
            rows={4}
            value={formData.descripcion}
            onChange={(e) => handleChange("descripcion", e.target.value)}
            onBlur={() => handleBlur("descripcion")}
            className={cn(
              getInputState("descripcion") === "error" && "border-destructive focus-visible:ring-destructive",
              getInputState("descripcion") === "success" && "border-green-500 focus-visible:ring-green-500",
            )}
          />
        </div>
        {errors.descripcion && touched.descripcion && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {errors.descripcion}
          </p>
        )}
      </div>

      {/* Nombre */}
      <div className="space-y-2">
        <Label htmlFor={`${type}-nombre`} className="text-card-foreground">
          Nombre completo
        </Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            id={`${type}-nombre`}
            placeholder="Tu nombre completo"
            value={formData.nombre}
            onChange={(e) => handleChange("nombre", e.target.value)}
            onBlur={() => handleBlur("nombre")}
            className={cn(
              "pl-10",
              getInputState("nombre") === "error" && "border-destructive focus-visible:ring-destructive",
              getInputState("nombre") === "success" && "border-green-500 focus-visible:ring-green-500",
            )}
          />
          {getInputState("nombre") === "success" && (
            <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
          )}
        </div>
        {errors.nombre && touched.nombre && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {errors.nombre}
          </p>
        )}
      </div>

      {/* Contacto */}
      <div className="space-y-2">
        <Label htmlFor={`${type}-contacto`} className="text-card-foreground">
          Teléfono o Email
        </Label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            id={`${type}-contacto`}
            placeholder="3001234567 o tu@email.com"
            value={formData.contacto}
            onChange={(e) => handleChange("contacto", e.target.value)}
            onBlur={() => handleBlur("contacto")}
            className={cn(
              "pl-10",
              getInputState("contacto") === "error" && "border-destructive focus-visible:ring-destructive",
              getInputState("contacto") === "success" && "border-green-500 focus-visible:ring-green-500",
            )}
          />
          {getInputState("contacto") === "success" && (
            <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
          )}
        </div>
        {errors.contacto && touched.contacto && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {errors.contacto}
          </p>
        )}
      </div>

      {/* Fecha de Visita */}
      <div className="space-y-2">
        <Label htmlFor={`${type}-fecha`} className="text-card-foreground">
          Fecha y hora preferida para visita
        </Label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            id={`${type}-fecha`}
            type="datetime-local"
            value={formData.fechaVisita}
            onChange={(e) => handleChange("fechaVisita", e.target.value)}
            onBlur={() => handleBlur("fechaVisita")}
            className={cn(
              "pl-10",
              getInputState("fechaVisita") === "error" && "border-destructive focus-visible:ring-destructive",
              getInputState("fechaVisita") === "success" && "border-green-500 focus-visible:ring-green-500",
            )}
          />
        </div>
        {errors.fechaVisita && touched.fechaVisita && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {errors.fechaVisita}
          </p>
        )}
      </div>

      {/* Tipo de Servicio */}
      <div className="space-y-3">
        <Label className="text-card-foreground">Tipo de servicio</Label>
        <RadioGroup
          value={formData.tipoServicio}
          onValueChange={(value) => handleChange("tipoServicio", value)}
          className="flex gap-4"
        >
          {type === "remodelacion" ? (
            <>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="renovacion" id={`${type}-renovacion`} />
                <Label htmlFor={`${type}-renovacion`} className="cursor-pointer">
                  Renovación
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="construccion" id={`${type}-construccion`} />
                <Label htmlFor={`${type}-construccion`} className="cursor-pointer">
                  Construcción
                </Label>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="vender" id={`${type}-vender`} />
                <Label htmlFor={`${type}-vender`} className="cursor-pointer">
                  Vender
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="arrendar" id={`${type}-arrendar`} />
                <Label htmlFor={`${type}-arrendar`} className="cursor-pointer">
                  Arrendar
                </Label>
              </div>
            </>
          )}
        </RadioGroup>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-secondary hover:bg-secondary/90 text-white py-6 text-lg"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Enviando...
          </>
        ) : (
          <>
            <FileText className="mr-2 h-5 w-5" />
            Solicitar Visita
          </>
        )}
      </Button>
    </form>
  )
}
