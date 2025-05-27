"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { CalendarIcon, Loader2, Pencil, Plus, Search, Trash, UserPlus } from "lucide-react"
import { toast } from "sonner"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { PageLayout } from "@/components/page-layout"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog"
import { 
  Search as MagnifyingGlassIcon,
  Phone as PhoneIcon,
  Mail as MailIcon
} from "lucide-react"
import { SupabaseClientStatus } from "@/components/supabase-client-status"
import { useClients, Client } from "@/context/ClientContext"
import { WhatsAppButton } from "@/components/whatsapp-button"
import { ClientDetailsDialog } from "@/components/client-details-dialog"

// Define the client form schema
const clientFormSchema = z.object({
  name: z.string().min(1, { message: "O nome é obrigatório." }),
  email: z.string().email({ message: "Email inválido." }).optional().or(z.literal("")),
  phone: z.string().min(1, { message: "O telefone é obrigatório." }),
  birthDate: z.date().optional(),
  address: z.string().optional(),
  postalCode: z.string().optional(),
  city: z.string().optional(),
  nif: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["active", "inactive"]).default("active"),
})

type ClientFormValues = z.infer<typeof clientFormSchema>

function ClientsContent() {
  const { clients, addClient, updateClient, deleteClient, isLoading } = useClients()
  const [searchQuery, setSearchQuery] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [clientToDelete, setClientToDelete] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [clientDetailsOpen, setClientDetailsOpen] = useState(false)
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)

  // Initialize the form
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      postalCode: "",
      city: "",
      nif: "",
      notes: "",
      status: "active",
    },
  })

  // Filter clients based on search query and active tab
  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone?.includes(searchQuery)
    
    if (activeTab === "all") return matchesSearch
    if (activeTab === "inactive") return matchesSearch && client.status === "inactive"
    if (activeTab === "active") return matchesSearch && client.status === "active"
    
    return matchesSearch
  })

  // Handle form submission
  async function onSubmit(values: ClientFormValues) {
    setIsSubmitting(true)
    
    try {
      if (editingClient) {
        // Update existing client
        await updateClient(editingClient.id, values)
        toast.success("Cliente atualizado com sucesso!")
      } else {
        // Add new client
        await addClient(values)
        toast.success("Cliente cadastrado com sucesso!")
      }
      
      // Reset and close
      setIsClientDialogOpen(false)
      setEditingClient(null)
      form.reset()
    } catch (error) {
      toast.error("Erro ao salvar cliente. Tente novamente.")
      console.error("Erro ao salvar cliente:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle edit client
  function handleEditClient(client: Client) {
    setEditingClient(client)
    form.reset({
      name: client.name,
      email: client.email || "",
      phone: client.phone || "",
      birthDate: client.birthDate || undefined,
      address: client.address || "",
      postalCode: client.postalCode || "",
      city: client.city || "",
      nif: client.nif || "",
      notes: client.notes || "",
      status: client.status,
    })
    setIsClientDialogOpen(true)
  }

  // Handle delete client
  function handleDeleteClient(id: string) {
    setClientToDelete(id)
    setIsDeleteDialogOpen(true)
  }

  // Confirm delete client
  async function confirmDeleteClient() {
    if (clientToDelete) {
      try {
        await deleteClient(clientToDelete)
        toast.success("Cliente excluído com sucesso!")
      } catch (error) {
        toast.error("Erro ao excluir cliente. Tente novamente.")
        console.error("Erro ao excluir cliente:", error)
      } finally {
        setIsDeleteDialogOpen(false)
        setClientToDelete(null)
      }
    }
  }

  // Open new client dialog
  function handleNewClient() {
    setEditingClient(null)
    form.reset({
      name: "",
      email: "",
      phone: "",
      address: "",
      postalCode: "",
      city: "",
      nif: "",
      notes: "",
      status: "active",
    })
    setIsClientDialogOpen(true)
  }

  // Client status badge
  function getClientStatusBadge(status: string) {
    switch (status) {
      case "active":
        return <Badge variant="default" className="bg-green-500 text-white">Ativo</Badge>
      case "inactive":
        return <Badge variant="outline" className="bg-gray-200">Inativo</Badge>
      default:
        return null
    }
  }

  // Get client services count and total spent
  function getClientServicesInfo(clientId: string) {
    // This would ideally come from the context
    return {
      serviceCount: 0,
      totalSpent: 0
    }
  }

  // Abrir os detalhes do cliente
  function handleViewClientDetails(clientId: string) {
    setSelectedClientId(clientId)
    setClientDetailsOpen(true)
  }

  return (
    <div className="container mx-auto p-4 pb-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <Button onClick={handleNewClient} className="gap-2">
          <UserPlus size={16} />
          Novo Cliente
        </Button>
      </div>

      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="active">Ativos</TabsTrigger>
            <TabsTrigger value="inactive">Inativos</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar clientes..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Carregando clientes...</span>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead className="hidden md:table-cell">Telefone</TableHead>
                    <TableHead className="hidden md:table-cell">Email</TableHead>
                    <TableHead className="hidden lg:table-cell">Cidade</TableHead>
                    <TableHead className="hidden lg:table-cell">Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                        Nenhum cliente encontrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredClients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell>
                          <div 
                            className="flex items-center gap-2 cursor-pointer hover:text-primary hover:underline"
                            onClick={() => handleViewClientDetails(client.id)}
                          >
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{client.initials}</AvatarFallback>
                            </Avatar>
                            <div className="font-medium">{client.name}</div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{client.phone || "-"}</TableCell>
                        <TableCell className="hidden md:table-cell">{client.email || "-"}</TableCell>
                        <TableCell className="hidden lg:table-cell">{client.city || "-"}</TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {getClientStatusBadge(client.status)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {client.phone && (
                              <WhatsAppButton 
                                phoneNumber={client.phone} 
                                message={`Olá ${client.name}, `}
                              />
                            )}
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={() => handleEditClient(client)}
                            >
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Editar</span>
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="text-destructive" 
                              onClick={() => handleDeleteClient(client.id)}
                            >
                              <Trash className="h-4 w-4" />
                              <span className="sr-only">Excluir</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Client Form Dialog */}
      <Dialog open={isClientDialogOpen} onOpenChange={setIsClientDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingClient ? "Editar Cliente" : "Novo Cliente"}
            </DialogTitle>
            <DialogDescription>
              {editingClient 
                ? "Atualize as informações do cliente abaixo." 
                : "Preencha os dados para cadastrar um novo cliente."}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome*</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome completo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone*</FormLabel>
                      <FormControl>
                        <Input placeholder="Telefone" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="birthDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data de Nascimento</FormLabel>
                      <div className="flex space-x-2">
                        <FormControl>
                          <Input 
                            type="date" 
                            value={field.value ? format(field.value, "yyyy-MM-dd") : ""} 
                            onChange={(e) => {
                              if (!e.target.value) {
                                field.onChange(undefined);
                                return;
                              }
                              
                              try {
                                // Parse the date string directly
                                const inputDate = new Date(e.target.value + "T12:00:00");
                                
                                // Check if date is valid
                                if (!isNaN(inputDate.getTime())) {
                                  field.onChange(inputDate);
                                }
                              } catch (error) {
                                console.error("Error parsing date:", error);
                              }
                            }}
                            className="w-full"
                          />
                        </FormControl>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              type="button"
                              className="w-10 p-0"
                            >
                              <CalendarIcon className="h-4 w-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={(date) => {
                                if (date) {
                                  // Set time to noon to avoid timezone issues
                                  const adjustedDate = new Date(date);
                                  adjustedDate.setHours(12, 0, 0, 0);
                                  field.onChange(adjustedDate);
                                } else {
                                  field.onChange(undefined);
                                }
                              }}
                              disabled={(date) =>
                                date > new Date() || date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Endereço</FormLabel>
                      <FormControl>
                        <Input placeholder="Endereço" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código Postal</FormLabel>
                      <FormControl>
                        <Input placeholder="Código Postal" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade</FormLabel>
                      <FormControl>
                        <Input placeholder="Cidade" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="nif"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>NIF</FormLabel>
                      <FormControl>
                        <Input placeholder="NIF" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="col-span-1 md:col-span-2">
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Observações</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Observações sobre o cliente" 
                            className="resize-none" 
                            {...field} 
                          />
                        </FormControl>
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
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Ativo</SelectItem>
                          <SelectItem value="inactive">Inativo</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsClientDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingClient ? "Atualizar" : "Cadastrar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Cliente Details Dialog */}
      <ClientDetailsDialog
        open={clientDetailsOpen}
        onOpenChange={setClientDetailsOpen}
        clientId={selectedClientId}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Cliente</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmDeleteClient}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Display Supabase connection status */}
      <div className="fixed bottom-4 right-4">
        <SupabaseClientStatus />
      </div>
    </div>
  )
}

export default function ClientsPage() {
  return (
    <PageLayout>
      <ClientsContent />
    </PageLayout>
  )
}

