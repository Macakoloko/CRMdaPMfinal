import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface WhatsAppButtonProps {
  phoneNumber: string
  message?: string
  variant?: "default" | "outline" | "ghost" | "link" | "destructive" | "secondary"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  showTooltip?: boolean
  onClick?: () => void
}

export function WhatsAppButton({
  phoneNumber,
  message = "",
  variant = "default",
  size = "icon",
  className = "",
  showTooltip = true,
  onClick
}: WhatsAppButtonProps) {
  // Remover caracteres não numéricos do número de telefone
  const cleanPhone = phoneNumber?.replace(/\D/g, "")
  
  // Se o número não começar com +, adicionar o código do país (Portugal: +351)
  const formattedPhone = cleanPhone?.startsWith("351") 
    ? cleanPhone 
    : `351${cleanPhone}`
  
  // Criar URL do WhatsApp
  const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`
  
  // Função para lidar com o clique
  const handleClick = () => {
    if (onClick) {
      onClick()
      return
    }
    
    if (phoneNumber) {
      window.open(whatsappUrl, "_blank")
    }
  }
  
  const button = (
    <Button
      variant={variant}
      size={size}
      className={`bg-green-600 hover:bg-green-700 text-white ${className}`}
      onClick={handleClick}
    >
      <MessageCircle className="h-4 w-4" />
      {size !== "icon" && <span className="ml-2">WhatsApp</span>}
    </Button>
  )
  
  if (showTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {button}
          </TooltipTrigger>
          <TooltipContent>
            <p>Enviar mensagem via WhatsApp</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }
  
  return button
} 