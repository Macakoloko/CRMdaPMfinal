"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Phone, Video, Paperclip, Image, Smile } from "lucide-react"

type Message = {
  id: number
  sender: "client" | "me"
  content: string
  timestamp: string
  read: boolean
}

type Contact = {
  id: number
  name: string
  avatar: string
  initials: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  platform: "whatsapp" | "instagram"
}

const contacts: Contact[] = [
  {
    id: 1,
    name: "Ana Silva",
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "AS",
    lastMessage: "Olá, gostaria de agendar um horário para amanhã",
    lastMessageTime: "10:30",
    unreadCount: 2,
    platform: "whatsapp",
  },
  {
    id: 2,
    name: "Carlos Oliveira",
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "CO",
    lastMessage: "Obrigado pelo atendimento!",
    lastMessageTime: "Ontem",
    unreadCount: 0,
    platform: "whatsapp",
  },
  {
    id: 3,
    name: "Mariana Santos",
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "MS",
    lastMessage: "Qual o valor da coloração?",
    lastMessageTime: "09:15",
    unreadCount: 1,
    platform: "instagram",
  },
  {
    id: 4,
    name: "Roberto Almeida",
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "RA",
    lastMessage: "Vou chegar 10 minutos atrasado",
    lastMessageTime: "Ontem",
    unreadCount: 0,
    platform: "whatsapp",
  },
]

const conversationHistory: Record<number, Message[]> = {
  1: [
    {
      id: 1,
      sender: "client",
      content: "Olá, gostaria de agendar um horário para amanhã",
      timestamp: "10:30",
      read: true,
    },
    {
      id: 2,
      sender: "me",
      content: "Olá Ana! Tudo bem? Claro, temos horário disponível às 14h ou 16h. Qual prefere?",
      timestamp: "10:32",
      read: true,
    },
    {
      id: 3,
      sender: "client",
      content: "Prefiro às 14h, por favor",
      timestamp: "10:35",
      read: false,
    },
    {
      id: 4,
      sender: "client",
      content: "Será corte e escova",
      timestamp: "10:35",
      read: false,
    },
  ],
  3: [
    {
      id: 1,
      sender: "client",
      content: "Olá, vocês têm horário disponível para esta semana?",
      timestamp: "09:10",
      read: true,
    },
    {
      id: 2,
      sender: "me",
      content: "Bom dia, Mariana! Sim, temos horários na quinta e sexta. O que você precisa fazer?",
      timestamp: "09:12",
      read: true,
    },
    {
      id: 3,
      sender: "client",
      content: "Quero fazer uma coloração. Qual o valor?",
      timestamp: "09:15",
      read: false,
    },
  ],
}

export function UnifiedChat() {
  const [activeTab, setActiveTab] = useState<"all" | "whatsapp" | "instagram">("all")
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [newMessage, setNewMessage] = useState("")

  const filteredContacts = contacts.filter((contact) => activeTab === "all" || contact.platform === activeTab)

  const currentConversation = selectedContact ? conversationHistory[selectedContact.id] || [] : []

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedContact) return

    // In a real app, you would send this message to your backend
    console.log(`Sending message to ${selectedContact.name}: ${newMessage}`)

    // For demo purposes, we'll just add it to the local state
    const newId = currentConversation.length > 0 ? Math.max(...currentConversation.map((m) => m.id)) + 1 : 1

    const message: Message = {
      id: newId,
      sender: "me",
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      read: false,
    }

    conversationHistory[selectedContact.id] = [...currentConversation, message]

    setNewMessage("")
  }

  return (
    <div className="grid h-[calc(100vh-180px)] grid-cols-1 gap-4 md:grid-cols-3">
      <Card className="md:col-span-1">
        <CardContent className="p-4">
          <Tabs defaultValue="all" onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
              <TabsTrigger value="instagram">Instagram</TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[calc(100vh-280px)] pr-4">
              <div className="space-y-2 pt-4">
                {filteredContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className={`flex cursor-pointer items-center space-x-4 rounded-lg p-3 transition-colors ${
                      selectedContact?.id === contact.id ? "bg-primary/10" : "hover:bg-muted"
                    }`}
                    onClick={() => setSelectedContact(contact)}
                  >
                    <div className="relative">
                      <Avatar>
                        <AvatarImage src={contact.avatar} alt={contact.name} />
                        <AvatarFallback>{contact.initials}</AvatarFallback>
                      </Avatar>
                      {contact.platform === "whatsapp" ? (
                        <div className="absolute -bottom-1 -right-1 rounded-full bg-green-500 p-1" />
                      ) : (
                        <div className="absolute -bottom-1 -right-1 rounded-full bg-pink-500 p-1" />
                      )}
                      {contact.unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                          {contact.unreadCount}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{contact.name}</h4>
                        <span className="text-xs text-muted-foreground">{contact.lastMessageTime}</span>
                      </div>
                      <p className="truncate text-sm text-muted-foreground">{contact.lastMessage}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Tabs>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardContent className="flex h-full flex-col p-0">
          {selectedContact ? (
            <>
              <div className="flex items-center justify-between border-b p-4">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={selectedContact.avatar} alt={selectedContact.name} />
                    <AvatarFallback>{selectedContact.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{selectedContact.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {selectedContact.platform === "whatsapp" ? "WhatsApp" : "Instagram"}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="icon">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Video className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {currentConversation.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === "me" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-2 ${
                          message.sender === "me" ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}
                      >
                        <p>{message.content}</p>
                        <div
                          className={`mt-1 flex text-xs ${
                            message.sender === "me"
                              ? "justify-end text-primary-foreground/70"
                              : "justify-start text-muted-foreground"
                          }`}
                        >
                          {message.timestamp}
                          {message.sender === "me" && <span className="ml-1">{message.read ? "✓✓" : "✓"}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="border-t p-4">
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Image className="h-4 w-4" />
                  </Button>
                  <Input
                    placeholder="Digite sua mensagem..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSendMessage()
                      }
                    }}
                    className="flex-1"
                  />
                  <Button variant="ghost" size="icon">
                    <Smile className="h-4 w-4" />
                  </Button>
                  <Button size="icon" onClick={handleSendMessage}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center p-4">
              <div className="text-center">
                <h3 className="mb-2 text-xl font-medium">Selecione um contato</h3>
                <p className="text-muted-foreground">Escolha um contato para iniciar uma conversa</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

