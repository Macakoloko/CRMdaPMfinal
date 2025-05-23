"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { IncomeForm } from "@/components/income-form"
import { ExpenseForm } from "@/components/expense-form"
import { FinancialReport } from "@/components/financial-report"
import { FinancialStatus } from "@/components/financial-status"
import { useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"

function FinancialPageContent() {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState("income")

  useEffect(() => {
    const tab = searchParams?.get("tab")
    if (tab === "income" || tab === "expense" || tab === "report") {
      setActiveTab(tab)
    }
  }, [searchParams])

  return (
    <div className="container mx-auto p-4 pb-20">
      <h1 className="mb-6 text-2xl font-bold">Financeiro</h1>

      <div className="mb-6">
        <FinancialStatus />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="income">Recebimentos</TabsTrigger>
          <TabsTrigger value="expense">Despesas</TabsTrigger>
          <TabsTrigger value="report">Relatório</TabsTrigger>
        </TabsList>

        <TabsContent value="income" className="mt-6">
          <IncomeForm />
        </TabsContent>

        <TabsContent value="expense" className="mt-6">
          <ExpenseForm />
        </TabsContent>

        <TabsContent value="report" className="mt-6">
          <FinancialReport />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default function FinancialPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <FinancialPageContent />
    </Suspense>
  )
}

