"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, Save } from "lucide-react"

const COLOR_THEMES = [
  { name: "Rosa", value: "pink", primary: "340 82% 52%" },
  { name: "Azul", value: "blue", primary: "201 96% 48%" },
  { name: "Verde", value: "green", primary: "160 84% 39%" },
  { name: "Roxo", value: "purple", primary: "262 80% 63%" },
  { name: "Laranja", value: "orange", primary: "24 94% 53%" },
  { name: "Vermelho", value: "red", primary: "0 84% 60%" },
  { name: "Amarelo", value: "yellow", primary: "48 96% 53%" },
  { name: "Ciano", value: "cyan", primary: "180 100% 50%" },
  { name: "Lilás", value: "lilac", primary: "280 75% 60%" },
  { name: "Turquesa", value: "turquoise", primary: "174 72% 56%" },
  { name: "Esmeralda", value: "emerald", primary: "152 60% 52%" },
  { name: "Coral", value: "coral", primary: "16 85% 66%" }
]

// Schema para o formulário do nome do estabelecimento
const businessNameSchema = z.object({
  businessName: z.string().min(1, { message: "O nome do estabelecimento é obrigatório" })
})

type BusinessNameFormValues = z.infer<typeof businessNameSchema>;

export function ThemeSettings() {
  const [selectedColor, setSelectedColor] = useState("pink")
  const [saving, setSaving] = useState(false)
  
  // Formulário para o nome do estabelecimento
  const form = useForm<BusinessNameFormValues>({
    resolver: zodResolver(businessNameSchema),
    defaultValues: {
      businessName: "Salão Beleza Total"
    }
  })
  
  useEffect(() => {
    // Carregar cor salva do localStorage
    const savedColor = localStorage.getItem("colorTheme")
    if (savedColor) {
      setSelectedColor(savedColor)
      applyColorTheme(savedColor)
    }
    
    // Carregar nome do estabelecimento
    const savedBusinessInfo = localStorage.getItem("businessInfo")
    if (savedBusinessInfo) {
      try {
        const businessInfo = JSON.parse(savedBusinessInfo)
        if (businessInfo.nome) {
          form.setValue("businessName", businessInfo.nome)
        }
      } catch (error) {
        console.error("Erro ao carregar informações da empresa:", error)
      }
    }
  }, [form])
  
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
  
  const onSubmitBusinessName = (values: z.infer<typeof businessNameSchema>) => {
    setSaving(true)
    
    // Buscar informações existentes ou criar um objeto novo
    let businessInfo = {}
    const savedBusinessInfo = localStorage.getItem("businessInfo")
    if (savedBusinessInfo) {
      try {
        businessInfo = JSON.parse(savedBusinessInfo)
      } catch (error) {
        console.error("Erro ao carregar informações da empresa:", error)
      }
    }
    
    // Atualizar o nome
    const updatedBusinessInfo = {
      ...businessInfo,
      nome: values.businessName
    }
    
    // Salvar no localStorage
    localStorage.setItem("businessInfo", JSON.stringify(updatedBusinessInfo))
    
    setTimeout(() => {
      setSaving(false)
      toast.success("Nome do estabelecimento atualizado com sucesso!")
    }, 500)
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
            className="grid grid-cols-3 gap-4 md:grid-cols-4"
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
      
      {/* Card para configurar o nome do estabelecimento */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Logotipo / Nome do Estabelecimento</CardTitle>
          <CardDescription>
            Configure o nome do seu estabelecimento que aparecerá na barra superior
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form id="business-name-form" onSubmit={form.handleSubmit(onSubmitBusinessName)} className="space-y-4">
              <FormField
                control={form.control}
                name="businessName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Estabelecimento</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Salão Beleza Total" {...field} />
                    </FormControl>
                    <FormDescription>
                      Este nome aparecerá na barra lateral como identificação do seu estabelecimento
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            form="business-name-form"
            disabled={saving}
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className={`${saving ? 'hidden' : 'mr-2'} h-4 w-4`} />
            Salvar Alterações
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
} 