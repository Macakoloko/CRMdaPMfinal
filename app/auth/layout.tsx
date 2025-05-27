"use client"

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Renderiza diretamente as páginas de autenticação sem verificar usuário
  return (
    <div className="min-h-screen">
      {children}
    </div>
  )
} 