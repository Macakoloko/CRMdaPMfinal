"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  Home, 
  Calendar, 
  DollarSign, 
  Users, 
  MessageCircle, 
  Package, 
  Zap, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  X
} from "lucide-react"

// Definição dos passos do tutorial
const tutorialSteps = [
  {
    title: "Bem-vindo ao CRM PEEEM",
    description: "Este tutorial irá mostrar as principais funcionalidades do sistema para você começar a usar rapidamente.",
    icon: Home,
    iconColor: "text-primary",
  },
  {
    title: "Painel de Controle",
    description: "O painel principal mostra estatísticas importantes como faturamento, agendamentos do dia e clientes recentes. Você pode acessar as funções mais usadas através do botão 'Acesso Rápido'.",
    icon: Home,
    iconColor: "text-primary",
  },
  {
    title: "Agendamentos",
    description: "Gerencie todos os agendamentos de serviços. Crie novos agendamentos, visualize o calendário e organize sua agenda diária, semanal ou mensal.",
    icon: Calendar,
    iconColor: "text-purple-500",
  },
  {
    title: "Financeiro",
    description: "Controle completo das finanças do seu negócio. Registre vendas, despesas, fechamento de caixa e gere relatórios financeiros detalhados.",
    icon: DollarSign,
    iconColor: "text-green-500",
  },
  {
    title: "Clientes",
    description: "Cadastre e gerencie seus clientes. Acompanhe histórico de serviços, preferências e informações de contato para melhorar o relacionamento.",
    icon: Users,
    iconColor: "text-blue-500",
  },
  {
    title: "Chat",
    description: "Comunique-se com seus clientes diretamente pelo sistema. Envie mensagens, lembretes de agendamentos e promoções.",
    icon: MessageCircle,
    iconColor: "text-yellow-500",
  },
  {
    title: "Produtos e Serviços",
    description: "Gerencie seu catálogo de produtos e serviços. Controle estoque, preços e disponibilidade.",
    icon: Package,
    iconColor: "text-orange-500",
  },
  {
    title: "Automações",
    description: "Configure mensagens automáticas para clientes, lembretes de aniversário e outras automações para otimizar seu trabalho.",
    icon: Zap,
    iconColor: "text-indigo-500",
  },
  {
    title: "Configurações",
    description: "Personalize o sistema de acordo com as necessidades do seu negócio. Configure dados da empresa, usuários e preferências gerais.",
    icon: Settings,
    iconColor: "text-gray-500",
  },
  {
    title: "Pronto para começar!",
    description: "Agora você conhece as principais funcionalidades do CRM PEEEM. Você pode acessar este tutorial novamente através do menu de ajuda se precisar.",
    icon: Home,
    iconColor: "text-primary",
  },
]

export function AppTutorial() {
  const [isOpen, setIsOpen] = useState(false) // Iniciar fechado por padrão
  const [currentStep, setCurrentStep] = useState(0)
  const [isMounted, setIsMounted] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string>("")

  // Verificar se o componente está montado
  useEffect(() => {
    setIsMounted(true)
    
    // Verificar se deve mostrar o tutorial
    try {
      // Verificar se há uma flag para forçar o início do tutorial
      const forceStart = sessionStorage.getItem("forceStartTutorial")
      setDebugInfo(prev => prev + `forceStart: ${forceStart}\n`)
      console.log("forceStart:", forceStart) // Log para depuração
      
      if (forceStart === "true") {
        // Limpar a flag
        sessionStorage.removeItem("forceStartTutorial")
        setDebugInfo(prev => prev + "Iniciando tutorial forçado\n")
        console.log("Iniciando tutorial forçado") // Log para depuração
        setIsOpen(true)
        return
      }
      
      // Se não houver flag, verificar se já viu o tutorial
      const hasSeenTutorial = localStorage.getItem("hasSeenTutorial")
      setDebugInfo(prev => prev + `hasSeenTutorial: ${hasSeenTutorial}\n`)
      console.log("hasSeenTutorial:", hasSeenTutorial) // Log para depuração
      
      if (hasSeenTutorial !== "true") {
        setDebugInfo(prev => prev + "Iniciando tutorial (primeira vez)\n")
        console.log("Iniciando tutorial (primeira vez)") // Log para depuração
        setIsOpen(true)
      }
    } catch (error) {
      console.error("Erro ao acessar storage:", error)
      setDebugInfo(prev => prev + `Erro: ${error}\n`)
      // Em caso de erro, mostrar o tutorial por segurança
      setIsOpen(true)
    }
  }, [])

  // Função para avançar para o próximo passo
  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Finalizar o tutorial
      try {
        localStorage.setItem("hasSeenTutorial", "true")
      } catch (error) {
        console.error("Erro ao salvar no localStorage:", error)
      }
      setIsOpen(false)
    }
  }

  // Função para voltar ao passo anterior
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Função para pular o tutorial
  const skipTutorial = () => {
    try {
      localStorage.setItem("hasSeenTutorial", "true")
    } catch (error) {
      console.error("Erro ao salvar no localStorage:", error)
    }
    setIsOpen(false)
  }

  // Não renderizar nada até que o componente esteja montado
  if (!isMounted) return null

  const currentTutorialStep = tutorialSteps[currentStep]
  const Icon = currentTutorialStep.icon

  return (
    <>
      {/* Componente de debug visível apenas em desenvolvimento */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-20 right-4 z-50 bg-white dark:bg-gray-800 p-4 rounded shadow-lg max-w-xs max-h-40 overflow-auto text-xs">
          <h4 className="font-bold mb-2">Debug Tutorial:</h4>
          <pre>{debugInfo || "Nenhuma informação"}</pre>
          <div className="mt-2 flex gap-2">
            <button 
              className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
              onClick={() => {
                setIsOpen(true)
                setDebugInfo(prev => prev + "Botão abrir tutorial clicado\n")
              }}
            >
              Abrir Tutorial
            </button>
            <button 
              className="bg-red-500 text-white px-2 py-1 rounded text-xs"
              onClick={() => {
                localStorage.removeItem("hasSeenTutorial")
                sessionStorage.setItem("forceStartTutorial", "true")
                window.location.reload()
              }}
            >
              Reset Tutorial
            </button>
          </div>
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={(open) => {
        // Impedir que o usuário feche o diálogo clicando fora
        // Só permitir fechar através dos botões
        if (!open) {
          skipTutorial()
        }
        setIsOpen(open)
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="flex items-center justify-center mb-4">
              <div className={`rounded-full p-3 ${currentTutorialStep.iconColor} bg-opacity-20`}>
                <Icon className={`h-8 w-8 ${currentTutorialStep.iconColor}`} />
              </div>
            </div>
            <DialogTitle className="text-center">{currentTutorialStep.title}</DialogTitle>
            <DialogDescription className="text-center pt-2">
              {currentTutorialStep.description}
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-center mt-4">
            <div className="flex space-x-1">
              {tutorialSteps.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === currentStep ? "w-6 bg-primary" : "w-2 bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>

          <DialogFooter className="flex justify-between items-center mt-6 sm:justify-between">
            <div>
              {currentStep > 0 ? (
                <Button variant="outline" onClick={prevStep}>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>
              ) : (
                <Button variant="outline" onClick={skipTutorial}>
                  Pular
                </Button>
              )}
            </div>
            <Button onClick={nextStep}>
              {currentStep < tutorialSteps.length - 1 ? (
                <>
                  Próximo
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              ) : (
                "Concluir"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}