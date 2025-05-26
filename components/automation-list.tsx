"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Edit, MoreHorizontal, Search, Trash2, Play, Pause, MessageCircle, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { WhatsAppButton } from "@/components/whatsapp-button"
import { toast } from "sonner"
import { SendWhatsAppDialog } from "./send-whatsapp-dialog"
import { useClients, Client } from "@/context/ClientContext"
import { useAppointments, Appointment } from "@/context/AppointmentContext"

// Interface para automações
interface Automation {
  id: number
  name: string
  type: "message" | "reminder" | "promotion" | "followup"
  trigger: "after_appointment" | "before_appointment" | "no_show" | "birthday" | "inactivity" | "low_stock"
  timeValue: string
  timeUnit: "minutes" | "hours" | "days" | "weeks" | "months"
  active: boolean
  lastRun: string
  sentCount: number
  messageTemplate?: string
}

// Lista de automações predefinidas
const predefinedAutomations: Automation[] = [
  {
    id: 1,
    name: "Lembrete de Agendamento",
    type: "reminder",
    trigger: "before_appointment",
    timeValue: "1",
    timeUnit: "days",
    active: true,
    lastRun: "2023-07-20T10:30:00",
    sentCount: 156,
    messageTemplate: "Olá {nome}, lembre-se do seu agendamento amanhã! Estamos esperando por você."
  },
  {
    id: 2,
    name: "Agradecimento Pós-Atendimento",
    type: "message",
    trigger: "after_appointment",
    timeValue: "2",
    timeUnit: "hours",
    active: true,
    lastRun: "2023-07-22T15:45:00",
    sentCount: 243,
    messageTemplate: "Olá {nome}, obrigado por nos visitar hoje! Esperamos que tenha gostado do atendimento."
  },
  {
    id: 3,
    name: "Feliz Aniversário",
    type: "message",
    trigger: "birthday",
    timeValue: "0",
    timeUnit: "days",
    active: true,
    lastRun: "2023-07-22T08:00:00",
    sentCount: 87,
    messageTemplate: "Feliz aniversário, {nome}! Desejamos um dia maravilhoso e queremos celebrar com você oferecendo 10% de desconto em nossos serviços este mês."
  },
  {
    id: 4,
    name: "Promoção de Produtos",
    type: "promotion",
    trigger: "inactivity",
    timeValue: "30",
    timeUnit: "days",
    active: false,
    lastRun: "2023-06-15T09:00:00",
    sentCount: 45,
    messageTemplate: "Olá {nome}, sentimos sua falta! Já faz um tempo desde sua última visita em {data}. Que tal agendar um novo horário com 15% de desconto?"
  },
  {
    id: 5,
    name: "Alerta de Estoque Baixo",
    type: "message",
    trigger: "low_stock",
    timeValue: "1",
    timeUnit: "hours",
    active: true,
    lastRun: "2023-07-21T16:20:00",
    sentCount: 12,
    messageTemplate: "Atenção: O produto X está com estoque baixo. Favor verificar."
  },
  {
    id: 6,
    name: "Recuperação de Não Comparecimento",
    type: "followup",
    trigger: "no_show",
    timeValue: "1",
    timeUnit: "days",
    active: true,
    lastRun: "2023-07-19T11:15:00",
    sentCount: 28,
    messageTemplate: "Olá {nome}, notamos que você não compareceu ao seu agendamento ontem. Podemos ajudar a remarcar em um horário mais conveniente para você?"
  },
]

type AutomationState = {
  [key: number]: boolean
}

