"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { toast } from "@/components/ui/use-toast"
import { v4 as uuidv4 } from "uuid"
import { useSupabase } from "./SupabaseContext"

// Client interface
export interface Client {
  id: string
  name: string
  email?: string
  phone?: string
  birthDate?: Date | null
  address?: string
  postalCode?: string
  city?: string
  nif?: string // Número de Identificação Fiscal português
  notes?: string
  initials: string
  avatarUrl?: string
  status: "active" | "inactive"
  attendance?: ClientAttendance[] // Histórico de comparecimento
}

// Interface para o histórico de comparecimento
export interface ClientAttendance {
  id: string
  clientId: string
  appointmentId: string
  date: Date
  attended: boolean
  reason?: string
  createdAt: Date
}

// Interface para serviços de cliente
export interface ClientService {
  id: string
  clientId: string
  serviceName: string
  serviceDate: Date
  notes?: string
  price: number
  attended: boolean // Campo adicionado para rastrear comparecimento
  paymentMethod?: "cash" | "card" | "transfer" | "other"
  createdAt?: Date
  updatedAt?: Date
}

// Client context type
interface ClientContextType {
  clients: Client[]
  clientServices: ClientService[]
  isLoading: boolean
  addClient: (client: Omit<Client, "id" | "initials" | "status">) => Promise<string>
  updateClient: (id: string, client: Partial<Client>) => Promise<void>
  deleteClient: (id: string) => Promise<void>
  getClient: (id: string) => Client | undefined
  addClientService: (service: Omit<ClientService, "id">) => Promise<void>
  updateClientService: (id: string, service: Partial<ClientService>) => Promise<void>
  deleteClientService: (id: string) => Promise<void>
  getClientServices: (clientId: string) => ClientService[]
  addClientAttendance: (attendance: Omit<ClientAttendance, "id" | "createdAt">) => Promise<void>
  updateClientAttendance: (id: string, attendance: Partial<ClientAttendance>) => Promise<void>
  getClientAttendance: (clientId: string) => ClientAttendance[]
}

// Create the context
const ClientContext = createContext<ClientContextType | undefined>(undefined)

// Hook to use the client context
export const useClients = () => {
  const context = useContext(ClientContext)
  if (!context) {
    throw new Error("useClients must be used within a ClientProvider")
  }
  return context
}

