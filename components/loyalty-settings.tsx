"use client"

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
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const formSchema = z.object({
  enabled: z.boolean(),
  requiredServices: z.string().min(1, {
    message: "Informe o número de serviços necessários.",
  }),
  rewardType: z.string().min(1, {
    message: "Selecione o tipo de recompensa.",
  }),
  rewardService: z.string().optional(),
  discountPercentage: z.string().optional(),
  notificationMessage: z.string().min(10, {
    message: "A mensagem deve ter pelo menos 10 caracteres.",
  }),
  expirationDays: z.string().min(1, {
    message: "Informe o número de dias para expiração.",
  }),
})

export function LoyaltySettings() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      enabled: true,
      requiredServices: "10",
      rewardType: "service",
      rewardService: "haircut",
      discountPercentage: "50",
      notificationMessage:
        "Parabéns! Você atingiu 10 serviços e ganhou um serviço gratuito. Agende seu horário e aproveite sua recompensa!",
      expirationDays: "90",
    },
  })

  const watchRewardType = form.watch("rewardType")

  function onSubmit(values: z.infer<typeof formSchema>) {
    toast({
      title: "Configurações salvas",
      description: "As configurações do clube de fidelidade foram salvas com sucesso.",
    })
    console.log(values)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Clube de Fidelidade</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Ativar Clube de Fidelidade</FormLabel>
                    <FormDescription>
                      Recompense seus clientes fiéis após um número determinado de serviços
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Configurações de Recompensa</h3>

              <FormField
                control={form.control}
                name="requiredServices"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de serviços necessários</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormDescription>
                      Quantidade de serviços que o cliente precisa realizar para ganhar a recompensa
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rewardType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Recompensa</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo de recompensa" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="service">Serviço Gratuito</SelectItem>
                        <SelectItem value="discount">Desconto</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {watchRewardType === "service" && (
                <FormField
                  control={form.control}
                  name="rewardService"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Serviço Oferecido</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o serviço" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="haircut">Corte de Cabelo</SelectItem>
                          <SelectItem value="manicure">Manicure</SelectItem>
                          <SelectItem value="pedicure">Pedicure</SelectItem>
                          <SelectItem value="anyservice">Qualquer Serviço</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {watchRewardType === "discount" && (
                <FormField
                  control={form.control}
                  name="discountPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Porcentagem de Desconto</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" max="100" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="expirationDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dias para expiração da recompensa</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormDescription>Número de dias que o cliente tem para utilizar a recompensa</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Notificação</h3>

              <FormField
                control={form.control}
                name="notificationMessage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mensagem de Notificação</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Digite a mensagem que será enviada quando o cliente atingir o número de serviços"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Esta mensagem será enviada automaticamente quando o cliente atingir o número de serviços
                      necessários
                    </FormDescription>
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

