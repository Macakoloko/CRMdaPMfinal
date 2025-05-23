"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Appointment, useAppointments } from "@/context/AppointmentContext"
import moment from "moment"

const formSchema = z.object({
  clientId: z.string().min(1, {
    message: "Selecione um cliente.",
  }),
  serviceId: z.string().min(1, {
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
  status: z.enum(["confirmed", "pending", "cancelled"]),
})

// Sample data (should be replaced with real data from a database)
const clients = [
  { id: "1", name: "Ana Silva" },
  { id: "2", name: "Carlos Oliveira" },
  { id: "3", name: "Mariana Santos" },
  { id: "4", name: "Roberto Almeida" },
  { id: "5", name: "Juliana Costa" },
]

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

interface AppointmentEditFormProps {
  appointment: Appointment
  onSuccess: () => void
}

export function AppointmentEditForm({ appointment, onSuccess }: AppointmentEditFormProps) {
  const { updateAppointment } = useAppointments()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Parse date and time from appointment
  const appointmentDate = new Date(appointment.start)
  const startTime = moment(appointment.start).format("HH:mm")
  const endTime = moment(appointment.end).format("HH:mm")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientId: appointment.clientId,
      serviceId: appointment.serviceId,
      date: appointmentDate,
      startTime: startTime,
      endTime: endTime,
      notes: appointment.notes || "",
      status: appointment.status,
    },
  })

  // Get client and service names
  const client = clients.find((c) => c.id === appointment.clientId)
  const service = services.find((s) => s.id === appointment.serviceId)

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    try {
      // Parse date and time to create start and end Date objects
      const [startHour, startMinute] = values.startTime.split(":").map(Number)
      const [endHour, endMinute] = values.endTime.split(":").map(Number)
      
      const startDate = new Date(values.date)
      startDate.setHours(startHour, startMinute, 0, 0)
      
      const endDate = new Date(values.date)
      endDate.setHours(endHour, endMinute, 0, 0)

      // Get client and service info
      const selectedClient = clients.find((c) => c.id === values.clientId)
      const selectedService = services.find((s) => s.id === values.serviceId)

      if (!selectedClient || !selectedService) {
        throw new Error("Cliente ou serviço não encontrado")
      }

      // Create updated appointment data
      const updatedAppointment = {
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
        status: values.status,
      }

      // Update appointment
      await updateAppointment(appointment.id, updatedAppointment)
      onSuccess()
    } catch (error) {
      console.error("Erro ao atualizar agendamento:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="clientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cliente</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um cliente" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
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
            name="serviceId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Serviço</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
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
                  <SelectItem value="cancelled">Cancelado</SelectItem>
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
                  placeholder="Adicione observações sobre o agendamento"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar alterações"
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
} 