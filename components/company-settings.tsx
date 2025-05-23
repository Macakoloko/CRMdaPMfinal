"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export function CompanySettings() {
  const [companyName, setCompanyName] = useState("")
  
  // Load company name from localStorage on component mount
  useEffect(() => {
    const savedName = localStorage.getItem("companyName")
    if (savedName) {
      setCompanyName(savedName)
      updateDocumentTitle(savedName)
    }
  }, [])

  // Update document title with company name
  const updateDocumentTitle = (name: string) => {
    if (name && name.trim() !== "") {
      document.title = name
    } else {
      document.title = "Beauty Salon CRM"
    }
  }

  // Save company name to localStorage when it changes
  const handleSaveCompanyName = () => {
    localStorage.setItem("companyName", companyName)
    updateDocumentTitle(companyName)
    
    // Update the title in the metadata
    const event = new CustomEvent('companyNameChanged', { detail: companyName });
    document.dispatchEvent(event);
    
    toast.success("Nome da empresa salvo com sucesso!")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações da Empresa</CardTitle>
        <CardDescription>
          Defina o nome da sua empresa que será exibido no sistema.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="companyName">Nome da Empresa</Label>
          <Input
            id="companyName"
            placeholder="Digite o nome da sua empresa"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
          <p className="text-sm text-muted-foreground">
            Este nome será exibido no título da página e na barra lateral.
          </p>
        </div>
        <Button onClick={handleSaveCompanyName}>Salvar</Button>
      </CardContent>
    </Card>
  )
} 