export function AutomationList() {
  const { clients } = useClients()
  const { appointments } = useAppointments()
  const [searchTerm, setSearchTerm] = useState("")
  const [automations, setAutomations] = useState<Automation[]>([])
  const [automationState, setAutomationState] = useState<AutomationState>({})
  const [sendDialogOpen, setSendDialogOpen] = useState(false)
  const [selectedAutomation, setSelectedAutomation] = useState<Automation | null>(null)

  // Carregar automações do localStorage ou usar as predefinidas
  useEffect(() => {
    const savedAutomations = localStorage.getItem('automations')
    if (savedAutomations) {
      const parsedAutomations = JSON.parse(savedAutomations)
      setAutomations(parsedAutomations)
      
      // Inicializar o estado das automações
      const initialState = parsedAutomations.reduce((acc: AutomationState, automation: Automation) => {
        acc[automation.id] = automation.active
        return acc
      }, {})
      setAutomationState(initialState)
    } else {
      setAutomations(predefinedAutomations)
      
      // Inicializar o estado das automações predefinidas
      const initialState = predefinedAutomations.reduce((acc: AutomationState, automation: Automation) => {
        acc[automation.id] = automation.active
        return acc
      }, {})
      setAutomationState(initialState)
    }
  }, [])

  // Função para abrir o diálogo de envio de mensagens
  const handleOpenSendDialog = (automation: Automation) => {
    setSelectedAutomation(automation)
    setSendDialogOpen(true)
  }

  const filteredAutomations = automations.filter(
    (automation) =>
      automation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      automation.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      automation.trigger.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleToggleActive = (id: number) => {
    setAutomationState((prev) => {
      const newState = {
        ...prev,
        [id]: !prev[id],
      }
      
      // Atualizar o estado ativo da automação
      const updatedAutomations = automations.map(automation => 
        automation.id === id 
          ? { ...automation, active: newState[id] } 
          : automation
      )
      
      // Salvar no localStorage
      localStorage.setItem('automations', JSON.stringify(updatedAutomations))
      setAutomations(updatedAutomations)
      
      return newState
    })
  }

  const getTypeLabel = (type: string): string => {
    const types: Record<string, string> = {
      message: "Mensagem",
      reminder: "Lembrete",
      promotion: "Promoção",
      followup: "Acompanhamento",
    }
    return types[type] || type
  }

  const getTriggerLabel = (trigger: string): string => {
    const triggers: Record<string, string> = {
      after_appointment: "Após Atendimento",
      before_appointment: "Antes do Atendimento",
      no_show: "Não Comparecimento",
      birthday: "Aniversário",
      inactivity: "Inatividade",
      low_stock: "Estoque Baixo",
    }
    return triggers[trigger] || trigger
  }

  const getTimeUnitLabel = (unit: string): string => {
    const units: Record<string, string> = {
      minutes: "minutos",
      hours: "horas",
      days: "dias",
      weeks: "semanas",
      months: "meses",
    }
    return units[unit] || unit
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("pt-BR")
  }

  // Função para personalizar mensagem com dados do cliente
  const personalizeMessage = (message: string, client: Client) => {
    let personalizedMessage = message
      .replace(/{nome}/g, client.name)
      
    // Se a mensagem incluir data da última visita e o cliente tiver agendamentos
    if (message.includes('{data}')) {
      const clientAppointments = appointments.filter(app => app.clientId === client.id)
      const lastAppointment = clientAppointments.length > 0 
        ? clientAppointments.sort((a, b) => b.start.getTime() - a.start.getTime())[0]
        : null
        
      if (lastAppointment) {
        const formattedDate = lastAppointment.start.toLocaleDateString('pt-BR')
        personalizedMessage = personalizedMessage.replace(/{data}/g, formattedDate)
      } else {
        personalizedMessage = personalizedMessage.replace(/{data}/g, 'N/A')
      }
    }
    
    // Se a mensagem incluir serviço e o cliente tiver agendamentos
    if (message.includes('{serviço}')) {
      const clientAppointments = appointments.filter(app => app.clientId === client.id)
      const lastAppointment = clientAppointments.length > 0 
        ? clientAppointments.sort((a, b) => b.start.getTime() - a.start.getTime())[0]
        : null
        
      if (lastAppointment) {
        personalizedMessage = personalizedMessage.replace(/{serviço}/g, lastAppointment.service)
      } else {
        personalizedMessage = personalizedMessage.replace(/{serviço}/g, 'serviço')
      }
    }
    
    return personalizedMessage
  }

  // Função que filtra os clientes com base no tipo de automação
  const getRelevantClients = (automation: Automation) => {
    // Usar dados reais de clientes
    if (!clients || clients.length === 0) return []
    
    const today = new Date()
    const todayString = today.toISOString().split('T')[0]
    
    switch (automation.trigger) {
      case "after_appointment":
        // Clientes que tiveram atendimento hoje
        return clients.filter(client => {
          const clientAppointments = appointments.filter(app => 
            app.clientId === client.id && 
            app.start.toISOString().split('T')[0] === todayString
          )
          return clientAppointments.length > 0
        })
      
      case "before_appointment":
        // Clientes com agendamento para amanhã
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        const tomorrowString = tomorrow.toISOString().split('T')[0]
        
        return clients.filter(client => {
          const clientAppointments = appointments.filter(app => 
            app.clientId === client.id && 
            app.start.toISOString().split('T')[0] === tomorrowString
          )
          return clientAppointments.length > 0
        })
      
      case "birthday":
        // Clientes que fazem aniversário hoje (considera apenas mês e dia)
        return clients.filter(client => {
          if (!client.birthDate) return false
          const birthDate = new Date(client.birthDate)
          return birthDate.getMonth() === today.getMonth() && 
                 birthDate.getDate() === today.getDate()
        })
      
      case "no_show":
        // Clientes que não compareceram aos últimos agendamentos
        return clients.filter(client => {
          const clientAppointments = appointments.filter(app => 
            app.clientId === client.id && 
            app.status === "cancelled"
          )
          return clientAppointments.length > 0
        })
      
      case "inactivity":
        // Clientes inativos baseado no valor da automação
        const inactivityDays = parseInt(automation.timeValue)
        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() - inactivityDays)
        
        return clients.filter(client => {
          const clientAppointments = appointments.filter(app => app.clientId === client.id)
          
          // Se não tem agendamentos e está ativo, considerar inativo
          if (clientAppointments.length === 0) return client.status === "active"
          
          // Verificar se o último agendamento foi antes da data de corte
          const lastAppointment = clientAppointments.sort((a, b) => 
            b.start.getTime() - a.start.getTime()
          )[0]
          
          return lastAppointment.start < cutoffDate
        })
      
      case "low_stock":
        // Não aplicável a clientes
        return []
      
      default:
        return clients
    }
  }

  // Função para deletar uma automação
  const handleDeleteAutomation = (id: number) => {
    // Remover a automação
    const updatedAutomations = automations.filter(automation => automation.id !== id)
    setAutomations(updatedAutomations)
    
    // Atualizar o localStorage
    localStorage.setItem('automations', JSON.stringify(updatedAutomations))
    
    toast.success("Automação removida com sucesso!")
  }

  // Função para testar uma automação
  const handleTestAutomation = (automation: Automation) => {
    const relevantClients = getRelevantClients(automation)
    
    if (relevantClients.length === 0) {
      toast.info("Não há clientes elegíveis para esta automação no momento.")
      return
    }
    
    toast.success(`Automação "${automation.name}" será enviada para ${relevantClients.length} cliente(s).`)
    
    // Atualizar contagem de envios
    const updatedAutomations = automations.map(a => 
      a.id === automation.id 
        ? { ...a, sentCount: a.sentCount + relevantClients.length, lastRun: new Date().toISOString() } 
        : a
    )
    
    setAutomations(updatedAutomations)
    localStorage.setItem('automations', JSON.stringify(updatedAutomations))
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Automações Ativas</CardTitle>
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input
            placeholder="Buscar automações..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs"
          />
          <Button variant="outline" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Gatilho</TableHead>
              <TableHead>Tempo</TableHead>
              <TableHead>Última Execução</TableHead>
              <TableHead>Envios</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAutomations.length > 0 ? (
              filteredAutomations.map((automation) => (
                <TableRow key={automation.id}>
                  <TableCell>
                    <Switch
                      checked={automationState[automation.id] || false}
                      onCheckedChange={() => handleToggleActive(automation.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{automation.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{getTypeLabel(automation.type)}</Badge>
                  </TableCell>
                  <TableCell>{getTriggerLabel(automation.trigger)}</TableCell>
                  <TableCell>
                    {automation.timeValue} {getTimeUnitLabel(automation.timeUnit)}
                  </TableCell>
                  <TableCell>{automation.lastRun ? formatDate(automation.lastRun) : "Nunca"}</TableCell>
                  <TableCell>{automation.sentCount}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" onClick={() => handleTestAutomation(automation)}>
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => handleOpenSendDialog(automation)}>
                        <Users className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteAutomation(automation.id)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  Nenhuma automação encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
      
      {/* Diálogo para enviar mensagens de teste */}
      {selectedAutomation && (
        <SendWhatsAppDialog
          open={sendDialogOpen}
          onOpenChange={setSendDialogOpen}
          automation={selectedAutomation}
          clients={getRelevantClients(selectedAutomation)}
          personalizeMessage={personalizeMessage}
        />
      )}
    </Card>
  )
}

