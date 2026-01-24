"use client"

import { Home, Building2, Store, TreePine, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface CategoryCardProps {
  title: string
  description: string
  icon: "vivienda" | "apartamento" | "local" | "lote"
  isActive: boolean
  onClick: () => void
}

const iconMap: Record<string, LucideIcon> = {
  vivienda: Home,
  apartamento: Building2,
  local: Store,
  lote: TreePine,
}

export function CategoryCard({ title, description, icon, isActive, onClick }: CategoryCardProps) {
  const Icon = iconMap[icon]

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center p-6 bg-card rounded-xl border-2 transition-all duration-300 text-left w-full",
        "hover:shadow-lg hover:-translate-y-1 hover:border-secondary",
        isActive ? "border-secondary shadow-lg" : "border-transparent shadow-md",
      )}
    >
      <div
        className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors",
          isActive ? "bg-secondary text-white" : "bg-primary/10 text-primary",
        )}
      >
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-semibold text-card-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground text-center">{description}</p>
    </button>
  )
}
