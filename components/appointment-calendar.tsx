"use client"

import { useState } from "react"
import { Calendar, momentLocalizer, View, Components, DateLocalizer, EventProps, ToolbarProps as RBCToolbarProps } from "react-big-calendar"
import moment from "moment"
import "moment/locale/pt-br"
import "react-big-calendar/lib/css/react-big-calendar.css"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronLeft, ChevronRight, Clock, User, Scissors, CalendarPlus2Icon as CalendarIcon2, Loader2 } from "lucide-react"
import { useAppointments, Appointment } from "@/context/AppointmentContext"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"

// Configure moment locale
moment.locale("pt-br")
const localizer = momentLocalizer(moment)

// Tipo para o toolbar
interface ToolbarProps extends RBCToolbarProps<Appointment, object> {
  date: Date
  view: View
  views: View[]
  label: string
  onView: (view: View) => void
  onNavigate: (action: "PREV" | "NEXT" | "TODAY" | "DATE") => void
}

// Custom event component for the calendar
const EventComponent = ({ event }: EventProps<Appointment>) => {
  return (
    <div 
      className="custom-event-wrapper" 
      style={{ 
        borderLeftColor: event.color || '#3B82F6',
      }}
    >
      <div className="custom-event-content">
        <div className="custom-event-title">{event.client}</div>
        <div className="custom-event-time">
          {moment(event.start).format("HH:mm")} - {moment(event.end).format("HH:mm")}
        </div>
      </div>
    </div>
  )
}

// Custom agenda event component
const AgendaEventComponent = ({ event }: EventProps<Appointment>) => {
  return (
    <div className="flex items-center gap-3 rounded-md border-l-4 border-primary bg-primary/5 p-2" style={{ borderLeftColor: event.color }}>
      <Avatar className="h-8 w-8">
        <AvatarImage src={event.clientAvatar} alt={event.client} />
        <AvatarFallback>{event.clientInitials}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="font-medium">{event.client}</div>
        <div className="text-xs text-muted-foreground">{event.service}</div>
      </div>
      <div className="text-xs text-muted-foreground">
        {moment(event.start).format("HH:mm")} - {moment(event.end).format("HH:mm")}
      </div>
    </div>
  )
}

