"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, Clock, Plus, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useAppointments } from "@/context/AppointmentContext"
import { useClients, Client } from "@/context/ClientContext"

const formSchema = z.object({
  client: z.string().min(1, {
    message: "Selecione um cliente.",
  }),
  service: z.string().min(1, {
    message: "Selecione um serviço.",
  }),
  date: z.date({
    required_error: "Selecione uma data.",
  }),
  startTime: z.string().min(1, {
    message: "Selecione um horário de início.",
  }),
  endTime: z.string().min(1, {
    message: "Selecione um horário de término.",
  }),
  notes: z.string().optional(),
  status: z.string().default("confirmed"),
})

// Sample data
// const clients = [
//   { id: "1", name: "Ana Silva" },
//   { id: "2", name: "Carlos Oliveira" },
//   { id: "3", name: "Mariana Santos" },
//   { id: "4", name: "Roberto Almeida" },
//   { id: "5", name: "Juliana Costa" },
// ]

const services = [
  { id: "haircut", name: "Corte de Cabelo", duration: 60 },
  { id: "coloring", name: "Coloração", duration: 120 },
  { id: "manicure", name: "Manicure", duration: 45 },
  { id: "pedicure", name: "Pedicure", duration: 60 },
  { id: "beard", name: "Barba", duration: 30 },
  { id: "haircut_beard", name: "Corte e Barba", duration: 90 },
  { id: "treatment", name: "Tratamento Capilar", duration: 60 },
]

// Generate time slots from 8:00 to 20:00
const generateTimeSlots = () => {
  const slots = []
  for (let hour = 8; hour < 20; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const formattedHour = hour.toString().padStart(2, "0")
      const formattedMinute = minute.toString().padStart(2, "0")
      slots.push(`${formattedHour}:${formattedMinute}`)
    }
  }
  return slots
}

const timeSlots = generateTimeSlots()

export interface AppointmentFormProps {
  onSuccess?: () => void
}

