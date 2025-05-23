"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { toast } from "@/components/ui/use-toast"
import moment from "moment"
import { v4 as uuidv4 } from "uuid"
import { useSupabase } from "./SupabaseContext"

// Cores para os agendamentos
const COLORS = ["blue", "green", "red", "purple", "orange", "pink", "yellow", "cyan", "teal", "indigo"]

// Tipo para os agendamentos
export type Appointment = {
  id: string
  title: string
  start: Date
  end: Date
  client: string
  clientId: string
  clientAvatar?: string
  clientInitials: string
  service: string
  serviceId: string
  serviceDuration: number
  notes?: string
  status: "confirmed" | "pending" | "cancelled"
  color: string
}

// Tipo para o contexto
type AppointmentContextType = {
  appointments: Appointment[]
  isLoading: boolean
  createAppointment: (appointment: Omit<Appointment, "id" | "title" | "color">) => Promise<void>
  updateAppointment: (id: string, appointment: Partial<Appointment>) => Promise<void>
  deleteAppointment: (id: string) => Promise<void>
  getAppointment: (id: string) => Appointment | undefined
}

// Criação do contexto
const AppointmentContext = createContext<AppointmentContextType | undefined>(undefined)

// Hook para usar o contexto
export const useAppointments = () => {
  const context = useContext(AppointmentContext)
  if (!context) {
    throw new Error("useAppointments deve ser usado dentro de um AppointmentProvider")
  }
  return context
}

