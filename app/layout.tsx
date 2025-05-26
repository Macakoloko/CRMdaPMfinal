import type React from "react"
import type { Metadata } from "next"
import { Mona_Sans as FontSans } from "next/font/google"
import "./globals.css"
// Uncomment this line if needed
// import "../styles/globals.css"
import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/theme-provider"
import { SidebarNavigation, MobileSidebarNavigation } from "@/components/sidebar-navigation"
import { TopNavigation } from "@/components/top-navigation"
import { AppointmentProvider } from "@/context/AppointmentContext"
import { FinancialProvider } from "@/context/FinancialContext"
import { SupabaseProvider } from "@/context/SupabaseContext"
import { AuthProvider } from "@/context/AuthContext"
import { ProductsProvider } from "@/context/ProductsContext"
import { ClientProvider } from "@/context/ClientContext"
import { Toaster } from "sonner"

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "CRM - SALÃO",
  description: "Sistema CRM para salões de beleza",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={cn("min-h-screen bg-background font-sans antialiased", fontSans.variable)} suppressHydrationWarning={true}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <SupabaseProvider>
            <AuthProvider>
              <AppointmentProvider>
                <FinancialProvider>
                  <ProductsProvider>
                    <ClientProvider>
                      {children}
                      <Toaster position="bottom-right" />
                    </ClientProvider>
                  </ProductsProvider>
                </FinancialProvider>
              </AppointmentProvider>
            </AuthProvider>
          </SupabaseProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}