// Generate initials from name
const generateInitials = (name: string): string => {
  return name
    .split(' ')
    .map(part => part[0])
    .filter(Boolean)
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

// Client provider component
export function ClientProvider({ children }: { children: React.ReactNode }) {
  const [clients, setClients] = useState<Client[]>([])
  const [clientServices, setClientServices] = useState<ClientService[]>([])
  const [clientAttendance, setClientAttendance] = useState<ClientAttendance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { supabase } = useSupabase()

  // Load clients and services from Supabase on start
  useEffect(() => {
    const loadClientsData = async () => {
      try {
        console.log("Iniciando carregamento de dados de clientes...")
        
        // Verificar se o Supabase está disponível
        if (!supabase) {
          throw new Error("Cliente Supabase não está disponível")
        }

        // Usar dados de exemplo por padrão
        const exampleClients = generateExampleClients()
        
        try {
          // Verificar se a tabela clients existe
          console.log("Verificando se a tabela clients existe...")
          const { error: checkError } = await supabase
            .from('clients')
            .select('id')
            .limit(1)
          
          if (checkError) {
            console.error("Erro ao verificar tabela clients:", checkError)
            throw checkError
          }
          
          console.log("Tabela clients verificada com sucesso")
          
          // Fetch clients
          console.log("Buscando clientes...")
          const { data: clientsData, error: clientsError } = await supabase
            .from('clients')
            .select('*')
            .order('name', { ascending: true })
          
          if (clientsError) {
            console.error("Erro ao buscar clientes:", clientsError)
            throw clientsError
          }
          
          console.log(`Encontrados ${clientsData?.length || 0} clientes`)
          
          if (clientsData && clientsData.length > 0) {
            // Convert date strings to Date objects
            const formattedClients = clientsData.map((client: any) => ({
              id: client.id,
              name: client.name,
              email: client.email,
              phone: client.phone,
              birthDate: client.birth_date ? new Date(client.birth_date) : null,
              address: client.address,
              postalCode: client.postal_code,
              city: client.city,
              nif: client.nif,
              notes: client.notes,
              initials: client.initials || generateInitials(client.name),
              avatarUrl: client.avatar_url,
              status: client.status || "active",
              attendance: client.attendance || []
            }))
            setClients(formattedClients)
            
            toast({
              title: "Dados carregados",
              description: `${formattedClients.length} clientes carregados do Supabase.`,
              variant: "default",
            })
          } else {
            console.log("Nenhum cliente encontrado, usando dados de exemplo...")
            setClients(exampleClients)
            
            toast({
              title: "Dados de exemplo",
              description: "Nenhum cliente encontrado. Usando dados de exemplo.",
              variant: "default",
            })
          }
          
        } catch (error) {
          console.error("Erro ao acessar tabela clients:", error)
          setClients(exampleClients)
          
          toast({
            title: "Usando dados locais",
            description: "Não foi possível acessar a tabela de clientes. Usando dados de exemplo locais.",
            variant: "destructive",
          })
        }
        
        try {
          // Verificar se a tabela client_services existe
          const { error: checkServicesError } = await supabase
            .from('client_services')
            .select('id')
            .limit(1)
          
          if (checkServicesError) {
            console.error("Erro ao verificar tabela client_services:", checkServicesError)
            throw checkServicesError
          }
          
          // Fetch client services
          console.log("Buscando serviços de clientes...")
          const { data: servicesData, error: servicesError } = await supabase
            .from('client_services')
            .select('*')
            .order('service_date', { ascending: false })
          
          if (servicesError) {
            console.error("Erro ao buscar serviços de clientes:", servicesError)
            throw servicesError
          }
          
          console.log(`Encontrados ${servicesData?.length || 0} serviços de clientes`)
          
          if (servicesData && servicesData.length > 0) {
            // Convert date strings to Date objects
            const formattedServices = servicesData.map((service: any) => ({
              id: service.id,
              clientId: service.client_id,
              serviceName: service.service_name,
              serviceDate: new Date(service.service_date),
              notes: service.notes,
              price: service.price,
              attended: service.attended,
              paymentMethod: service.payment_method,
              createdAt: service.created_at ? new Date(service.created_at) : undefined,
              updatedAt: service.updated_at ? new Date(service.updated_at) : undefined
            }))
            setClientServices(formattedServices)
          } else {
            // Usar serviços de exemplo vazios
            setClientServices([])
          }
        } catch (servicesError) {
          console.error("Erro ao carregar serviços de clientes:", servicesError)
          // Continuar mesmo com erro nos serviços
          setClientServices([])
        }
        
      } catch (error) {
        console.error("Erro ao carregar dados de clientes:", error)
        
        // Em caso de erro, usar dados de exemplo locais
        const exampleClients = generateExampleClients()
        setClients(exampleClients)
        
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados de clientes. Usando dados locais.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
        console.log("Carregamento de dados de clientes concluído com sucesso")
      }
    }

    loadClientsData()
  }, [supabase])

  // Add a new client
  const addClient = async (clientData: Omit<Client, "id" | "initials" | "status">) => {
    try {
      const initials = generateInitials(clientData.name)
      const newClient: Client = {
        ...clientData,
        id: crypto.randomUUID(),
        initials,
        status: "active",
        attendance: []
      }
      
      // Adicionar ao estado local primeiro para feedback imediato
      setClients(prev => [...prev, newClient])
      
      if (supabase) {
        try {
          console.log("Tentando adicionar cliente ao Supabase:", newClient)
          
          // Adicionar ao Supabase - usando apenas os campos que existem na tabela
          const { data, error } = await supabase.from('clients').insert({
            id: newClient.id,
            name: newClient.name,
            email: newClient.email || null,
            phone: newClient.phone || null,
            birth_date: newClient.birthDate ? newClient.birthDate.toISOString().split('T')[0] : null,
            address: newClient.address || null,
            notes: newClient.notes || null,
            initials: newClient.initials,
            status: newClient.status,
            attendance: newClient.attendance
          }).select()
          
          if (error) {
            console.error("Erro ao adicionar cliente ao Supabase:", error)
            toast({
              title: "Aviso",
              description: `Cliente adicionado localmente, mas não foi salvo no banco de dados: ${error.message}`,
              variant: "destructive",
            })
          } else {
            console.log("Cliente adicionado com sucesso ao Supabase:", data)
            toast({
              title: "Sucesso",
              description: `${newClient.name} foi adicionado ao banco de dados com sucesso.`,
            })
          }
        } catch (error: any) {
          console.error("Exceção ao adicionar cliente ao Supabase:", error)
          toast({
            title: "Erro",
            description: `Erro ao salvar no banco de dados: ${error.message || "Erro desconhecido"}`,
            variant: "destructive",
          })
        }
      } else {
        console.warn("Cliente adicionado apenas localmente (Supabase não disponível)")
        toast({
          title: "Aviso",
          description: "Cliente adicionado apenas localmente. Conexão com banco de dados não disponível.",
          variant: "default",
        })
      }
      
      return newClient.id
    } catch (error: any) {
      console.error("Erro ao adicionar cliente:", error)
      toast({
        title: "Erro",
        description: `Não foi possível adicionar o cliente: ${error.message || "Erro desconhecido"}`,
        variant: "destructive",
      })
      throw error
    }
  }

  // Update an existing client
  const updateClient = async (id: string, clientData: Partial<Client>) => {
    try {
      // Atualizar no estado local primeiro para feedback imediato
      setClients(prev => 
        prev.map(client => 
          client.id === id 
            ? { ...client, ...clientData } 
            : client
        )
      )
      
      if (supabase) {
        try {
          // Preparar dados para o Supabase
          const supabaseData: any = {}
          
          if (clientData.name) supabaseData.name = clientData.name
          if (clientData.email !== undefined) supabaseData.email = clientData.email || null
          if (clientData.phone !== undefined) supabaseData.phone = clientData.phone || null
          if (clientData.birthDate !== undefined) supabaseData.birth_date = clientData.birthDate ? clientData.birthDate.toISOString().split('T')[0] : null
          if (clientData.address !== undefined) supabaseData.address = clientData.address || null
          if (clientData.notes !== undefined) supabaseData.notes = clientData.notes || null
          if (clientData.status) supabaseData.status = clientData.status
          if (clientData.initials) supabaseData.initials = clientData.initials
          if (clientData.attendance) supabaseData.attendance = clientData.attendance
          
          console.log("Atualizando cliente no Supabase:", id, supabaseData)
          
          // Atualizar no Supabase
          const { data, error } = await supabase
            .from('clients')
            .update(supabaseData)
            .eq('id', id)
            .select()
          
          if (error) {
            console.error("Erro ao atualizar cliente no Supabase:", error)
            toast({
              title: "Aviso",
              description: `Cliente atualizado localmente, mas não foi salvo no banco de dados: ${error.message}`,
              variant: "destructive",
            })
          } else {
            console.log("Cliente atualizado com sucesso no Supabase:", data)
            toast({
              title: "Sucesso",
              description: "Cliente atualizado no banco de dados com sucesso.",
            })
          }
        } catch (error: any) {
          console.error("Exceção ao atualizar cliente no Supabase:", error)
          toast({
            title: "Erro",
            description: `Erro ao salvar no banco de dados: ${error.message || "Erro desconhecido"}`,
            variant: "destructive",
          })
        }
      } else {
        console.warn("Cliente atualizado apenas localmente (Supabase não disponível)")
        toast({
          title: "Aviso",
          description: "Cliente atualizado apenas localmente. Conexão com banco de dados não disponível.",
          variant: "default",
        })
      }
    } catch (error: any) {
      console.error("Erro ao atualizar cliente:", error)
      toast({
        title: "Erro",
        description: `Não foi possível atualizar o cliente: ${error.message || "Erro desconhecido"}`,
        variant: "destructive",
      })
      throw error
    }
  }

  // Delete a client
  const deleteClient = async (id: string) => {
    try {
      // Remover do estado local primeiro para feedback imediato
      setClients(prev => prev.filter(client => client.id !== id))
      
      if (supabase) {
        try {
          // Remover do Supabase
          const { error } = await supabase
            .from('clients')
            .delete()
            .eq('id', id)
          
          if (error) {
            console.error("Erro ao excluir cliente do Supabase:", error)
          }
        } catch (error) {
          console.error("Erro ao excluir cliente do Supabase:", error)
        }
      }
    } catch (error) {
      console.error("Erro ao excluir cliente:", error)
      throw error
    }
  }

  // Get a client by ID
  const getClient = (id: string) => {
    return clients.find((client) => client.id === id)
  }

  // Add a new client service
  const addClientService = async (serviceData: Omit<ClientService, "id">) => {
    try {
      // Generate a unique ID
      const id = uuidv4()
      
      // Create the new service
      const newService: ClientService = {
        ...serviceData,
        id
      }
      
      // Save to Supabase
      const { error } = await supabase.from('client_services').insert({
        id: newService.id,
        client_id: newService.clientId,
        service_name: newService.serviceName,
        service_date: newService.serviceDate.toISOString(),
        notes: newService.notes,
        price: newService.price,
        attended: newService.attended,
        payment_method: newService.paymentMethod,
        created_at: newService.createdAt ? newService.createdAt.toISOString() : null,
        updated_at: newService.updatedAt ? newService.updatedAt.toISOString() : null
      })
      
      if (error) throw error
      
      // Update the state
      setClientServices((prev) => [...prev, newService])
      
      toast({
        title: "Serviço adicionado",
        description: `${newService.serviceName} foi adicionado com sucesso.`,
      })
      
      return Promise.resolve()
    } catch (error) {
      console.error("Erro ao adicionar serviço:", error)
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o serviço.",
        variant: "destructive",
      })
      return Promise.reject(error)
    }
  }

  // Update an existing client service
  const updateClientService = async (id: string, serviceData: Partial<ClientService>) => {
    try {
      // Find the service to update
      const serviceIndex = clientServices.findIndex((service) => service.id === id)
      if (serviceIndex === -1) {
        throw new Error("Serviço não encontrado")
      }
      
      // Create the updated service
      const updatedService = {
        ...clientServices[serviceIndex],
        ...serviceData
      }
      
      // Update in Supabase
      const { error } = await supabase
        .from('client_services')
        .update({
          client_id: updatedService.clientId,
          service_name: updatedService.serviceName,
          service_date: updatedService.serviceDate.toISOString(),
          notes: updatedService.notes,
          price: updatedService.price,
          attended: updatedService.attended,
          payment_method: updatedService.paymentMethod,
          created_at: updatedService.createdAt ? updatedService.createdAt.toISOString() : null,
          updated_at: updatedService.updatedAt ? updatedService.updatedAt.toISOString() : null
        })
        .eq('id', id)
      
      if (error) throw error
      
      // Update the state
      const newServices = [...clientServices]
      newServices[serviceIndex] = updatedService
      setClientServices(newServices)
      
      toast({
        title: "Serviço atualizado",
        description: `${updatedService.serviceName} foi atualizado com sucesso.`,
      })
      
      return Promise.resolve()
    } catch (error) {
      console.error("Erro ao atualizar serviço:", error)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o serviço.",
        variant: "destructive",
      })
      return Promise.reject(error)
    }
  }

  // Delete a client service
  const deleteClientService = async (id: string) => {
    try {
      // Find the service to delete
      const service = clientServices.find((service) => service.id === id)
      if (!service) {
        throw new Error("Serviço não encontrado")
      }
      
      // Delete from Supabase
      const { error } = await supabase
        .from('client_services')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      // Update the state
      setClientServices((prev) => prev.filter((service) => service.id !== id))
      
      toast({
        title: "Serviço excluído",
        description: `${service.serviceName} foi excluído com sucesso.`,
      })
      
      return Promise.resolve()
    } catch (error) {
      console.error("Erro ao excluir serviço:", error)
      toast({
        title: "Erro",
        description: "Não foi possível excluir o serviço.",
        variant: "destructive",
      })
      return Promise.reject(error)
    }
  }

  // Get client services by client ID
  const getClientServices = (clientId: string) => {
    return clientServices.filter((service) => service.clientId === clientId)
  }

  // Add client attendance record
  const addClientAttendance = async (attendanceData: Omit<ClientAttendance, "id" | "createdAt">) => {
    try {
      // Generate a unique ID
      const id = uuidv4()
      
      // Create the new attendance record
      const newAttendance: ClientAttendance = {
        ...attendanceData,
        id,
        createdAt: new Date()
      }
      
      // Save to Supabase
      const { error } = await supabase.from('client_attendance').insert({
        id: newAttendance.id,
        client_id: newAttendance.clientId,
        appointment_id: newAttendance.appointmentId,
        date: newAttendance.date.toISOString(),
        attended: newAttendance.attended,
        reason: newAttendance.reason,
        created_at: newAttendance.createdAt.toISOString()
      })
      
      if (error) throw error
      
      // Update the state
      setClientAttendance((prev) => [...prev, newAttendance])
      
      return Promise.resolve()
    } catch (error) {
      console.error("Erro ao adicionar registro de comparecimento:", error)
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o registro de comparecimento.",
        variant: "destructive",
      })
      return Promise.reject(error)
    }
  }

  // Update client attendance record
  const updateClientAttendance = async (id: string, attendanceData: Partial<ClientAttendance>) => {
    try {
      // Find the attendance record to update
      const attendanceIndex = clientAttendance.findIndex((attendance) => attendance.id === id)
      if (attendanceIndex === -1) {
        throw new Error("Registro de comparecimento não encontrado")
      }
      
      // Create the updated attendance record
      const updatedAttendance = {
        ...clientAttendance[attendanceIndex],
        ...attendanceData
      }
      
      // Prepare data for Supabase update
      const updateData: any = {}
      if (attendanceData.clientId) updateData.client_id = attendanceData.clientId
      if (attendanceData.appointmentId) updateData.appointment_id = attendanceData.appointmentId
      if (attendanceData.date) updateData.date = attendanceData.date.toISOString()
      if (attendanceData.attended !== undefined) updateData.attended = attendanceData.attended
      if (attendanceData.reason !== undefined) updateData.reason = attendanceData.reason
      
      // Update in Supabase if there's data to update
      if (Object.keys(updateData).length > 0) {
        const { error } = await supabase
          .from('client_attendance')
          .update(updateData)
          .eq('id', id)
        
        if (error) throw error
      }
      
      // Update the state
      const newAttendance = [...clientAttendance]
      newAttendance[attendanceIndex] = updatedAttendance
      setClientAttendance(newAttendance)
      
      return Promise.resolve()
    } catch (error) {
      console.error("Erro ao atualizar registro de comparecimento:", error)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o registro de comparecimento.",
        variant: "destructive",
      })
      return Promise.reject(error)
    }
  }

  // Get client attendance records by client ID
  const getClientAttendance = (clientId: string) => {
    return clientAttendance.filter((attendance) => attendance.clientId === clientId)
  }

  // Context value
  const value = {
    clients,
    clientServices,
    isLoading,
    addClient,
    updateClient,
    deleteClient,
    getClient,
    addClientService,
    updateClientService,
    deleteClientService,
    getClientServices,
    addClientAttendance,
    updateClientAttendance,
    getClientAttendance
  }

  return <ClientContext.Provider value={value}>{children}</ClientContext.Provider>
}

