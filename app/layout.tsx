import type React from "react"
import type { Metadata } from "next"
import { Mona_Sans as FontSans } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/theme-provider"
import { SidebarNavigation, MobileSidebarNavigation } from "@/components/sidebar-navigation"
import { TopNavigation } from "@/components/top-navigation"
import { AppointmentProvider } from "@/context/AppointmentContext"
import { FinancialProvider } from "@/context/FinancialContext"
import { SupabaseProvider } from "@/context/SupabaseContext"
import { ProductsProvider } from "@/context/ProductsContext"
import { ClientProvider } from "@/context/ClientContext"
import { Toaster } from "sonner"

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "Beauty Salon CRM",
  description: "CRM system for beauty salons",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", fontSans.variable)} suppressHydrationWarning={true}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <SupabaseProvider>
            <AppointmentProvider>
              <FinancialProvider>
                <ProductsProvider>
                  <ClientProvider>
                    <div className="flex min-h-screen">
                      <SidebarNavigation />
                      <main className="flex-1 md:ml-64 pb-16 md:pb-0">
                        <TopNavigation />
                        {children}
                      </main>
                      <MobileSidebarNavigation />
                    </div>
                    <Toaster position="bottom-right" />
                  </ClientProvider>
                </ProductsProvider>
              </FinancialProvider>
            </AppointmentProvider>
          </SupabaseProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}