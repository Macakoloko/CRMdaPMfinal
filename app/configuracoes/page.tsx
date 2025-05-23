"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Save, Loader2 } from "lucide-react"
import { toast } from "sonner"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { TimeInput } from "@/components/ui/time-input"
import { ThemeSettings } from "@/components/theme-settings"
import { SetupDatabase } from "@/components/setup-database"
import { SetupProductsTable } from "@/components/setup-products-table"

// Business information schema
const businessSchema = z.object({
  nome: z.string().min(1, { message: "O nome é obrigatório." }),
  telefone: z.string().min(1, { message: "O telefone é obrigatório." }),
  email: z.string().email({ message: "Email inválido." }),
  endereco: z.string().min(1, { message: "O endereço é obrigatório." }),
  cidade: z.string().min(1, { message: "A cidade é obrigatória." }),
  codigoPostal: z.string().min(1, { message: "O código postal é obrigatório." }),
  website: z.string().optional(),
  descricao: z.string().optional(),
  nif: z.string().min(1, { message: "O NIF é obrigatório." }),
})

// Working hours schema
const workingHoursSchema = z.object({
  segunda: z.object({
    aberto: z.boolean().default(true),
    abertura: z.string().optional(),
    fechamento: z.string().optional(),
    pausaInicio: z.string().optional(),
    pausaFim: z.string().optional(),
  }),
  terca: z.object({
    aberto: z.boolean().default(true),
    abertura: z.string().optional(),
    fechamento: z.string().optional(),
    pausaInicio: z.string().optional(),
    pausaFim: z.string().optional(),
  }),
  quarta: z.object({
    aberto: z.boolean().default(true),
    abertura: z.string().optional(),
    fechamento: z.string().optional(),
    pausaInicio: z.string().optional(),
    pausaFim: z.string().optional(),
  }),
  quinta: z.object({
    aberto: z.boolean().default(true),
    abertura: z.string().optional(),
    fechamento: z.string().optional(),
    pausaInicio: z.string().optional(),
    pausaFim: z.string().optional(),
  }),
  sexta: z.object({
    aberto: z.boolean().default(true),
    abertura: z.string().optional(),
    fechamento: z.string().optional(),
    pausaInicio: z.string().optional(),
    pausaFim: z.string().optional(),
  }),
  sabado: z.object({
    aberto: z.boolean().default(true),
    abertura: z.string().optional(),
    fechamento: z.string().optional(),
    pausaInicio: z.string().optional(),
    pausaFim: z.string().optional(),
  }),
  domingo: z.object({
    aberto: z.boolean().default(false),
    abertura: z.string().optional(),
    fechamento: z.string().optional(),
    pausaInicio: z.string().optional(),
    pausaFim: z.string().optional(),
  }),
  intervaloAgendamento: z.string().min(1, { message: "O intervalo é obrigatório." }),
})

// Notifications schema
const notificationsSchema = z.object({
  emailConfirmacao: z.boolean().default(true),
  emailLembrete: z.boolean().default(true),
  smsConfirmacao: z.boolean().default(false),
  smsLembrete: z.boolean().default(false),
  lembreteHoras: z.string().min(1, { message: "O tempo de lembrete é obrigatório." }),
  emailCancelamento: z.boolean().default(true),
  smsCancelamento: z.boolean().default(false),
})

// Mock business data
const mockBusinessData = {
  nome: "Salão Beleza Total",
  telefone: "+351 912 345 678",
  email: "contato@belezatotal.pt",
  endereco: "Rua das Flores, 123",
  cidade: "Lisboa",
  codigoPostal: "1000-001",
  website: "www.belezatotal.pt",
  descricao: "Salão de beleza completo com serviços de cabelo, unhas, maquiagem e estética.",
  nif: "123456789",
}

// Mock working hours data
const mockWorkingHours = {
  segunda: {
    aberto: true,
    abertura: "09:00",
    fechamento: "19:00",
    pausaInicio: "13:00",
    pausaFim: "14:00",
  },
  terca: {
    aberto: true,
    abertura: "09:00",
    fechamento: "19:00",
    pausaInicio: "13:00",
    pausaFim: "14:00",
  },
  quarta: {
    aberto: true,
    abertura: "09:00",
    fechamento: "19:00",
    pausaInicio: "13:00",
    pausaFim: "14:00",
  },
  quinta: {
    aberto: true,
    abertura: "09:00",
    fechamento: "19:00",
    pausaInicio: "13:00",
    pausaFim: "14:00",
  },
  sexta: {
    aberto: true,
    abertura: "09:00",
    fechamento: "19:00",
    pausaInicio: "13:00",
    pausaFim: "14:00",
  },
  sabado: {
    aberto: true,
    abertura: "10:00",
    fechamento: "16:00",
    pausaInicio: "",
    pausaFim: "",
  },
  domingo: {
    aberto: false,
    abertura: "",
    fechamento: "",
    pausaInicio: "",
    pausaFim: "",
  },
  intervaloAgendamento: "30",
}

