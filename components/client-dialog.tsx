"use client"

import { useClients } from "@/context/ClientContext"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
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
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

// Interface para o cliente, correspondente à interface DialogClient no fechar-caixa-dialog
interface Client {
  id: string
  name: string
  phone: string
  initials: string
  status: string
  email?: string
  lastAppointment?: Date
}

// Schema para validação do formulário
const clientFormSchema = z.object({
  name: z.string().min(1, { message: "Nome é obrigatório" }),
  phone: z.string().min(1, { message: "Telefone é obrigatório" }),
  email: z.string().email({ message: "Email inválido" }).optional().or(z.literal("")),
})

type ClientFormValues = z.infer<typeof clientFormSchema>

interface ClientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onClientCreated?: (client: Client) => void
}

export function ClientDialog({ open, onOpenChange, onClientCreated }: ClientDialogProps) {
  const { addClient } = useClients()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Configurar o formulário
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
    },
  })
  
  // Função para submeter o formulário
  async function onSubmit(values: ClientFormValues) {
    setIsSubmitting(true)
    
    try {
      // Adicionar cliente
      const clientId = await addClient({
        name: values.name,
        phone: values.phone,
        email: values.email,
      })
      
      toast("Cliente adicionado com sucesso!")
      
      // Resetar o formulário
      form.reset()
      
      // Fechar o diálogo e notificar o componente pai
      if (onClientCreated) {
        onClientCreated({
          id: clientId,
          name: values.name,
          phone: values.phone,
          email: values.email,
          initials: values.name.split(' ').map(part => part[0]).join('').toUpperCase().substring(0, 2),
          status: "active",
        })
      } else {
        onOpenChange(false)
      }
    } catch (error) {
      console.error("Erro ao adicionar cliente:", error)
      toast("Erro ao adicionar cliente. Tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Novo Cliente</DialogTitle>
          <DialogDescription>
            Adicione um novo cliente rapidamente para o registro de serviço
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
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
                    <Input placeholder="+351 912345678" {...field} />
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
                    <Input type="email" placeholder="email@exemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Adicionar Cliente
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 