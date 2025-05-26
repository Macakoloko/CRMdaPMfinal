import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { AlertCircle, Check, MessageCircle, Trash2, Edit, Plus, AlertTriangle, X, CheckCheck, UserPlus, Euro } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { SendWhatsAppDialog } from "./send-whatsapp-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { ClientDialog } from "./client-dialog"
import { useClients } from "@/context/ClientContext"
import { ClientDetailsDialog } from "./client-details-dialog"

// Interface local para cliente do componente
interface DialogClient {
  id: string
  name: string
  phone: string
  initials: string
  status: string
  email?: string
  lastAppointment?: Date
}

interface Automation {
  id: number
  name: string
  type: string
  trigger: string
  messageTemplate?: string
  active: boolean
}

interface Service {
  id: string
  name: string
  price: number
  duration: number
}

interface ModifiedAppointment {
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

interface AdditionalService {
  clientId: string
  serviceName: string
  value: number
  paymentMethod: "cash" | "card" | "transfer" | "other"
}

interface FecharCaixaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete?: () => void
  dailyClients: DialogClient[]
  pendingAutomations: Automation[]
  currentStep: "appointments" | "additional" | "automations"
  setCurrentStep: (step: "appointments" | "additional" | "automations") => void
  modifiedAppointments: ModifiedAppointment[]
  updateModifiedAppointment: (id: string, updates: Partial<ModifiedAppointment>) => void
  additionalServices: AdditionalService[]
  newService: AdditionalService
  setNewService: (service: AdditionalService) => void
  addAdditionalService: () => void
  removeAdditionalService: (index: number) => void
  availableServices: Service[]
  clients: DialogClient[]
  processClosing: () => Promise<void>
}

