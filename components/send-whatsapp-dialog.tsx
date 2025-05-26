import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Check, MessageCircle, Loader2 } from "lucide-react"
import { WhatsAppButton } from "@/components/whatsapp-button"
import { toast } from "sonner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Client } from "@/context/ClientContext"

// Interface para automação
interface Automation {
  id: number
  name: string
  type: string
  trigger: string
  timeValue: string
  timeUnit: string
  active: boolean
  lastRun: string
  sentCount: number
  messageTemplate?: string
}

interface SendWhatsAppDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  automation: Automation
  clients: Client[]
  personalizeMessage: (message: string, client: Client) => string
  onComplete?: () => void
}

export function SendWhatsAppDialog({
  open,
  onOpenChange,
  automation,
  clients,
  personalizeMessage,
  onComplete
}: SendWhatsAppDialogProps) {
  const [selectedClients, setSelectedClients] = useState<{ [key: string]: boolean }>({})
  const [currentIndex, setCurrentIndex] = useState<number>(-1)
  const [processingClients, setProcessingClients] = useState<boolean>(false)
  const [completedClients, setCompletedClients] = useState<{ [key: string]: boolean }>({})
  
  // Seleciona/deseleciona todos os clientes
  const toggleAllClients = (checked: boolean) => {
    const newSelectedClients = {...selectedClients}
    clients.forEach(client => {
      newSelectedClients[client.id] = checked
    })
    setSelectedClients(newSelectedClients)
  }
  
  // Seleciona/deseleciona um cliente específico
  const toggleClient = (clientId: string, checked: boolean) => {
    setSelectedClients(prev => ({
      ...prev,
      [clientId]: checked
    }))
  }
  
  // Iniciar o processo de envio sequencial
  const startSendingMessages = () => {
    const selectedClientIds = Object.keys(selectedClients).filter(id => selectedClients[id])
    if (selectedClientIds.length === 0) {
      toast.error("Selecione pelo menos um cliente para enviar mensagem")
      return
    }
    
    setProcessingClients(true)
    setCurrentIndex(0)
  }
  
  // Marca o cliente atual como processado e avança para o próximo
  const markCurrentClientAsProcessed = () => {
    const selectedClientIds = Object.keys(selectedClients).filter(id => selectedClients[id])
    if (currentIndex >= 0 && currentIndex < selectedClientIds.length) {
      const clientId = selectedClientIds[currentIndex]
      setCompletedClients(prev => ({
        ...prev,
        [clientId]: true
      }))
      
      // Avança para o próximo cliente
      if (currentIndex < selectedClientIds.length - 1) {
        setCurrentIndex(currentIndex + 1)
      } else {
        // Finalizou todos os clientes
        setProcessingClients(false)
        setCurrentIndex(-1)
        toast.success(`Processo de envio finalizado para ${selectedClientIds.length} clientes`)
        
        // Atualizar a contagem de envios da automação
        if (onComplete) onComplete()
      }
    }
  }
  
  // Cliente atual sendo processado
  const getCurrentClient = () => {
    if (currentIndex < 0) return null
    
    const selectedClientIds = Object.keys(selectedClients).filter(id => selectedClients[id])
    if (currentIndex >= selectedClientIds.length) return null
    
    const clientId = selectedClientIds[currentIndex]
    return clients.find(c => c.id === clientId) || null
  }
  
  // Reinicia o estado quando o modal é fechado
  useEffect(() => {
    if (!open) {
      setSelectedClients({})
      setCurrentIndex(-1)
      setProcessingClients(false)
      setCompletedClients({})
    }
  }, [open])
  
  // O cliente que está sendo processado atualmente
  const currentClient = getCurrentClient()
  
  // Contagem de clientes selecionados
  const selectedCount = Object.values(selectedClients).filter(Boolean).length
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Enviar mensagens de WhatsApp</DialogTitle>
          <DialogDescription>
            Automação: <strong>{automation.name}</strong>
          </DialogDescription>
        </DialogHeader>
        
        {!processingClients ? (
          <>
            <div className="py-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="selectAll" 
                    checked={clients.length > 0 && selectedCount === clients.length}
                    onCheckedChange={(checked) => toggleAllClients(!!checked)}
                  />
                  <label htmlFor="selectAll" className="text-sm font-medium">
                    Selecionar todos os clientes
                  </label>
                </div>
                <span className="text-sm text-muted-foreground">
                  {selectedCount} de {clients.length} clientes selecionados
                </span>
              </div>
              
              <ScrollArea className="h-[300px] border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Telefone</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                          Nenhum cliente disponível para envio
                        </TableCell>
                      </TableRow>
                    ) : (
                      clients.map((client) => (
                        <TableRow key={client.id}>
                          <TableCell>
                            <Checkbox 
                              checked={!!selectedClients[client.id]}
                              onCheckedChange={(checked) => toggleClient(client.id, !!checked)}
                            />
                          </TableCell>
                          <TableCell>{client.name}</TableCell>
                          <TableCell>{client.phone || "Sem telefone"}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
              
              <div className="mt-4 p-3 bg-muted rounded-md">
                <p className="text-sm font-medium mb-2">Mensagem a ser enviada:</p>
                <p className="text-sm whitespace-pre-line">{automation.messageTemplate || ""}</p>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button 
                onClick={startSendingMessages}
                disabled={selectedCount === 0}
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Iniciar envio ({selectedCount})
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="py-4 flex flex-col items-center">
              {currentClient ? (
                <>
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-medium mb-2">Enviando para:</h3>
                    <div className="text-xl font-bold">{currentClient.name}</div>
                    <div className="text-muted-foreground">{currentClient.phone}</div>
                    
                    <div className="mt-8 space-y-4">
                      <p className="text-sm">
                        Cliente {currentIndex + 1} de {selectedCount}
                      </p>
                      
                      <WhatsAppButton
                        phoneNumber={currentClient.phone || ""}
                        message={personalizeMessage(automation.messageTemplate || "", currentClient)}
                        size="default"
                        showTooltip={false}
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-3 mt-4">
                    <Button 
                      variant="outline"
                      onClick={() => {
                        markCurrentClientAsProcessed()
                      }}
                    >
                      Pular cliente
                    </Button>
                    
                    <Button 
                      onClick={() => {
                        markCurrentClientAsProcessed()
                      }}
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Marcar como enviado
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                  <p>Processando mensagens...</p>
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
} 