// Provider do contexto
export function AppointmentProvider({ children }: { children: React.ReactNode }) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { supabase } = useSupabase()

  // Carregar agendamentos do Supabase ao iniciar
  useEffect(() => {
    const loadAppointments = async () => {
      try {
        // Buscar agendamentos do Supabase
        const { data, error } = await supabase
          .from('appointments')
          .select('*')
        
        if (error) {
          throw error;
        }
        
        if (data && data.length > 0) {
          // Converter strings de data para objetos Date
          const formattedAppointments = data.map((app: any) => ({
            id: app.id,
            title: app.title,
            start: new Date(app.start),
            end: new Date(app.end_time),
            client: app.client,
            clientId: app.clientid,
            clientInitials: app.clientinitials,
            clientAvatar: app.clientavatar,
            service: app.service,
            serviceId: app.serviceid,
            serviceDuration: app.serviceduration,
            notes: app.notes,
            status: app.status,
            color: app.color
          }));
          setAppointments(formattedAppointments);
        } else {
          // Se não houver agendamentos salvos, criar alguns dados de exemplo
          const exampleAppointments = generateExampleAppointments();
          
          // Salvar os agendamentos de exemplo no Supabase
          for (const appointment of exampleAppointments) {
            await supabase.from('appointments').insert({
              id: appointment.id,
              title: appointment.title,
              start: appointment.start.toISOString(),
              end_time: appointment.end.toISOString(),
              client: appointment.client,
              clientid: appointment.clientId,
              clientinitials: appointment.clientInitials,
              clientavatar: appointment.clientAvatar || null,
              service: appointment.service,
              serviceid: appointment.serviceId,
              serviceduration: appointment.serviceDuration,
              notes: appointment.notes || null,
              status: appointment.status,
              color: appointment.color
            });
          }
          
          setAppointments(exampleAppointments);
        }
      } catch (error) {
        console.error("Erro ao carregar agendamentos:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os agendamentos.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    // Carregar os agendamentos
    loadAppointments();
  }, [supabase]);

  // Criar um novo agendamento
  const createAppointment = async (appointmentData: Omit<Appointment, "id" | "title" | "color">) => {
    try {
      // Gerar um ID único
      const id = uuidv4()
      
      // Criar título a partir do cliente e serviço
      const title = `${appointmentData.client} - ${appointmentData.service}`
      
      // Escolher uma cor aleatória
      const color = COLORS[Math.floor(Math.random() * COLORS.length)]
      
      // Criar o novo agendamento
      const newAppointment: Appointment = {
        ...appointmentData,
        id,
        title,
        color,
      }
      
      // Preparar dados para o Supabase com validação
      const appointmentForSupabase: any = {
        id: newAppointment.id,
        title: newAppointment.title,
        start: newAppointment.start.toISOString(),
        end_time: newAppointment.end.toISOString(),
        client: newAppointment.client,
        clientid: newAppointment.clientId,
        clientinitials: newAppointment.clientInitials,
        service: newAppointment.service,
        serviceid: newAppointment.serviceId,
        serviceduration: newAppointment.serviceDuration,
        status: newAppointment.status,
        color: newAppointment.color
      };
      
      // Adicionar campos opcionais apenas se estiverem definidos
      if (newAppointment.notes) {
        appointmentForSupabase.notes = newAppointment.notes;
      }
      
      if (newAppointment.clientAvatar) {
        appointmentForSupabase.clientavatar = newAppointment.clientAvatar;
      }
      
      console.log("Tentando criar agendamento no Supabase:", appointmentForSupabase);
      
      // Verificar a conexão com o Supabase
      try {
        const { data: healthCheck, error: healthError } = await supabase.from('appointments').select('count').limit(1);
        
        if (healthError) {
          console.error("Erro na verificação de conexão com o Supabase:", healthError);
          throw new Error(`Erro de conexão: ${healthError.message}`);
        } else {
          console.log("Conexão com o Supabase OK, tabela appointments acessível");
        }
      } catch (connError) {
        console.error("Erro ao verificar conexão:", connError);
        throw new Error("Não foi possível conectar ao banco de dados");
      }
      
      // Abordagem simplificada para inserção
      try {
        // Tentar inserir sem o .select() que pode estar causando o problema
        const { error } = await supabase
          .from('appointments')
          .insert(appointmentForSupabase);
        
        if (error) {
          console.error("Erro ao inserir no Supabase:", error);
          throw new Error(`Erro de inserção: ${error.message}`);
        }
        
        console.log("Agendamento inserido com sucesso!");
      } catch (insertError) {
        console.error("Exceção ao inserir agendamento:", insertError);
        throw insertError;
      }
      
      // Atualizar o estado
      setAppointments((prev) => [...prev, newAppointment])
      
      toast({
        title: "Agendamento criado",
        description: `Agendamento para ${appointmentData.client} em ${moment(appointmentData.start).format("DD/MM/YYYY")} às ${moment(appointmentData.start).format("HH:mm")} foi criado com sucesso.`,
      })
      
      return Promise.resolve()
    } catch (error) {
      console.error("Erro ao criar agendamento:", error)
      toast({
        title: "Erro",
        description: error instanceof Error ? `Não foi possível criar o agendamento: ${error.message}` : "Não foi possível criar o agendamento.",
        variant: "destructive",
      })
      return Promise.reject(error)
    }
  }

  // Atualizar um agendamento existente
  const updateAppointment = async (id: string, appointmentData: Partial<Appointment>) => {
    try {
      // Encontrar o agendamento a ser atualizado
      const appointmentIndex = appointments.findIndex((app) => app.id === id)
      if (appointmentIndex === -1) {
        throw new Error("Agendamento não encontrado")
      }
      
      // Atualizar o título se o cliente ou serviço mudou
      let updatedTitle = appointments[appointmentIndex].title
      if (appointmentData.client && appointmentData.service) {
        updatedTitle = `${appointmentData.client} - ${appointmentData.service}`
      } else if (appointmentData.client) {
        updatedTitle = `${appointmentData.client} - ${appointments[appointmentIndex].service}`
      } else if (appointmentData.service) {
        updatedTitle = `${appointments[appointmentIndex].client} - ${appointmentData.service}`
      }
      
      // Criar o agendamento atualizado
      const updatedAppointment = {
        ...appointments[appointmentIndex],
        ...appointmentData,
        title: updatedTitle,
      }
      
      // Preparar dados para o Supabase
      const supabaseData: any = {
        title: updatedAppointment.title,
        start: updatedAppointment.start.toISOString(),
        end_time: updatedAppointment.end.toISOString(),
        client: updatedAppointment.client,
        clientid: updatedAppointment.clientId,
        clientinitials: updatedAppointment.clientInitials,
        service: updatedAppointment.service,
        serviceid: updatedAppointment.serviceId,
        serviceduration: updatedAppointment.serviceDuration,
        status: updatedAppointment.status,
        color: updatedAppointment.color
      };
      
      // Adicionar campos opcionais apenas se estiverem definidos
      if (updatedAppointment.notes) {
        supabaseData.notes = updatedAppointment.notes;
      }
      
      if (updatedAppointment.clientAvatar) {
        supabaseData.clientavatar = updatedAppointment.clientAvatar;
      }
      
      console.log("Atualizando agendamento no Supabase:", id, supabaseData);
      
      // Atualizar no Supabase
      const { error } = await supabase
        .from('appointments')
        .update(supabaseData)
        .eq('id', id);
      
      if (error) {
        console.error("Erro ao atualizar agendamento no Supabase:", error);
        throw error;
      }
      
      // Atualizar o estado
      const newAppointments = [...appointments]
      newAppointments[appointmentIndex] = updatedAppointment
      setAppointments(newAppointments)
      
      toast({
        title: "Agendamento atualizado",
        description: `Agendamento para ${updatedAppointment.client} foi atualizado com sucesso.`,
      })
      
      return Promise.resolve()
    } catch (error) {
      console.error("Erro ao atualizar agendamento:", error)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o agendamento.",
        variant: "destructive",
      })
      return Promise.reject(error)
    }
  }

  // Excluir um agendamento
  const deleteAppointment = async (id: string) => {
    try {
      // Encontrar o agendamento a ser excluído
      const appointment = appointments.find((app) => app.id === id)
      if (!appointment) {
        throw new Error("Agendamento não encontrado")
      }
      
      // Excluir do Supabase
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Atualizar o estado
      setAppointments((prev) => prev.filter((app) => app.id !== id))
      
      toast({
        title: "Agendamento excluído",
        description: `Agendamento para ${appointment.client} foi excluído com sucesso.`,
      })
      
      return Promise.resolve()
    } catch (error) {
      console.error("Erro ao excluir agendamento:", error)
      toast({
        title: "Erro",
        description: "Não foi possível excluir o agendamento.",
        variant: "destructive",
      })
      return Promise.reject(error)
    }
  }

  // Obter um agendamento pelo ID
  const getAppointment = (id: string) => {
    return appointments.find((app) => app.id === id)
  }

  // Valor do contexto
  const value = {
    appointments,
    isLoading,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    getAppointment,
  }

  return <AppointmentContext.Provider value={value}>{children}</AppointmentContext.Provider>
}

