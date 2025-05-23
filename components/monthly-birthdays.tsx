import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { MessageSquare } from "lucide-react"

const birthdays = [
  {
    id: 1,
    name: "Ana Silva",
    date: "05/08",
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "AS",
  },
  {
    id: 2,
    name: "Carlos Oliveira",
    date: "12/08",
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "CO",
  },
  {
    id: 3,
    name: "Mariana Santos",
    date: "18/08",
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "MS",
  },
  {
    id: 4,
    name: "Roberto Almeida",
    date: "24/08",
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "RA",
  },
]

export function MonthlyBirthdays() {
  return (
    <div className="space-y-8">
      {birthdays.map((birthday) => (
        <div key={birthday.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src={birthday.avatar} alt={birthday.name} />
            <AvatarFallback>{birthday.initials}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{birthday.name}</p>
            <p className="text-sm text-muted-foreground">{birthday.date}</p>
          </div>
          <Button variant="ghost" size="icon" className="ml-auto" title="Enviar mensagem de aniversário">
            <MessageSquare className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  )
}

