"use client"

import { Button } from "@/components/ui/button"
import { HelpCircle } from "lucide-react"
import { useState } from "react"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function HelpButton() {
  const [isOpen, setIsOpen] = useState(false)

  const resetTutorial = () => {
    // Usar sessionStorage para persistir entre recarregamentos sem problemas de TypeScript
    try {
      // Remover do localStorage
      localStorage.removeItem("hasSeenTutorial")
      // Definir flag na sessionStorage
      sessionStorage.setItem("forceStartTutorial", "true")
    } catch (error) {
      console.error("Erro ao acessar storage:", error)
    }
    
    // Fechar o diálogo
    setIsOpen(false)
    
    // Forçar recarregamento da página
    window.location.reload()
  }

  // Função para abrir o manual do usuário em uma nova aba
  const openManual = () => {
    window.open('/manual_usuario.html', '_blank')
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <HelpCircle className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">?</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajuda</DialogTitle>
          <DialogDescription>
            Precisa de ajuda para usar o sistema?
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm">
            Você pode iniciar o tutorial interativo para conhecer as principais funcionalidades do sistema.
          </p>
          <Button onClick={resetTutorial} className="w-full">
            Iniciar Tutorial
          </Button>
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-2">Outros recursos de ajuda</h4>
            <div className="grid gap-2">
              <Button variant="outline" className="justify-start text-left" onClick={openManual}>
                Manual do Usuário
              </Button>
              <Button variant="outline" className="justify-start text-left" asChild>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  Vídeos de Treinamento
                </a>
              </Button>
              <Button variant="outline" className="justify-start text-left" asChild>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  Contatar Suporte
                </a>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 