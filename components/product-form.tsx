"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const formSchema = z.object({
  name: z.string().min(3, {
    message: "O nome deve ter pelo menos 3 caracteres.",
  }),
  price: z.string().min(1, {
    message: "O preço é obrigatório.",
  }),
  cost: z.string().min(1, {
    message: "O custo é obrigatório.",
  }),
  stock: z.string().min(1, {
    message: "O estoque é obrigatório.",
  }),
  minStock: z.string().min(1, {
    message: "O estoque mínimo é obrigatório.",
  }),
  category: z.string().min(1, {
    message: "A categoria é obrigatória.",
  }),
  brand: z.string().min(1, {
    message: "A marca é obrigatória.",
  }),
  description: z.string().optional(),
  barcode: z.string().optional(),
})

export function ProductForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      price: "",
      cost: "",
      stock: "0",
      minStock: "5",
      category: "",
      brand: "",
      description: "",
      barcode: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    toast({
      title: "Produto cadastrado",
      description: `${values.name} foi adicionado com sucesso.`,
    })
    form.reset()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cadastrar Novo Produto</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Produto</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do produto" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço de Venda (€)</FormLabel>
                    <FormControl>
                      <Input placeholder="0,00" type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custo (€)</FormLabel>
                    <FormControl>
                      <Input placeholder="0,00" type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estoque Atual</FormLabel>
                    <FormControl>
                      <Input placeholder="0" type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="minStock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estoque Mínimo</FormLabel>
                    <FormControl>
                      <Input placeholder="0" type="number" min="0" {...field} />
                    </FormControl>
                    <FormDescription>Alerta quando o estoque estiver abaixo deste valor</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="shampoo">Shampoo</SelectItem>
                        <SelectItem value="conditioner">Condicionador</SelectItem>
                        <SelectItem value="treatment">Tratamento</SelectItem>
                        <SelectItem value="styling">Finalização</SelectItem>
                        <SelectItem value="coloring">Coloração</SelectItem>
                        <SelectItem value="accessories">Acessórios</SelectItem>
                        <SelectItem value="other">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marca</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma marca" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="loreal">L'Oréal</SelectItem>
                        <SelectItem value="wella">Wella</SelectItem>
                        <SelectItem value="kerastase">Kérastase</SelectItem>
                        <SelectItem value="schwarzkopf">Schwarzkopf</SelectItem>
                        <SelectItem value="redken">Redken</SelectItem>
                        <SelectItem value="other">Outra</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição (opcional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descrição do produto" className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="barcode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código de Barras (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Código de barras" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              Cadastrar Produto
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

