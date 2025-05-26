"use client"

import "./calendar-styles.css"
import { AppointmentCalendar } from "@/components/appointment-calendar"
import { AppointmentForm } from "@/components/appointment-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AppointmentProvider } from "@/context/AppointmentContext"

export default function AppointmentsPage() {
  return (
    <AppointmentProvider>
      <div className="container mx-auto p-4 pb-20">
        <h1 className="mb-6 text-2xl font-bold">Agendamentos</h1>

        <Tabs defaultValue="calendar" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="calendar" data-value="calendar">Calendário</TabsTrigger>
            <TabsTrigger value="new">Novo Agendamento</TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="mt-6">
            <AppointmentCalendar />
          </TabsContent>

          <TabsContent value="new" className="mt-6">
            <AppointmentForm />
          </TabsContent>
        </Tabs>
      </div>
    </AppointmentProvider>
  )
}

