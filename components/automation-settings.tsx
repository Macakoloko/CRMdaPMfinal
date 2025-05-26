"use client"

import { useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const formSchema = z.object({
  birthdayEnabled: z.boolean(),
  birthdayMessage: z.string().min(10, {
    message: "A mensagem deve ter pelo menos 10 caracteres.",
  }),
  followUpEnabled: z.boolean(),
  followUpDays: z.string().min(1, {
    message: "Informe o número de dias.",
  }),
  followUpMessage: z.string().min(10, {
    message: "A mensagem deve ter pelo menos 10 caracteres.",
  }),
  feedbackEnabled: z.boolean(),
  feedbackMessage: z.string().min(10, {
    message: "A mensagem deve ter pelo menos 10 caracteres.",
  }),
})

// Valores padrão para as configurações
const defaultValues = {
  birthdayEnabled: true,
  birthdayMessage:
    "Feliz aniversário! 🎉 Como presente especial, oferecemos 15% de desconto em qualquer serviço este mês. Agende seu horário!",
  followUpEnabled: true,
  followUpDays: "7",
  followUpMessage:
    "Olá! Esperamos que tenha gostado do nosso atendimento. Quando podemos te ver novamente? Agende seu próximo horário!",
  feedbackEnabled: true,
  feedbackMessage:
    "Olá! Gostaríamos de saber como foi sua experiência conosco. Poderia nos dar um feedback? Sua opinião é muito importante!",
}

export function AutomationSettings() {
  // Usar uma anotação de tipo explícita para resolver o problema de tipo excessivamente profundo
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
  });
  
  // Carregar configurações do localStorage se existirem
  useEffect(() => {
    const savedSettings = localStorage.getItem('automationSettings')
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings)
        // Resetar o formulário com os valores salvos
        form.reset(parsedSettings)
      } catch (error) {
        console.error("Erro ao carregar configurações de automação:", error)
        // Em caso de erro, usar os valores padrão
        form.reset(defaultValues)
      }
    }
  }, [form])

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Salvar no localStorage
    localStorage.setItem('automationSettings', JSON.stringify(values))
    
    toast({
      title: "Configurações salvas",
      description: "As configurações de automação foram salvas com sucesso.",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Automação de Mensagens</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Mensagem de Aniversário</h3>

              <FormField
                control={form.control}
                name="birthdayEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Ativar mensagem de aniversário</FormLabel>
                      <FormDescription>Enviar automaticamente uma mensagem no aniversário do cliente</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="birthdayMessage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mensagem de Aniversário</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Digite a mensagem de aniversário" className="min-h-[100px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Mensagem de Retorno</h3>

              <FormField
                control={form.control}
                name="followUpEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Ativar mensagem de retorno</FormLabel>
                      <FormDescription>Enviar automaticamente uma mensagem após um período sem visitas</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="followUpDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dias após o último atendimento</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="followUpMessage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mensagem de Retorno</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Digite a mensagem de retorno" className="min-h-[100px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Solicitação de Feedback</h3>

              <FormField
                control={form.control}
                name="feedbackEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Ativar solicitação de feedback</FormLabel>
                      <FormDescription>
                        Enviar automaticamente uma mensagem solicitando feedback após o atendimento
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="feedbackMessage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mensagem de Feedback</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Digite a mensagem de solicitação de feedback"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full">
              Salvar Configurações
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

