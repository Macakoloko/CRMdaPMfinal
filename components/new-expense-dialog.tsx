"use client"

import { ExpenseForm } from "@/components/expense-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface NewExpenseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NewExpenseDialog({ open, onOpenChange }: NewExpenseDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Despesa</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <ExpenseForm onSuccess={() => onOpenChange(false)} />
        </div>
      </DialogContent>
    </Dialog>
  )
} 