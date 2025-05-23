"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Define form schema
const formSchema = z.object({
  name: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres" }),
  description: z.string().optional(),
  duration: z.coerce.number().min(5, { message: "Duração mínima é de 5 minutos" }),
  price: z.coerce.number().min(0, { message: "Preço não pode ser negativo" }),
  category: z.string().min(1, { message: "Categoria é obrigatória" }),
})

interface ServiceFormProps {
  onSuccess: () => void
  initialData?: z.infer<typeof formSchema>
}

export function ServiceForm({ onSuccess, initialData }: ServiceFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: "",
      description: "",
      duration: 30,
      price: 0,
      category: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    
    try {
      // Here you would normally save to database
      console.log("Service data:", values)
      
      toast({
        title: "Serviço salvo com sucesso",
        description: `${values.name} foi adicionado ao sistema.`,
      })
      
      onSuccess()
    } catch (error) {
      console.error("Error saving service:", error)
      toast({
        title: "Erro ao salvar serviço",
        description: "Ocorreu um erro ao salvar o serviço. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Nome do Serviço*</FormLabel>
                <FormControl>
                  <Input placeholder="Nome do serviço" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria*</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="haircut">Corte</SelectItem>
                    <SelectItem value="coloring">Coloração</SelectItem>
                    <SelectItem value="treatment">Tratamento</SelectItem>
                    <SelectItem value="styling">Finalização</SelectItem>
                    <SelectItem value="manicure">Manicure</SelectItem>
                    <SelectItem value="pedicure">Pedicure</SelectItem>
                    <SelectItem value="facial">Facial</SelectItem>
                    <SelectItem value="massage">Massagem</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preço (€)*</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0" 
                    step="0.01" 
                    placeholder="0.00" 
                    {...field} 
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duração (minutos)*</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="5" 
                    step="5" 
                    {...field} 
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 30)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Descrição</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Descrição do serviço (opcional)" 
                    className="resize-none" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : "Salvar Serviço"}
          </Button>
        </div>
      </form>
    </Form>
  )
}

