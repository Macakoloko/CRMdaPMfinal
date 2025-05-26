"use client"

import { useState, useEffect } from "react"
import { useFinancial, Transaction } from "@/context/FinancialContext"
import { useAppointments, Appointment } from "@/context/AppointmentContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"
import { Calendar, Clock, DollarSign, CreditCard, CheckCircle, XCircle, Loader2, ArrowUp, ArrowDown, Calculator, Edit, Plus, Users } from "lucide-react"
import moment from "moment"
import "moment/locale/pt-br"
import { FecharCaixaDialog } from "./fechar-caixa-dialog"
import { useClients, Client, ClientService } from "@/context/ClientContext"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Format currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
  }).format(value)
}

// Format date
const formatDate = (date: Date) => {
  return moment(date).format("DD/MM/YYYY")
}

// Format time
const formatTime = (date: Date) => {
  return moment(date).format("HH:mm")
}

// Mock data para automações
const mockAutomations = [
  {
    id: 1,
    name: "Lembrete de Agendamento",
    type: "reminder",
    trigger: "before_appointment",
    messageTemplate: "Olá {nome}, lembre-se do seu agendamento amanhã! Estamos esperando por você.",
    active: true
  },
  {
    id: 2,
    name: "Agradecimento Pós-Atendimento",
    type: "message",
    trigger: "after_appointment",
    messageTemplate: "Olá {nome}, obrigado por nos visitar hoje! Esperamos que tenha gostado do atendimento.",
    active: true
  }
]

// Status do agendamento
type AppointmentStatus = "pending" | "confirmed" | "cancelled" | "no_show"

// Serviço
interface Service {
  id: string
  name: string
  price: number
  duration: number
}

// Mock de serviços disponíveis
const mockServices: Service[] = [
  { id: "1", name: "Corte de Cabelo", price: 25, duration: 30 },
  { id: "2", name: "Barba", price: 15, duration: 20 },
  { id: "3", name: "Coloração", price: 45, duration: 60 },
  { id: "4", name: "Manicure", price: 20, duration: 45 },
  { id: "5", name: "Pedicure", price: 25, duration: 45 },
  { id: "6", name: "Massagem", price: 50, duration: 60 },
]

// Interface para cliente do diálogo
interface DialogClient {
  id: string
  name: string
  phone: string
  initials: string
  status: string
  email?: string
  lastAppointment?: Date
}

// Interface para agendamento modificado
interface DialogAppointment {
  id: string
  service?: string
  start: Date
  end: Date
  status: string
  client: string
  clientId: string
  clientInitials: string
  attended: boolean
  originalValue: number
  currentValue: number
  services: Service[]
  paymentMethod?: "cash" | "card" | "transfer" | "other"
}