// Mock notifications data
const mockNotifications = {
  emailConfirmacao: true,
  emailLembrete: true,
  smsConfirmacao: false,
  smsLembrete: false,
  lembreteHoras: "24",
  emailCancelamento: true,
  smsCancelamento: false,
}

export default function SettingsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("business")
  
  // Verificar se há um parâmetro de aba na URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tabParam = params.get('tab')
    if (tabParam && ['business', 'hours', 'notifications', 'appearance', 'database'].includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [])
  
  // Function to set up products table
  const setupProductsTable = async () => {
    try {
      toast.info("Configurando tabela de produtos...")
      const response = await fetch('/api/products/setup', {
        method: 'POST',
      })
      
      if (!response.ok) {
        throw new Error('Falha ao configurar tabela de produtos')
      }
      
      toast.success("Tabela de produtos configurada com sucesso!")
    } catch (error) {
      console.error('Erro ao configurar tabela de produtos:', error)
      toast.error("Erro ao configurar tabela de produtos")
    }
  }
  
  // Business form
  const businessForm = useForm<z.infer<typeof businessSchema>>({
    resolver: zodResolver(businessSchema),
    defaultValues: mockBusinessData,
  })

  // Working hours form
  const workingHoursForm = useForm<z.infer<typeof workingHoursSchema>>({
    resolver: zodResolver(workingHoursSchema),
    defaultValues: mockWorkingHours,
  })

  // Notifications form
  const notificationsForm = useForm<z.infer<typeof notificationsSchema>>({
    resolver: zodResolver(notificationsSchema),
    defaultValues: mockNotifications,
  })

  // Handle business form submission
  function onBusinessSubmit(values: z.infer<typeof businessSchema>) {
    setIsSubmitting(true)
    
    setTimeout(() => {
      console.log(values)
      toast.success("Informações da empresa atualizadas com sucesso!")
      setIsSubmitting(false)
    }, 1000)
  }

  // Handle working hours form submission
  function onWorkingHoursSubmit(values: z.infer<typeof workingHoursSchema>) {
    setIsSubmitting(true)
    
    setTimeout(() => {
      console.log(values)
      toast.success("Horário de funcionamento atualizado com sucesso!")
      setIsSubmitting(false)
    }, 1000)
  }

  // Handle notifications form submission
  function onNotificationsSubmit(values: z.infer<typeof notificationsSchema>) {
    setIsSubmitting(true)
    
    setTimeout(() => {
      console.log(values)
      toast.success("Configurações de notificações atualizadas com sucesso!")
      setIsSubmitting(false)
    }, 1000)
  }

  // Days of the week in Portuguese
  const daysOfWeek = {
    segunda: "Segunda-feira",
    terca: "Terça-feira",
    quarta: "Quarta-feira",
    quinta: "Quinta-feira",
    sexta: "Sexta-feira",
    sabado: "Sábado",
    domingo: "Domingo",
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">Gerencie as configurações do seu sistema</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="business">Empresa</TabsTrigger>
          <TabsTrigger value="hours">Horários</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="appearance">Aparência</TabsTrigger>
          <TabsTrigger value="database">Banco de Dados</TabsTrigger>
        </TabsList>

        {/* Business Information */}
        <TabsContent value="business">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Empresa</CardTitle>
              <CardDescription>
                Configure as informações básicas da sua empresa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...businessForm}>
                <form onSubmit={businessForm.handleSubmit(onBusinessSubmit)} className="space-y-6">
                  <FormField
                    control={businessForm.control}
                    name="nome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome da Empresa</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome da empresa" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={businessForm.control}
                      name="telefone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone</FormLabel>
                          <FormControl>
                            <Input placeholder="Telefone" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={businessForm.control}
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
                  </div>

                  <FormField
                    control={businessForm.control}
                    name="endereco"
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

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={businessForm.control}
                      name="cidade"
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
                      control={businessForm.control}
                      name="codigoPostal"
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
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={businessForm.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website</FormLabel>
                          <FormControl>
                            <Input placeholder="Website (opcional)" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={businessForm.control}
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
                  </div>

                  <FormField
                    control={businessForm.control}
                    name="descricao"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Descrição da empresa (opcional)"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Salvar Alterações
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Working Hours */}
        <TabsContent value="hours">
          <Card>
            <CardHeader>
              <CardTitle>Horário de Funcionamento</CardTitle>
              <CardDescription>
                Configure os horários de funcionamento da sua empresa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...workingHoursForm}>
                <form onSubmit={workingHoursForm.handleSubmit(onWorkingHoursSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    {/* Segunda-feira */}
                    <div className="rounded-md border p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">Segunda-feira</h3>
                        <FormField
                          control={workingHoursForm.control}
                          name="segunda.aberto"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2">
                              <FormLabel>Aberto</FormLabel>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      {workingHoursForm.watch("segunda.aberto") && (
                        <div className="mt-4 grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <FormField
                              control={workingHoursForm.control}
                              name="segunda.abertura"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Abertura</FormLabel>
                                  <FormControl>
                                    <TimeInput
                                      value={field.value || ""}
                                      onChange={field.onChange}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="space-y-2">
                            <FormField
                              control={workingHoursForm.control}
                              name="segunda.fechamento"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Fechamento</FormLabel>
                                  <FormControl>
                                    <TimeInput
                                      value={field.value || ""}
                                      onChange={field.onChange}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="space-y-2">
                            <FormField
                              control={workingHoursForm.control}
                              name="segunda.pausaInicio"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Início da Pausa</FormLabel>
                                  <FormControl>
                                    <TimeInput
                                      value={field.value || ""}
                                      onChange={field.onChange}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="space-y-2">
                            <FormField
                              control={workingHoursForm.control}
                              name="segunda.pausaFim"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Fim da Pausa</FormLabel>
                                  <FormControl>
                                    <TimeInput
                                      value={field.value || ""}
                                      onChange={field.onChange}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Terça-feira */}
                    {/* ... similar structure for other days ... */}

                    {/* Intervalo de Agendamento */}
                    <div className="rounded-md border p-4">
                      <FormField
                        control={workingHoursForm.control}
                        name="intervaloAgendamento"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Intervalo de Agendamento (minutos)</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o intervalo" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="15">15 minutos</SelectItem>
                                <SelectItem value="30">30 minutos</SelectItem>
                                <SelectItem value="45">45 minutos</SelectItem>
                                <SelectItem value="60">60 minutos</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Define o intervalo mínimo entre agendamentos
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Salvar Alterações
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Notificações</CardTitle>
              <CardDescription>
                Configure como e quando as notificações serão enviadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...notificationsForm}>
                <form onSubmit={notificationsForm.handleSubmit(onNotificationsSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-medium">Notificações de Confirmação</h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FormField
                        control={notificationsForm.control}
                        name="emailConfirmacao"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div>
                              <FormLabel>Email de Confirmação</FormLabel>
                              <FormDescription>
                                Enviar email de confirmação ao cliente
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={notificationsForm.control}
                        name="smsConfirmacao"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div>
                              <FormLabel>SMS de Confirmação</FormLabel>
                              <FormDescription>
                                Enviar SMS de confirmação ao cliente
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    <Separator className="my-4" />

                    <h3 className="font-medium">Notificações de Lembrete</h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FormField
                        control={notificationsForm.control}
                        name="emailLembrete"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div>
                              <FormLabel>Email de Lembrete</FormLabel>
                              <FormDescription>
                                Enviar email de lembrete ao cliente
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={notificationsForm.control}
                        name="smsLembrete"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div>
                              <FormLabel>SMS de Lembrete</FormLabel>
                              <FormDescription>
                                Enviar SMS de lembrete ao cliente
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={notificationsForm.control}
                      name="lembreteHoras"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tempo de Lembrete (horas)</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o tempo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="12">12 horas antes</SelectItem>
                              <SelectItem value="24">24 horas antes</SelectItem>
                              <SelectItem value="48">48 horas antes</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Quanto tempo antes do agendamento o lembrete será enviado
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Separator className="my-4" />

                    <h3 className="font-medium">Notificações de Cancelamento</h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FormField
                        control={notificationsForm.control}
                        name="emailCancelamento"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div>
                              <FormLabel>Email de Cancelamento</FormLabel>
                              <FormDescription>
                                Enviar email de cancelamento ao cliente
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={notificationsForm.control}
                        name="smsCancelamento"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div>
                              <FormLabel>SMS de Cancelamento</FormLabel>
                              <FormDescription>
                                Enviar SMS de cancelamento ao cliente
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Salvar Alterações
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Aparência</CardTitle>
              <CardDescription>
                Personalize a aparência do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ThemeSettings />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Database */}
        <TabsContent value="database">
          <Card>
            <CardHeader>
              <CardTitle>Banco de Dados</CardTitle>
              <CardDescription>
                Gerencie as configurações do banco de dados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div>
                <h3 className="text-lg font-medium mb-4">Tabelas Financeiras</h3>
                <SetupDatabase />
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium mb-4">Tabela de Produtos</h3>
                <SetupProductsTable />
                
                <div className="mt-4">
                  <Button onClick={setupProductsTable} variant="outline">
                    Configurar Tabela de Produtos Manualmente
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

