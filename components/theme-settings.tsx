"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

const COLOR_THEMES = [
  { name: "Rosa", value: "pink", primary: "340 82% 52%" },
  { name: "Azul", value: "blue", primary: "201 96% 48%" },
  { name: "Verde", value: "green", primary: "160 84% 39%" },
  { name: "Roxo", value: "purple", primary: "262 80% 63%" },
  { name: "Laranja", value: "orange", primary: "24 94% 53%" }
]

export function ThemeSettings() {
  const [selectedColor, setSelectedColor] = useState("pink")
  
  useEffect(() => {
    // Carregar cor salva do localStorage
    const savedColor = localStorage.getItem("colorTheme")
    if (savedColor) {
      setSelectedColor(savedColor)
      applyColorTheme(savedColor)
    }
  }, [])
  
  const applyColorTheme = (colorValue: string) => {
    const theme = COLOR_THEMES.find(theme => theme.value === colorValue)
    if (theme) {
      document.documentElement.style.setProperty('--primary', theme.primary)
      localStorage.setItem("colorTheme", colorValue)
      toast.success(`Tema ${theme.name} aplicado com sucesso!`)
    }
  }
  
  const handleColorChange = (value: string) => {
    setSelectedColor(value)
    applyColorTheme(value)
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Modo de Tema</CardTitle>
          <CardDescription>
            Escolha entre tema claro, escuro ou use as configurações do seu sistema.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center space-x-2">
          <span className="text-sm font-medium">Selecionar modo:</span>
          <ThemeToggle />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Cores do Tema</CardTitle>
          <CardDescription>
            Escolha uma cor primária para personalizar a aparência do sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup 
            value={selectedColor} 
            onValueChange={handleColorChange}
            className="grid grid-cols-2 gap-4 md:grid-cols-3"
          >
            {COLOR_THEMES.map((theme) => (
              <div key={theme.value} className="flex items-center space-x-2">
                <RadioGroupItem value={theme.value} id={theme.value} />
                <Label htmlFor={theme.value} className="flex items-center gap-2">
                  <span 
                    className="inline-block w-4 h-4 rounded-full" 
                    style={{ backgroundColor: `hsl(${theme.primary})` }}
                  />
                  {theme.name}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>
    </div>
  )
} 