export function DailyClosing() {
  const { appointments } = useAppointments()
  const { transactions, getTransactionsByDate, closeDailyOperations, dailySummaries, addTransaction } = useFinancial()
  const { clients, updateClient, addClientService, clientServices, addClientAttendance } = useClients()
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [open, setOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState<"appointments" | "additional" | "automations">("appointments")
  
  // Estado para agendamentos modificados
  const [modifiedAppointments, setModifiedAppointments] = useState<DialogAppointment[]>([])
  
  // Estado para serviços adicionais
  const [additionalServices, setAdditionalServices] = useState<{
    clientId: string
    serviceName: string
    value: number
    paymentMethod: "cash" | "card" | "transfer" | "other"
  }[]>([])
  
  // Estado para novo serviço sendo adicionado
  const [newService, setNewService] = useState({
    clientId: "",
    serviceName: "",
    value: 0,
    paymentMethod: "cash" as "cash" | "card" | "transfer" | "other"
  })
  
  // Inicializa os agendamentos modificados quando o componente é montado
  useEffect(() => {
    const todayAppointments = appointments.filter(
      (app) => app.start.toDateString() === new Date().toDateString()
    )
    
    const initialModifiedAppointments: DialogAppointment[] = todayAppointments.map(app => ({
      id: app.id,
      service: app.service,
      start: app.start,
      end: app.end,
      status: app.status,
      client: app.client,
      clientId: app.clientId,
      clientInitials: app.clientInitials,
      attended: app.status === "confirmed",
      originalValue: app.serviceDuration ? app.serviceDuration / 60 * 25 : 25, // Valor aproximado baseado na duração
      currentValue: app.serviceDuration ? app.serviceDuration / 60 * 25 : 25,  // Valor aproximado baseado na duração
      services: [], // Inicializa vazio, será adicionado durante o fechamento
      paymentMethod: "cash"
    }))
    
    setModifiedAppointments(initialModifiedAppointments)
  }, [appointments])
  
  // Função para atualizar um agendamento modificado
  const updateModifiedAppointment = (id: string, updates: Partial<DialogAppointment>) => {
    setModifiedAppointments(prev => 
      prev.map(app => 
        app.id === id ? { ...app, ...updates } : app
      )
    )
  }
  
  // Função para adicionar um serviço adicional
  const addAdditionalService = () => {
    if (!newService.clientId || !newService.serviceName || newService.value <= 0) {
      toast("Preencha todos os campos para adicionar um serviço")
      return
    }
    
    setAdditionalServices(prev => [...prev, { ...newService }])
    setNewService({
      clientId: "",
      serviceName: "",
      value: 0,
      paymentMethod: "cash"
    })
  }
  
  // Função para remover um serviço adicional
  const removeAdditionalService = (index: number) => {
    setAdditionalServices(prev => prev.filter((_, i) => i !== index))
  }
  
  // Função para processar o fechamento de caixa
  const processClosing = async () => {
    try {
      // 1. Registrar histórico de comparecimento
      const attendancePromises = modifiedAppointments.map(app => {
        return addClientAttendance({
          clientId: app.clientId,
          appointmentId: app.id,
          date: app.start,
          attended: app.attended,
          reason: app.attended ? undefined : "Não compareceu"
        })
      })
      
      // 2. Registrar agendamentos como serviços realizados
      const servicePromises = modifiedAppointments
        .filter(app => app.attended)
        .map(app => {
          return addClientService({
            clientId: app.clientId,
            serviceName: app.service || 'Serviço não especificado',
            serviceDate: app.start,
            price: app.currentValue,
            attended: true,
            paymentMethod: app.paymentMethod || 'cash'
          })
        })
      
      // 3. Registrar serviços adicionais
      for (const service of additionalServices) {
        addTransaction({
          date: new Date(),
          description: `Serviço adicional: ${service.serviceName}`,
          amount: service.value,
          type: "income",
          category: "service",
          paymentMethod: service.paymentMethod,
        })
        
        // Adicionar registro no histórico de serviços do cliente
        await addClientService({
          clientId: service.clientId,
          serviceName: service.serviceName,
          serviceDate: new Date(),
          price: service.value,
          notes: "Serviço adicional registrado no fechamento de caixa",
          attended: true,
          paymentMethod: service.paymentMethod
        })
      }
      
      // 4. Registrar o fechamento do dia
      await closeDailyOperations(selectedDate)
      
      // 5. Avançar para as automações
      setCurrentStep("automations")
      
      // Aguardar todos os registros serem feitos
      await Promise.all([...attendancePromises, ...servicePromises])
      
      return Promise.resolve()
    } catch (error) {
      console.error("Erro ao processar fechamento:", error)
      toast("Erro ao processar fechamento de caixa")
      return Promise.reject(error)
    }
  }
  
  // Função para concluir todo o processo
  const handleComplete = () => {
    toast("Caixa fechado com sucesso!")
    setOpen(false)
    // Resetar estados
    setCurrentStep("appointments")
    setAdditionalServices([])
  }
  
  // Preparar os clientes do dia para o diálogo
  const getDailyClients = (): DialogClient[] => {
    // Filtrar clientes com base nos agendamentos atendidos
    const clientIds = modifiedAppointments
      .filter(app => app.attended)
      .map(app => app.clientId);
    
    // Pegar os objetos completos do cliente e converter para o formato esperado pelo diálogo
    return clients
      .filter(client => clientIds.includes(client.id))
      .map(client => ({
        id: client.id,
        name: client.name,
        phone: client.phone || "",
        initials: client.initials,
        status: client.status,
        email: client.email,
        lastAppointment: new Date() // Usamos a data atual como último atendimento
      }));
  }
  
  return (
    <>
      <Button variant="outline" className="gap-2" onClick={() => setOpen(true)}>
        <Calculator className="h-4 w-4" />
        Fechar Caixa
      </Button>
      
      <FecharCaixaDialog
        open={open}
        onOpenChange={setOpen}
        onComplete={handleComplete}
        dailyClients={getDailyClients()}
        pendingAutomations={mockAutomations}
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        modifiedAppointments={modifiedAppointments}
        updateModifiedAppointment={updateModifiedAppointment}
        additionalServices={additionalServices}
        newService={newService}
        setNewService={setNewService}
        addAdditionalService={addAdditionalService}
        removeAdditionalService={removeAdditionalService}
        availableServices={mockServices}
        clients={clients.map(client => ({
          id: client.id,
          name: client.name,
          phone: client.phone || "",
          initials: client.initials,
          status: client.status,
          email: client.email
        }))}
        processClosing={processClosing}
      />
    </>
  )
} 