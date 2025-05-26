"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Save, Loader2, Database, Settings2, Clock, BellRing, Palette, Trash2, RefreshCw, Download, Upload, AlertTriangle } from "lucide-react"
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
import { SupabaseStatus } from "@/components/supabase-status"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

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

  // Função para limpar todos os dados do localStorage
  const clearAllData = () => {
    localStorage.clear();
    toast.success("Todos os dados foram limpos com sucesso!");
    // Redirecionar para recarregar a página
    window.location.href = '/configuracoes';
  };
  
  // Função para carregar dados de exemplo
  const loadExampleData = () => {
    // Automações de exemplo
    const exampleAutomations = [
      {
        id: 1,
        name: "Lembrete de Agendamento",
        type: "reminder",
        trigger: "before_appointment",
        timeValue: "1",
        timeUnit: "days",
        active: true,
        lastRun: new Date().toISOString(),
        sentCount: 0,
        messageTemplate: "Olá {nome}, lembre-se do seu agendamento amanhã! Estamos esperando por você."
      },
      {
        id: 2,
        name: "Agradecimento Pós-Atendimento",
        type: "message",
        trigger: "after_appointment",
        timeValue: "2",
        timeUnit: "hours",
        active: true,
        lastRun: new Date().toISOString(),
        sentCount: 0,
        messageTemplate: "Olá {nome}, obrigado por nos visitar hoje! Esperamos que tenha gostado do atendimento."
      },
      {
        id: 3,
        name: "Feliz Aniversário",
        type: "message",
        trigger: "birthday",
        timeValue: "0",
        timeUnit: "days",
        active: true,
        lastRun: new Date().toISOString(),
        sentCount: 0,
        messageTemplate: "Feliz aniversário, {nome}! Desejamos um dia maravilhoso e queremos celebrar com você oferecendo 10% de desconto em nossos serviços este mês."
      }
    ];
    
    // Configurações de automação de exemplo
    const exampleAutomationSettings = {
      birthdayEnabled: true,
      birthdayMessage: "Feliz aniversário! 🎉 Como presente especial, oferecemos 15% de desconto em qualquer serviço este mês. Agende seu horário!",
      followUpEnabled: true,
      followUpDays: "7",
      followUpMessage: "Olá! Esperamos que tenha gostado do nosso atendimento. Quando podemos te ver novamente? Agende seu próximo horário!",
      feedbackEnabled: true,
      feedbackMessage: "Olá! Gostaríamos de saber como foi sua experiência conosco. Poderia nos dar um feedback? Sua opinião é muito importante!"
    };
    
    // Guardar dados de exemplo no localStorage
    localStorage.setItem('automations', JSON.stringify(exampleAutomations));
    localStorage.setItem('automationSettings', JSON.stringify(exampleAutomationSettings));
    localStorage.setItem('businessInfo', JSON.stringify(mockBusinessData));
    localStorage.setItem('workingHours', JSON.stringify(mockWorkingHours));
    localStorage.setItem('notifications', JSON.stringify(mockNotifications));
    
    toast.success("Dados de exemplo carregados com sucesso!");
    // Redirecionar para recarregar a página
    window.location.href = '/configuracoes';
  };

  return (
    <div className="container mx-auto p-4 pb-24">
      <h1 className="mb-6 text-2xl font-bold">Configurações</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-6">
          <TabsTrigger value="business">Empresa</TabsTrigger>
          <TabsTrigger value="hours">Horários</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="appearance">Aparência</TabsTrigger>
          <TabsTrigger value="database">Banco de Dados</TabsTrigger>
        </TabsList>

        <TabsContent value="business" className="mt-0">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Informações da Empresa</CardTitle>
              <CardDescription>
                Atualize as informações básicas do seu negócio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...businessForm}>
                <form onSubmit={businessForm.handleSubmit(onBusinessSubmit)} id="business-form" className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={businessForm.control}
                      name="nome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome da Empresa</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome da sua empresa" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={businessForm.control}
                      name="telefone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone</FormLabel>
                          <FormControl>
                            <Input placeholder="+351 900 000 000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={businessForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="seu@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={businessForm.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website</FormLabel>
                          <FormControl>
                            <Input placeholder="www.seusite.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <FormField
                      control={businessForm.control}
                      name="endereco"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Endereço</FormLabel>
                          <FormControl>
                            <Input placeholder="Rua, número" {...field} />
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
                            <Input placeholder="0000-000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={businessForm.control}
                      name="cidade"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cidade</FormLabel>
                          <FormControl>
                            <Input placeholder="Sua cidade" {...field} />
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
                            <Input placeholder="Seu NIF" {...field} />
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
                            placeholder="Descreva sua empresa" 
                            className="resize-none" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button 
                type="submit" 
                form="business-form"
                disabled={isSubmitting}
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Salvar Alterações
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="hours">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Horário de Funcionamento</CardTitle>
              <CardDescription>
                Configure os horários de funcionamento do seu negócio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...workingHoursForm}>
                <form onSubmit={workingHoursForm.handleSubmit(onWorkingHoursSubmit)} id="hours-form" className="space-y-6">
                  <div>
                    <h3 className="mb-4 text-lg font-medium">Horários por Dia da Semana</h3>
                    <div className="space-y-6">
                      {['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'].map((day) => (
                        <div key={day} className="rounded-lg border p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-medium capitalize">
                              {day === 'segunda' ? 'Segunda-feira' : 
                              day === 'terca' ? 'Terça-feira' : 
                              day === 'quarta' ? 'Quarta-feira' : 
                              day === 'quinta' ? 'Quinta-feira' : 
                              day === 'sexta' ? 'Sexta-feira' : 
                              day === 'sabado' ? 'Sábado' : 'Domingo'}
                            </h4>
                            <FormField
                              control={workingHoursForm.control}
                              name={`${day}.aberto` as any}
                              render={({ field }) => (
                                <FormItem className="flex items-center space-x-2 space-y-0">
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
                          
                          {workingHoursForm.watch(`${day}.aberto` as any) && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="grid grid-cols-2 gap-2">
                                <FormField
                                  control={workingHoursForm.control}
                                  name={`${day}.abertura` as any}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Abertura</FormLabel>
                                      <FormControl>
                                        <TimeInput 
                                          value={field.value || ''} 
                                          onChange={field.onChange}
                                          placeholder="HH:MM"
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={workingHoursForm.control}
                                  name={`${day}.fechamento` as any}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Fechamento</FormLabel>
                                      <FormControl>
                                        <TimeInput 
                                          value={field.value || ''} 
                                          onChange={field.onChange}
                                          placeholder="HH:MM"
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                              
                              <div className="grid grid-cols-2 gap-2">
                                <FormField
                                  control={workingHoursForm.control}
                                  name={`${day}.pausaInicio` as any}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Início de Pausa</FormLabel>
                                      <FormControl>
                                        <TimeInput 
                                          value={field.value || ''} 
                                          onChange={field.onChange}
                                          placeholder="HH:MM"
                                        />
                                      </FormControl>
                                      <FormDescription className="text-xs">
                                        Opcional
                                      </FormDescription>
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={workingHoursForm.control}
                                  name={`${day}.pausaFim` as any}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Fim de Pausa</FormLabel>
                                      <FormControl>
                                        <TimeInput 
                                          value={field.value || ''} 
                                          onChange={field.onChange}
                                          placeholder="HH:MM"
                                        />
                                      </FormControl>
                                      <FormDescription className="text-xs">
                                        Opcional
                                      </FormDescription>
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="max-w-md">
                    <h3 className="mb-4 text-lg font-medium">Configurações de Agendamento</h3>
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
                                <SelectValue placeholder="Selecione um intervalo" />
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
                            Este é o intervalo mínimo entre agendamentos.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button 
                type="submit" 
                form="hours-form"
                disabled={isSubmitting}
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Salvar Alterações
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Configurações de Notificações</CardTitle>
              <CardDescription>
                Gerencie como e quando as notificações são enviadas aos clientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...notificationsForm}>
                <form onSubmit={notificationsForm.handleSubmit(onNotificationsSubmit)} id="notifications-form" className="space-y-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-4 text-lg font-medium">Confirmação de Agendamento</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Card className="border bg-card/50">
                          <CardContent className="pt-6">
                            <FormField
                              control={notificationsForm.control}
                              name="emailConfirmacao"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-2">
                                  <FormControl>
                                    <Switch
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel>Email de Confirmação</FormLabel>
                                    <FormDescription>
                                      Enviar email de confirmação após um novo agendamento
                                    </FormDescription>
                                  </div>
                                </FormItem>
                              )}
                            />
                          </CardContent>
                        </Card>
                        
                        <Card className="border bg-card/50">
                          <CardContent className="pt-6">
                            <FormField
                              control={notificationsForm.control}
                              name="smsConfirmacao"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-2">
                                  <FormControl>
                                    <Switch
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel>SMS de Confirmação</FormLabel>
                                    <FormDescription>
                                      Enviar SMS de confirmação após um novo agendamento
                                    </FormDescription>
                                  </div>
                                </FormItem>
                              )}
                            />
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="mb-4 text-lg font-medium">Lembretes</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Card className="border bg-card/50">
                          <CardContent className="pt-6">
                            <FormField
                              control={notificationsForm.control}
                              name="emailLembrete"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-2">
                                  <FormControl>
                                    <Switch
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel>Email de Lembrete</FormLabel>
                                    <FormDescription>
                                      Enviar lembrete por email antes do agendamento
                                    </FormDescription>
                                  </div>
                                </FormItem>
                              )}
                            />
                          </CardContent>
                        </Card>
                        
                        <Card className="border bg-card/50">
                          <CardContent className="pt-6">
                            <FormField
                              control={notificationsForm.control}
                              name="smsLembrete"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-2">
                                  <FormControl>
                                    <Switch
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel>SMS de Lembrete</FormLabel>
                                    <FormDescription>
                                      Enviar lembrete por SMS antes do agendamento
                                    </FormDescription>
                                  </div>
                                </FormItem>
                              )}
                            />
                          </CardContent>
                        </Card>
                      </div>
                      
                      <div className="mt-4">
                        <FormField
                          control={notificationsForm.control}
                          name="lembreteHoras"
                          render={({ field }) => (
                            <FormItem className="max-w-xs">
                              <FormLabel>Tempo de Antecedência para Lembretes (horas)</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione um tempo" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="2">2 horas antes</SelectItem>
                                  <SelectItem value="6">6 horas antes</SelectItem>
                                  <SelectItem value="12">12 horas antes</SelectItem>
                                  <SelectItem value="24">24 horas antes</SelectItem>
                                  <SelectItem value="48">48 horas antes</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Quanto tempo antes enviar os lembretes.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="mb-4 text-lg font-medium">Cancelamentos</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Card className="border bg-card/50">
                          <CardContent className="pt-6">
                            <FormField
                              control={notificationsForm.control}
                              name="emailCancelamento"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-2">
                                  <FormControl>
                                    <Switch
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel>Email de Cancelamento</FormLabel>
                                    <FormDescription>
                                      Notificar por email quando um agendamento for cancelado
                                    </FormDescription>
                                  </div>
                                </FormItem>
                              )}
                            />
                          </CardContent>
                        </Card>
                        
                        <Card className="border bg-card/50">
                          <CardContent className="pt-6">
                            <FormField
                              control={notificationsForm.control}
                              name="smsCancelamento"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-2">
                                  <FormControl>
                                    <Switch
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel>SMS de Cancelamento</FormLabel>
                                    <FormDescription>
                                      Notificar por SMS quando um agendamento for cancelado
                                    </FormDescription>
                                  </div>
                                </FormItem>
                              )}
                            />
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </div>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button 
                type="submit" 
                form="notifications-form"
                disabled={isSubmitting}
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Salvar Alterações
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card className="border-none shadow-md">
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

        <TabsContent value="database">
          <div className="grid gap-6">
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle>Status do Banco de Dados</CardTitle>
                <CardDescription>
                  Verifique a conexão com o Supabase e o status das tabelas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SupabaseStatus />
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle>Configuração do Banco de Dados</CardTitle>
                <CardDescription>
                  Ferramentas para configurar e manter o banco de dados
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <SetupDatabase />
                <Separator />
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">Configuração de Tabelas</h3>
                    <p className="text-sm text-muted-foreground">
                      Configure tabelas específicas do sistema
                    </p>
                  </div>
                  <SetupProductsTable />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Seção de gerenciamento de dados */}
      <div className="mt-12">
        <h2 className="text-xl font-bold mb-4">Gerenciamento de Dados</h2>
        <Separator className="my-4" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card para limpar dados */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trash2 className="mr-2 h-5 w-5 text-destructive" />
                Limpar Dados
              </CardTitle>
              <CardDescription>
                Remove todos os dados armazenados localmente, incluindo automações, configurações e preferências.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Esta ação irá limpar todos os dados armazenados no navegador. Esta ação não pode ser desfeita.
              </p>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Limpar Todos os Dados
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center">
                      <AlertTriangle className="mr-2 h-5 w-5 text-destructive" />
                      Tem certeza?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação irá remover permanentemente todos os dados armazenados localmente, incluindo automações,
                      configurações de empresa, horários e preferências. Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={clearAllData} className="bg-destructive text-destructive-foreground">
                      Sim, limpar tudo
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
          
          {/* Card para carregar exemplos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Download className="mr-2 h-5 w-5 text-primary" />
                Carregar Dados de Exemplo
              </CardTitle>
              <CardDescription>
                Carrega dados de exemplo pré-configurados para automações, configurações e preferências.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Esta ação irá carregar dados de exemplo para ajudar você a visualizar como o sistema funciona. 
                Quaisquer dados existentes serão substituídos.
              </p>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="default" className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Carregar Exemplos
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Carregar Dados de Exemplo</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação irá substituir quaisquer dados existentes por dados de exemplo pré-configurados.
                      Deseja continuar?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={loadExampleData}>
                      Sim, carregar exemplos
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="mr-2 h-5 w-5" />
                Exportar/Importar Dados
              </CardTitle>
              <CardDescription>
                Faça backup dos seus dados ou restaure a partir de um arquivo de backup.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <Button variant="outline" className="flex-1">
                  <Download className="mr-2 h-4 w-4" />
                  Exportar Dados
                </Button>
                <Button variant="outline" className="flex-1">
                  <Upload className="mr-2 h-4 w-4" />
                  Importar Dados
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