// Generate example clients
function generateExampleClients(): Client[] {
  const clients: Client[] = [
    {
      id: uuidv4(),
      name: "Ana Silva",
      email: "ana.silva@example.com",
      phone: "(+351) 912 345 678",
      birthDate: new Date(1990, 5, 15),
      address: "Rua das Flores, 123",
      postalCode: "1000-001",
      city: "Lisboa",
      nif: "123456789",
      notes: "Cliente regular, prefere atendimento pela manhã",
      initials: "AS",
      status: "active",
      attendance: []
    },
    {
      id: uuidv4(),
      name: "Bruno Costa",
      email: "bruno.costa@example.com",
      phone: "(+351) 931 234 567",
      birthDate: new Date(1985, 8, 22),
      address: "Av. da Liberdade, 1000",
      postalCode: "1250-096",
      city: "Lisboa",
      nif: "234567891",
      notes: "Alérgico a alguns produtos",
      initials: "BC",
      status: "active",
      attendance: []
    },
    {
      id: uuidv4(),
      name: "Carla Mendes",
      email: "carla.mendes@example.com",
      phone: "(+351) 961 987 654",
      birthDate: new Date(1992, 3, 10),
      address: "Rua Augusta, 500",
      postalCode: "1100-053",
      city: "Lisboa",
      nif: "345678912",
      initials: "CM",
      status: "active",
      attendance: []
    },
    {
      id: uuidv4(),
      name: "Diogo Santos",
      email: "diogo.santos@example.com",
      phone: "(+351) 968 888 777",
      birthDate: new Date(1988, 10, 5),
      address: "Rua do Comércio, 200",
      postalCode: "1100-150",
      city: "Lisboa",
      nif: "456789123",
      notes: "Prefere atendimento no fim do dia",
      initials: "DS",
      status: "active",
      attendance: []
    },
    {
      id: uuidv4(),
      name: "Eduarda Lima",
      email: "eduarda.lima@example.com",
      phone: "(+351) 927 777 888",
      birthDate: new Date(1995, 1, 28),
      address: "Avenida da República, 800",
      postalCode: "1050-191",
      city: "Lisboa",
      nif: "567891234",
      initials: "EL",
      status: "inactive",
      attendance: []
    }
  ]
  
  return clients
} 