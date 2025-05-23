"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const formSchema = z.object({
  name: z.string().min(3, {
    message: "O nome deve ter pelo menos 3 caracteres.",
  }),
  type: z.string().min(1, {
    message: "O tipo é obrigatório.",
  }),
  trigger: z.string().min(1, {
    message: "O gatilho é obrigatório.",
  }),
  active: z.boolean().default(true),
  message: z.string().min(10, {
    message: "A mensagem deve ter pelo menos 10 caracteres.",
  }),
  timeValue: z.string().min(1, {
    message: "O valor de tempo é obrigatório.",
  }),
  timeUnit: z.string().min(1, {
    message: "A unidade de tempo é obrigatória.",
  }),
  sendTo: z.string().min(1, {
    message: "O destinatário é obrigatório.",
  }),
  conditions: z.string().optional(),
})

export function AutomationForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "",
      trigger: "",
      active: true,
      message: "",
      timeValue: "1",
      timeUnit: "days",
      sendTo: "all",
      conditions: "",
    },
  })

  const watchType = form.watch("type")
  const watchTrigger = form.watch("trigger")

  function onSubmit(values: z.infer<typeof formSchema>) {
    toast({
      title: "Automação criada",
      description: `A automação "${values.name}" foi criada com sucesso.`,
    })
    console.log(values)
    form.reset()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nova Automação</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Automação</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Lembrete de Retorno" {...field} />
                  </FormControl>
                  <FormDescription>Um nome descritivo para identificar esta automação</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Automação</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="message">Mensagem</SelectItem>
                        <SelectItem value="reminder">Lembrete</SelectItem>
                        <SelectItem value="promotion">Promoção</SelectItem>
                        <SelectItem value="followup">Acompanhamento</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="trigger"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gatilho</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um gatilho" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="after_appointment">Após Atendimento</SelectItem>
                        <SelectItem value="before_appointment">Antes do Atendimento</SelectItem>
                        <SelectItem value="no_show">Não Comparecimento</SelectItem>
                        <SelectItem value="birthday">Aniversário</SelectItem>
                        <SelectItem value="inactivity">Inatividade</SelectItem>
                        <SelectItem value="low_stock">Estoque Baixo</SelectItem>
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
                name="timeValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tempo</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timeUnit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidade</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma unidade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="minutes">Minutos</SelectItem>
                        <SelectItem value="hours">Horas</SelectItem>
                        <SelectItem value="days">Dias</SelectItem>
                        <SelectItem value="weeks">Semanas</SelectItem>
                        <SelectItem value="months">Meses</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sendTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Enviar Para</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione destinatários" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="all">Todos os Clientes</SelectItem>
                        <SelectItem value="active">Clientes Ativos</SelectItem>
                        <SelectItem value="inactive">Clientes Inativos</SelectItem>
                        <SelectItem value="specific">Clientes Específicos</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mensagem</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Digite a mensagem que será enviada" className="min-h-[120px]" {...field} />
                  </FormControl>
                  <FormDescription>
                    Você pode usar variáveis como {"{nome}"}, {"{data}"}, {"{serviço}"} que serão substituídas
                    automaticamente
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {(watchType === "promotion" || watchTrigger === "inactivity") && (
              <FormField
                control={form.control}
                name="conditions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Condições Adicionais</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ex: Clientes que não visitam há mais de 3 meses"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Ativar Automação</FormLabel>
                    <FormDescription>A automação começará a funcionar imediatamente após ser criada</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              Criar Automação
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

