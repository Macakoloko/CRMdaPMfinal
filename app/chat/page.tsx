import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ChatPage() {
  return (
    <div className="container mx-auto p-4 pb-20 flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-3xl text-center">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Chat Centralizado</CardTitle>
          <CardDescription>Sistema de comunicação integrado</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="bg-primary/10 border-primary">
            <AlertCircle className="h-5 w-5 text-primary" />
            <AlertTitle className="font-semibold text-lg">Em breve</AlertTitle>
            <AlertDescription>
              Nosso sistema de chat centralizado está em desenvolvimento e será disponibilizado em breve. 
              Fique atento às próximas atualizações!
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}