export function AppointmentForm({ onSuccess }: AppointmentFormProps) {
  const { createAppointment } = useAppointments()
  const { clients, addClient, isLoading: isLoadingClients } = useClients()
  const [clientSearch, setClientSearch] = useState("")
  const [filteredClients, setFilteredClients] = useState<Client[]>([])
  const [newClientDialogOpen, setNewClientDialogOpen] = useState(false)
  const [newClient, setNewClient] = useState({ name: "", phone: "", birthDate: "" })
  
  const [newServiceDialogOpen, setNewServiceDialogOpen] = useState(false)
  const [newService, setNewService] = useState({ name: "", duration: "60" })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      client: "",
      service: "",
      notes: "",
      status: "confirmed",
    },
  })

  const watchService = form.watch("service")

  // Calculate suggested end time based on start time and service duration
  const calculateEndTime = (startTime: string, serviceId: string) => {
    if (!startTime || !serviceId) return ""

    const service = services.find((s) => s.id === serviceId)
    if (!service) return ""

    const [hours, minutes] = startTime.split(":").map(Number)
    const startMinutes = hours * 60 + minutes
    const endMinutes = startMinutes + service.duration

    const endHours = Math.floor(endMinutes / 60)
    const endMinutesRemainder = endMinutes % 60

    return `${endHours.toString().padStart(2, "0")}:${endMinutesRemainder.toString().padStart(2, "0")}`
  }

  // Update suggested end time when start time or service changes
  const updateEndTime = () => {
    const startTime = form.getValues("startTime")
    const serviceId = form.getValues("service")

    if (startTime && serviceId) {
      const endTime = calculateEndTime(startTime, serviceId)
      form.setValue("endTime", endTime)
    }
  }

  // Filter clients based on search input
  const handleClientSearch = (search: string) => {
    setClientSearch(search)
    if (!search.trim()) {
      setFilteredClients([])
      return
    }
    
    // Filter only active clients from the database
    const filtered = clients
      .filter(client => 
        client.status === "active" && 
        client.name.toLowerCase().includes(search.toLowerCase())
      )
      .slice(0, 10) // Limit results to 10 for better performance
    
    setFilteredClients(filtered)
  }

  // Handle client selection
  const handleClientSelect = (clientId: string, clientName: string) => {
    form.setValue("client", clientId)
    setClientSearch(clientName)
    // Fechar a lista de sugestões ao selecionar um cliente
    setFilteredClients([])
  }

  // Handle new client creation
  const handleCreateClient = async () => {
    if (!newClient.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome do cliente é obrigatório.",
        variant: "destructive",
      })
      return
    }
    
    try {
      // Add client to database using the ClientContext
      const clientId = await addClient({
        name: newClient.name,
        phone: newClient.phone,
        birthDate: newClient.birthDate ? new Date(newClient.birthDate) : null,
      })
      
      // Select the new client in the form
      form.setValue("client", clientId)
      
      // Reset and close dialog
      setNewClient({ name: "", phone: "", birthDate: "" })
      setNewClientDialogOpen(false)
      setClientSearch(newClient.name)
    } catch (error) {
      console.error("Erro ao criar cliente:", error)
      toast({
        title: "Erro",
        description: "Não foi possível criar o cliente.",
        variant: "destructive",
      })
    }
  }

  // Handle new service creation
  const handleCreateService = () => {
    // In a real app, you would save this to your database
    const newId = `service_${services.length + 1}`
    const createdService = { 
      id: newId, 
      name: newService.name,
      duration: parseInt(newService.duration)
    }
    
    // Add to services list
    services.push(createdService)
    
    // Select the new service in the form
    form.setValue("service", newId)
    
    // Reset and close dialog
    setNewService({ name: "", duration: "60" })
    setNewServiceDialogOpen(false)
    
    toast({
      title: "Serviço criado",
      description: `${newService.name} foi adicionado com sucesso.`,
    })
    
    // Update end time with new service
    setTimeout(updateEndTime, 0)
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    
    try {
      // Get client and service details
      const selectedClient = clients.find((c) => c.id === values.client)
      const selectedService = services.find((s) => s.id === values.service)
      
      if (!selectedClient || !selectedService) {
        throw new Error("Cliente ou serviço não encontrado")
      }
      
      // Parse date and time to create start and end Date objects
      const [startHour, startMinute] = values.startTime.split(":").map(Number)
      const [endHour, endMinute] = values.endTime.split(":").map(Number)
      
      const startDate = new Date(values.date)
      startDate.setHours(startHour, startMinute, 0, 0)
      
      const endDate = new Date(values.date)
      endDate.setHours(endHour, endMinute, 0, 0)
      
      // Create appointment data
      const appointmentData = {
        client: selectedClient.name,
        clientId: selectedClient.id,
        clientInitials: selectedClient.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase(),
        service: selectedService.name,
        serviceId: selectedService.id,
        serviceDuration: selectedService.duration,
        start: startDate,
        end: endDate,
        notes: values.notes,
        status: values.status as "confirmed" | "pending" | "cancelled",
      }
      
      // Create the appointment
      await createAppointment(appointmentData)
      
      // Reset form
      form.reset()
      setClientSearch("")
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess()
      } else {
        // Switch to calendar tab only if onSuccess is not provided
        const calendarTab = document.querySelector('[data-value="calendar"]') as HTMLButtonElement
        if (calendarTab) {
          calendarTab.click()
        }
      }
    } catch (error) {
      console.error("Erro ao criar agendamento:", error)
      
      // Mostrar mensagem de erro mais detalhada
      let errorMessage = "Não foi possível criar o agendamento.";
      
      if (error instanceof Error) {
        errorMessage += ` Motivo: ${error.message}`;
      } else if (typeof error === 'object' && error !== null) {
        errorMessage += ` Verifique o console para mais detalhes.`;
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Novo Agendamento</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="client"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cliente</FormLabel>
                      <div className="relative">
                        <div className="flex gap-2">
                          <div className="relative flex-grow">
                            <Input
                              placeholder={isLoadingClients ? "Carregando clientes..." : "Buscar cliente..."}
                              value={clientSearch}
                              onChange={(e) => handleClientSearch(e.target.value)}
                              className="w-full"
                              disabled={isLoadingClients}
                            />
                            {clientSearch && filteredClients.length > 0 && (
                              <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover p-1 shadow-md">
                                {filteredClients.map((client) => (
                                  <div
                                    key={client.id}
                                    className="flex cursor-pointer items-center rounded-sm px-2 py-1.5 hover:bg-accent hover:text-accent-foreground"
                                    onClick={() => {
                                      handleClientSelect(client.id, client.name)
                                    }}
                                  >
                                    {client.name}
                                  </div>
                                ))}
                              </div>
                            )}
                            {clientSearch && filteredClients.length === 0 && (
                              <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover p-2 shadow-md">
                                <p className="text-sm text-muted-foreground">Nenhum cliente encontrado</p>
                              </div>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => setNewClientDialogOpen(true)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="service"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Serviço</FormLabel>
                      <div className="flex gap-2">
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value)
                            // Update end time when service changes
                            setTimeout(updateEndTime, 0)
                          }}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="flex-grow">
                              <SelectValue placeholder="Selecione um serviço" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {services.map((service) => (
                              <SelectItem key={service.id} value={service.id}>
                                {service.name} ({service.duration} min)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => setNewServiceDialogOpen(true)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: ptBR })
                              ) : (
                                <span>Selecione uma data</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                            locale={ptBR}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Horário de Início</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value)
                          // Update end time when start time changes
                          setTimeout(updateEndTime, 0)
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um horário" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Horário de Término</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um horário" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="confirmed">Confirmado</SelectItem>
                        <SelectItem value="pending">Pendente</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Adicione informações importantes sobre o agendamento..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Criar Agendamento
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Dialog para adicionar novo cliente */}
      <Dialog open={newClientDialogOpen} onOpenChange={setNewClientDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Novo Cliente</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                placeholder="Nome completo"
                value={newClient.name}
                onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                placeholder="(00) 00000-0000"
                value={newClient.phone || ""}
                onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="birthDate">Data de Nascimento</Label>
              <Input
                id="birthDate"
                type="date"
                value={newClient.birthDate || ""}
                onChange={(e) => setNewClient({ ...newClient, birthDate: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewClientDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateClient}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para adicionar novo serviço */}
      <Dialog open={newServiceDialogOpen} onOpenChange={setNewServiceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Novo Serviço</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="serviceName">Nome do Serviço</Label>
              <Input
                id="serviceName"
                placeholder="Nome do serviço"
                value={newService.name}
                onChange={(e) => setNewService({ ...newService, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="duration">Duração (minutos)</Label>
              <Input
                id="duration"
                type="number"
                min="15"
                step="15"
                placeholder="60"
                value={newService.duration}
                onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewServiceDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateService}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

