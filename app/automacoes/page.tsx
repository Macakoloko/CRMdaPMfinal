import { AutomationList } from "@/components/automation-list"
import { AutomationForm } from "@/components/automation-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AutomationsPage() {
  return (
    <div className="container mx-auto p-4 pb-20">
      <h1 className="mb-6 text-2xl font-bold">Automações</h1>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">Automações Ativas</TabsTrigger>
          <TabsTrigger value="create">Nova Automação</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-6">
          <AutomationList />
        </TabsContent>

        <TabsContent value="create" className="mt-6">
          <AutomationForm />
        </TabsContent>
      </Tabs>
    </div>
  )
}