export function FecharCaixaDialog({
  open,
  onOpenChange,
  onComplete,
  dailyClients,
  pendingAutomations,
  currentStep,
  setCurrentStep,
  modifiedAppointments,
  updateModifiedAppointment,
  additionalServices,
  newService,
  setNewService,
  addAdditionalService,
  removeAdditionalService,
  availableServices,
  clients,
  processClosing
}: FecharCaixaDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [sendWhatsAppDialogOpen, setSendWhatsAppDialogOpen] = useState(false)
  const [selectedAutomation, setSelectedAutomation] = useState<Automation | null>(null)
  const [editingAppointment, setEditingAppointment] = useState<string | null>(null)
  const [isNewClientDialogOpen, setIsNewClientDialogOpen] = useState(false)
  const [clientDetailsOpen, setClientDetailsOpen] = useState(false)
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  const { addClientAttendance, addClientService } = useClients()
  
  // Estatísticas do dia
  const dailyStats = {
    totalClients: dailyClients.length,
    totalRevenue: modifiedAppointments
      .filter(app => app.attended)
      .reduce((sum, app) => sum + app.currentValue, 0) + 
      additionalServices.reduce((sum, service) => sum + service.value, 0),
    totalServices: modifiedAppointments
      .filter(app => app.attended)
      .reduce((sum, app) => sum + app.services.length, 0) + 
      additionalServices.length,
    pendingAutomations: pendingAutomations.filter(a => a.active).length
  }

  // Formatar moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-PT", {
      style: "currency",
      currency: "EUR",
    }).format(value)
  }
  
  // Formatar data
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-PT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }).format(date)
  }
  
  // Formatar hora
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("pt-PT", {
      hour: "2-digit",
      minute: "2-digit"
    }).format(date)
  }
  
  // Função para avançar para a próxima etapa
  const goToNextStep = async () => {
    if (currentStep === "appointments") {
      setCurrentStep("additional")
    } 
    else if (currentStep === "additional") {
      setIsProcessing(true)
      try {
        // Primeiro, registre o histórico de comparecimento para cada agendamento
        const attendancePromises = modifiedAppointments.map(appointment => {
          return addClientAttendance({
            clientId: appointment.clientId,
            appointmentId: appointment.id,
            date: appointment.start,
            attended: appointment.attended,
            reason: appointment.attended ? undefined : "Não compareceu"
          })
        })
        
        // Registre cada serviço adicional como um serviço do cliente
        const servicePromises = additionalServices.map(service => {
          return addClientService({
            clientId: service.clientId,
            serviceName: service.serviceName,
            serviceDate: new Date(),
            price: service.value,
            attended: true, // Serviços adicionais são sempre marcados como atendidos
            paymentMethod: service.paymentMethod
          })
        })
        
        // Aguarde todas as promessas serem resolvidas
        await Promise.all([...attendancePromises, ...servicePromises])
        
        // Agora processe o fechamento
        await processClosing()
        setIsProcessing(false)
        
        // Avance para a próxima etapa
        setCurrentStep("automations")
      } catch (error) {
        console.error("Erro ao processar fechamento:", error)
        toast("Erro ao processar fechamento de caixa")
        setIsProcessing(false)
      }
    }
  }
  
  // Função para voltar para a etapa anterior
  const goToPreviousStep = () => {
    if (currentStep === "additional") {
      setCurrentStep("appointments")
    }
    else if (currentStep === "automations") {
      setCurrentStep("additional")
    }
  }
  
  // Função para finalizar o fechamento de caixa
  const finalizeFechamentoCaixa = () => {
    if (onComplete) onComplete()
    onOpenChange(false)
  }
  
  // Função para abrir o diálogo de WhatsApp para uma automação específica
  const handleOpenWhatsAppDialog = (automation: Automation) => {
    setSelectedAutomation(automation)
    setSendWhatsAppDialogOpen(true)
  }
  
  // Função para alternar o status de presença de um agendamento
  const toggleAttendance = (appointmentId: string, attended: boolean) => {
    updateModifiedAppointment(appointmentId, { attended })
  }
  
  // Função para atualizar o valor de um agendamento
  const updateAppointmentValue = (appointmentId: string, value: number) => {
    updateModifiedAppointment(appointmentId, { currentValue: value })
  }
  
  // Função para atualizar o método de pagamento de um agendamento
  const updatePaymentMethod = (appointmentId: string, method: "cash" | "card" | "transfer" | "other") => {
    updateModifiedAppointment(appointmentId, { paymentMethod: method })
  }

  // Verificar se podemos proceder para a próxima etapa
  const canProceed = () => {
    if (currentStep === "appointments") {
      // Todos os agendamentos precisam ter status definido (compareceu/não compareceu)
      return modifiedAppointments.every(app => app.attended !== undefined)
    }
    return true
  }

  // Obter nome do cliente a partir do ID
  const getClientName = (clientId: string): string => {
    const client = clients.find(c => c.id === clientId)
    return client ? client.name : 'Cliente não encontrado'
  }

  // Handler para quando um novo cliente é criado
  const handleNewClientCreated = (newClient: DialogClient) => {
    // Atualizar o serviço atual com o novo cliente
    setNewService({
      ...newService,
      clientId: newClient.id
    })
    
    // Fechar o diálogo
    setIsNewClientDialogOpen(false)
    
    // Mostrar mensagem de sucesso
    toast("Novo cliente adicionado com sucesso!")
  }
  
  // Função para abrir os detalhes do cliente
  const openClientDetails = (clientId: string) => {
    setSelectedClientId(clientId)
    setClientDetailsOpen(true)
  }
  
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Fechamento de Caixa</DialogTitle>
            <DialogDescription>
              {currentStep === "appointments" && "Confirme os agendamentos do dia"}
              {currentStep === "additional" && "Serviços adicionais realizados"}
              {currentStep === "automations" && "Automações pendentes para hoje"}
            </DialogDescription>
          </DialogHeader>
          
          {/* Etapa 1: Revisar agendamentos */}
          {currentStep === "appointments" && (
            <>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Confirme se os clientes compareceram e atualize os valores se necessário.
                </p>
                
                {modifiedAppointments.length === 0 ? (
                  <Alert className="bg-gray-50 border-gray-200">
                    <AlertCircle className="h-4 w-4 text-gray-600" />
                    <AlertTitle>Sem agendamentos</AlertTitle>
                    <AlertDescription>
                      Não há agendamentos registrados para hoje.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-4">
                      {modifiedAppointments.map((appointment) => (
                        <Card key={appointment.id} className={appointment.attended ? "border-green-200" : "border-gray-200"}>
                          <CardHeader className="pb-2 pt-4 px-4">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <Checkbox 
                                  id={`attendance-${appointment.id}`}
                                  checked={appointment.attended}
                                  onCheckedChange={(checked) => toggleAttendance(appointment.id, !!checked)}
                                />
                                <Label 
                                  htmlFor={`attendance-${appointment.id}`} 
                                  className="font-medium cursor-pointer hover:underline"
                                  onClick={() => openClientDetails(appointment.clientId)}
                                >
                                  {getClientName(appointment.clientId)}
                                </Label>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">
                                  {formatTime(appointment.start)}
                                </span>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => setEditingAppointment(editingAppointment === appointment.id ? null : appointment.id)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          
                          <CardContent className="px-4 py-2">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm font-medium">Serviço</p>
                                <p className="text-sm">{appointment.service || "Não especificado"}</p>
                              </div>
                              
                              <div>
                                <p className="text-sm font-medium">Valor Original</p>
                                <p className="text-sm">{formatCurrency(appointment.originalValue)}</p>
                              </div>
                            </div>
                            
                            {editingAppointment === appointment.id && (
                              <div className="mt-4 p-3 bg-gray-50 rounded-md space-y-4">
                                <div>
                                  <Label htmlFor={`value-${appointment.id}`} className="text-sm">
                                    Valor Final
                                  </Label>
                                  <div className="relative mt-1">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                      <Euro className="h-4 w-4 text-gray-500" />
                                    </div>
                                    <Input
                                      id={`value-${appointment.id}`}
                                      type="number"
                                      value={appointment.currentValue}
                                      onChange={(e) => updateAppointmentValue(appointment.id, parseFloat(e.target.value) || 0)}
                                      className="pl-9"
                                    />
                                  </div>
                                </div>
                                
                                <div>
                                  <Label className="text-sm">Método de Pagamento</Label>
                                  <RadioGroup
                                    value={appointment.paymentMethod || "cash"}
                                    onValueChange={(value) => updatePaymentMethod(appointment.id, value as "cash" | "card" | "transfer" | "other")}
                                    className="mt-2 flex space-x-4"
                                  >
                                    <div className="flex items-center space-x-1">
                                      <RadioGroupItem value="cash" id={`cash-${appointment.id}`} />
                                      <Label htmlFor={`cash-${appointment.id}`} className="text-sm">Dinheiro</Label>
                                    </div>
                                    
                                    <div className="flex items-center space-x-1">
                                      <RadioGroupItem value="card" id={`card-${appointment.id}`} />
                                      <Label htmlFor={`card-${appointment.id}`} className="text-sm">Cartão</Label>
                                    </div>
                                    
                                    <div className="flex items-center space-x-1">
                                      <RadioGroupItem value="transfer" id={`transfer-${appointment.id}`} />
                                      <Label htmlFor={`transfer-${appointment.id}`} className="text-sm">Transferência</Label>
                                    </div>
                                    
                                    <div className="flex items-center space-x-1">
                                      <RadioGroupItem value="other" id={`other-${appointment.id}`} />
                                      <Label htmlFor={`other-${appointment.id}`} className="text-sm">Outro</Label>
                                    </div>
                                  </RadioGroup>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={goToNextStep} 
                  disabled={!canProceed()}
                >
                  Próximo
                </Button>
              </DialogFooter>
            </>
          )}
          
          {/* Etapa 2: Serviços adicionais */}
          {currentStep === "additional" && (
            <>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Registre serviços adicionais que foram realizados fora dos agendamentos.
                </p>
                
                {/* Lista de serviços adicionais já registrados */}
                {additionalServices.length > 0 && (
                  <div className="space-y-3 mb-4">
                    <h3 className="text-sm font-medium">Serviços Adicionais Registrados</h3>
                    <ScrollArea className="h-[200px]">
                      <div className="space-y-2">
                        {additionalServices.map((service, index) => {
                          const client = clients.find(c => c.id === service.clientId)
                          return (
                            <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                              <div>
                                <p className="font-medium">{service.serviceName}</p>
                                <p 
                                  className="text-sm text-muted-foreground cursor-pointer hover:underline"
                                  onClick={() => openClientDetails(service.clientId)}
                                >
                                  {client?.name || 'Cliente não encontrado'} - {formatCurrency(service.value)}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">
                                  {service.paymentMethod === "cash" ? "Dinheiro" : 
                                   service.paymentMethod === "card" ? "Cartão" : 
                                   service.paymentMethod === "transfer" ? "Transferência" : "Outro"}
                                </Badge>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => removeAdditionalService(index)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </ScrollArea>
                  </div>
                )}
                
                {/* Formulário para adicionar um novo serviço */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Registrar Novo Serviço</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label htmlFor="clientSelect">Cliente</Label>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 px-2 text-xs"
                          onClick={() => setIsNewClientDialogOpen(true)}
                        >
                          <UserPlus className="h-3 w-3 mr-1" />
                          Novo Cliente
                        </Button>
                      </div>
                      <Select 
                        value={newService.clientId} 
                        onValueChange={(value) => setNewService({ ...newService, clientId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um cliente" />
                        </SelectTrigger>
                        <SelectContent>
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="serviceSelect">Serviço</Label>
                      <Select 
                        value={newService.serviceName} 
                        onValueChange={(value) => {
                          const service = availableServices.find(s => s.name === value)
                          setNewService({ 
                            ...newService, 
                            serviceName: value,
                            value: service?.price || 0
                          })
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um serviço" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableServices.map((service) => (
                            <SelectItem key={service.id} value={service.name}>
                              {service.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="value">Valor</Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <Euro className="h-4 w-4 text-gray-500" />
                        </div>
                        <Input
                          id="value"
                          type="number"
                          value={newService.value}
                          onChange={(e) => setNewService({ ...newService, value: parseFloat(e.target.value) || 0 })}
                          className="pl-9"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label>Método de Pagamento</Label>
                      <RadioGroup
                        value={newService.paymentMethod}
                        onValueChange={(value) => setNewService({ ...newService, paymentMethod: value as "cash" | "card" | "transfer" | "other" })}
                        className="mt-2 flex space-x-4"
                      >
                        <div className="flex items-center space-x-1">
                          <RadioGroupItem value="cash" id="cash" />
                          <Label htmlFor="cash" className="text-sm">Dinheiro</Label>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <RadioGroupItem value="card" id="card" />
                          <Label htmlFor="card" className="text-sm">Cartão</Label>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <RadioGroupItem value="transfer" id="transfer" />
                          <Label htmlFor="transfer" className="text-sm">Transferência</Label>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <RadioGroupItem value="other" id="other" />
                          <Label htmlFor="other" className="text-sm">Outro</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    <Button 
                      onClick={addAdditionalService}
                      className="w-full"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Adicionar Serviço
                    </Button>
                  </CardContent>
                </Card>
              </div>
              
              <DialogFooter className="flex justify-between">
                <Button variant="outline" onClick={goToPreviousStep}>
                  Voltar
                </Button>
                <Button 
                  onClick={goToNextStep}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>Processando...</>
                  ) : (
                    <>Finalizar e Processar Automações</>
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
          
          {/* Etapa 3: Automações */}
          {currentStep === "automations" && (
            <>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Clientes Atendidos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{dailyStats.totalClients}</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Serviços Realizados</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{dailyStats.totalServices}</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="col-span-2">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Faturamento Total</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">{formatCurrency(dailyStats.totalRevenue)}</div>
                    </CardContent>
                  </Card>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Automações Pendentes</h3>
                  
                  {pendingAutomations.filter(a => a.active).length === 0 ? (
                    <Alert className="bg-green-50 border-green-200">
                      <CheckCheck className="h-4 w-4 text-green-600" />
                      <AlertTitle>Sem automações pendentes</AlertTitle>
                      <AlertDescription>
                        Não há automações pendentes para envio.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="space-y-3">
                      {pendingAutomations.filter(a => a.active).map((automation) => (
                        <div key={automation.id} className="flex items-center justify-between p-3 border rounded-md">
                          <div>
                            <h4 className="font-medium">{automation.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {automation.type === "message" ? "Mensagem" : "Lembrete"}
                            </p>
                          </div>
                          <Button 
                            variant="outline" 
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleOpenWhatsAppDialog(automation)}
                          >
                            <MessageCircle className="mr-2 h-4 w-4" />
                            Enviar Mensagens
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <DialogFooter className="flex justify-between">
                <Button variant="outline" onClick={goToPreviousStep}>
                  Voltar
                </Button>
                <Button onClick={finalizeFechamentoCaixa}>
                  Concluir Fechamento
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Diálogo de envio de WhatsApp */}
      {selectedAutomation && (
        <SendWhatsAppDialog
          open={sendWhatsAppDialogOpen}
          onOpenChange={setSendWhatsAppDialogOpen}
          automationName={selectedAutomation.name}
          messageTemplate={selectedAutomation.messageTemplate || ""}
          clients={dailyClients}
          onComplete={() => {
            toast.success(`Automação "${selectedAutomation.name}" processada com sucesso!`)
          }}
        />
      )}
      
      {/* Diálogo para cadastro de novo cliente */}
      <ClientDialog 
        open={isNewClientDialogOpen}
        onOpenChange={setIsNewClientDialogOpen}
        onClientCreated={handleNewClientCreated}
      />
      
      {/* Diálogo de detalhes do cliente */}
      <ClientDetailsDialog
        open={clientDetailsOpen}
        onOpenChange={setClientDetailsOpen}
        clientId={selectedClientId}
      />
    </>
  )
} 