// Gerar agendamentos de exemplo
function generateExampleAppointments(): Appointment[] {
  // Cores para os agendamentos
  const colors = ["blue", "green", "red", "purple", "orange"]
  
  // Data atual
  const now = new Date()
  
  // Criar 5 agendamentos de exemplo
  return [
    {
      id: uuidv4(),
      title: "Ana Silva - Corte de Cabelo",
      start: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 10, 0),
      end: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 11, 0),
      client: "Ana Silva",
      clientId: "1",
      clientInitials: "AS",
      service: "Corte de Cabelo",
      serviceId: "1",
      serviceDuration: 60,
      status: "confirmed",
      color: colors[0],
    },
    {
      id: uuidv4(),
      title: "Bruno Costa - Barba",
      start: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 14, 0),
      end: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 14, 30),
      client: "Bruno Costa",
      clientId: "2",
      clientInitials: "BC",
      service: "Barba",
      serviceId: "2",
      serviceDuration: 30,
      status: "confirmed",
      color: colors[1],
    },
    {
      id: uuidv4(),
      title: "Carla Mendes - Manicure",
      start: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 11, 0),
      end: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 12, 0),
      client: "Carla Mendes",
      clientId: "3",
      clientInitials: "CM",
      service: "Manicure",
      serviceId: "3",
      serviceDuration: 60,
      status: "pending",
      color: colors[2],
    },
    {
      id: uuidv4(),
      title: "Diogo Santos - Coloração",
      start: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 15, 0),
      end: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 16, 30),
      client: "Diogo Santos",
      clientId: "4",
      clientInitials: "DS",
      service: "Coloração",
      serviceId: "4",
      serviceDuration: 90,
      status: "confirmed",
      color: colors[3],
    },
    {
      id: uuidv4(),
      title: "Eduarda Lima - Hidratação",
      start: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 4, 9, 0),
      end: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 4, 10, 0),
      client: "Eduarda Lima",
      clientId: "5",
      clientInitials: "EL",
      service: "Hidratação",
      serviceId: "5",
      serviceDuration: 60,
      status: "cancelled",
      color: colors[4],
    },
  ]
} 