// Custom toolbar component
const CustomToolbar = (props: ToolbarProps) => {
  const goToBack = () => {
    props.onNavigate("PREV")
  }

  const goToNext = () => {
    props.onNavigate("NEXT")
  }

  const goToCurrent = () => {
    props.onNavigate("TODAY")
  }

  const label = () => {
    const date = moment(props.date)
    return (
      <div className="text-lg font-semibold">
        {props.view === "month"
          ? date.format("MMMM YYYY")
          : props.view === "week"
            ? `${date.startOf("week").format("D MMM")} - ${date.endOf("week").format("D MMM, YYYY")}`
            : date.format("dddd, D [de] MMMM [de] YYYY")}
      </div>
    )
  }

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={goToBack} type="button">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={goToNext} type="button">
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button variant="outline" onClick={goToCurrent} type="button">
          Hoje
        </Button>
      </div>

      <div className="flex-1 text-center">{label()}</div>

      <div className="flex items-center gap-2">
        <Select 
          value={props.view} 
          onValueChange={(value) => props.onView(value as View)}
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Visualização" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">Mês</SelectItem>
            <SelectItem value="week">Semana</SelectItem>
            <SelectItem value="day">Dia</SelectItem>
            <SelectItem value="agenda">Agenda</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

// Custom date header component for month view
const CustomDateHeader = ({ date, label }: { date: Date; label: string }) => {
  const isToday = moment(date).isSame(moment(), "day")
  const isWeekend = moment(date).day() === 0 || moment(date).day() === 6

  return (
    <div
      className={`flex h-8 items-center justify-center text-sm transition-colors
        ${isToday 
          ? "bg-transparent font-bold" 
          : isWeekend 
            ? "font-medium text-muted-foreground" 
            : "font-medium"}`
      }
    >
      {label}
    </div>
  )
}

// Custom time slot wrapper
const CustomTimeSlotWrapper = (props: any) => {
  return <div className="rbc-time-slot border-b border-border/30">{props.children}</div>
}

// Custom day wrapper for month view
const CustomDayWrapper = ({ children, value }: { children: React.ReactNode; value: Date }) => {
  const isToday = moment(value).isSame(moment(), "day")

  return <div className={`h-full w-full ${isToday ? "bg-primary/5" : ""}`}>{children}</div>
}

export function AppointmentCalendar() {
  const { appointments, isLoading, deleteAppointment, updateAppointment } = useAppointments()
  const [view, setView] = useState<View>("week")
  const [date, setDate] = useState(new Date())
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSelectEvent = (event: Appointment) => {
    setSelectedAppointment(event)
    setIsDetailsDialogOpen(true)
  }

  const handleViewChange = (newView: View) => {
    setView(newView)
  }

  const handleNavigate = (newDate: Date) => {
    setDate(newDate)
  }

  const handleEditAppointment = () => {
    setIsDetailsDialogOpen(false)
    // Por enquanto, vamos apenas fechar o diálogo de detalhes
    // setIsEditDialogOpen(true)
    
    // Mostrar um toast informando que a edição será implementada em breve
    toast({
      title: "Edição de agendamento",
      description: "A edição de agendamentos será implementada em breve.",
    })
  }

  const handleDeleteAppointment = async () => {
    if (!selectedAppointment) return
    
    setIsDeleting(true)
    try {
      await deleteAppointment(selectedAppointment.id)
      setIsDeleteDialogOpen(false)
      setIsDetailsDialogOpen(false)
    } catch (error) {
      console.error("Erro ao excluir agendamento:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  // Custom styling for events based on status
  const eventPropGetter = (event: Appointment) => {
    const borderLeftColor = event.color || "#3B82F6" // Use event color or default to blue
    let opacity = 1

    if (event.status === "pending") {
      opacity = 0.7
    } else if (event.status === "cancelled") {
      opacity = 0.5
    }

    return {
      style: {
        opacity,
        borderLeftColor
      },
    }
  }

  // Custom styling for date cells in month view
  const dayPropGetter = (date: Date) => {
    const isToday = moment(date).isSame(moment(), "day")
    const isWeekend = moment(date).day() === 0 || moment(date).day() === 6

    return {
      className: isWeekend ? "rbc-day-weekend" : "",
      style: {
        backgroundColor: isWeekend ? "rgba(0,0,0,0.02)" : "",
      },
    }
  }

  // Define custom components
  const components: Components<Appointment, object> = {
    event: EventComponent,
    agenda: {
      event: AgendaEventComponent,
    },
    toolbar: CustomToolbar as any,
    month: {
      dateHeader: CustomDateHeader,
    },
    timeSlotWrapper: CustomTimeSlotWrapper,
  }

  if (isLoading) {
    return (
      <Card className="border-none shadow-md">
        <CardContent className="p-4 pt-6">
          <div className="flex h-[700px] flex-col items-center justify-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-lg font-medium">Carregando agendamentos...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="border-none shadow-md">
        <CardContent className="p-4 pt-6">
          <div className="h-[700px] overflow-hidden rounded-xl border bg-card shadow-sm">
            <Calendar
              localizer={localizer}
              events={appointments}
              startAccessor="start"
              endAccessor="end"
              style={{ height: "100%" }}
              views={["month", "week", "day", "agenda"]}
              view={view}
              date={date}
              onView={handleViewChange}
              onNavigate={handleNavigate}
              onSelectEvent={handleSelectEvent}
              eventPropGetter={eventPropGetter}
              dayPropGetter={dayPropGetter}
              components={components}
              formats={{
                timeGutterFormat: (date) => localizer.format(date, "HH:mm"),
                eventTimeRangeFormat: ({ start, end }) => 
                  `${localizer.format(start, "HH:mm")} - ${localizer.format(end, "HH:mm")}`,
                dayHeaderFormat: (date) => localizer.format(date, "dddd, D [de] MMMM"),
                dayRangeHeaderFormat: ({ start, end }) => 
                  `${localizer.format(start, "D [de] MMMM")} - ${localizer.format(end, "D [de] MMMM")}`,
              }}
              messages={{
                week: "Semana",
                day: "Dia",
                month: "Mês",
                agenda: "Agenda",
                previous: "Anterior",
                next: "Próximo",
                today: "Hoje",
                showMore: (total: number) => `+ ${total} mais`,
                noEventsInRange: "Não há agendamentos neste período",
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Appointment Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detalhes do Agendamento</DialogTitle>
            <DialogDescription>Informações completas sobre o agendamento selecionado.</DialogDescription>
          </DialogHeader>

          {selectedAppointment && (
            <div className="space-y-6 py-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedAppointment.clientAvatar} alt={selectedAppointment.client} />
                  <AvatarFallback>{selectedAppointment.clientInitials}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{selectedAppointment.client}</h3>
                  <p className="text-sm text-muted-foreground">Cliente</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 rounded-lg border p-4 md:grid-cols-2">
                <div className="flex items-center gap-2">
                  <Scissors className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Serviço</p>
                    <p className="font-medium">{selectedAppointment.service}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <CalendarIcon2 className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Data</p>
                    <p className="font-medium">{moment(selectedAppointment.start).format("DD/MM/YYYY")}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Horário</p>
                    <p className="font-medium">
                      {moment(selectedAppointment.start).format("HH:mm")} -{" "}
                      {moment(selectedAppointment.end).format("HH:mm")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge
                    variant={
                      selectedAppointment.status === "confirmed"
                        ? "default"
                        : selectedAppointment.status === "pending"
                          ? "outline"
                          : "destructive"
                    }
                    className="mt-1"
                  >
                    {selectedAppointment.status === "confirmed"
                      ? "Confirmado"
                      : selectedAppointment.status === "pending"
                        ? "Pendente"
                        : "Cancelado"}
                  </Badge>
                </div>

                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Duração</p>
                  <p className="font-medium">
                    {moment(selectedAppointment.end).diff(moment(selectedAppointment.start), "minutes")} minutos
                  </p>
                </div>
              </div>

              {selectedAppointment.notes && (
                <div className="rounded-lg border p-4">
                  <h3 className="mb-2 font-medium">Observações</h3>
                  <p className="text-sm text-muted-foreground">{selectedAppointment.notes}</p>
                </div>
              )}

              <DialogFooter className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleEditAppointment}>Editar</Button>
                <Button 
                  variant="destructive" 
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  Cancelar Agendamento
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este agendamento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteAppointment}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                "Excluir"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

