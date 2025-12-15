import "./globals.css"
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ToastContainer } from "@/components/ui/toast"
import { ToastProvider } from "@/components/ui/toast-provider"
import { AuthProvider } from "@/context/auth-context"

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'IntroEngine',
  description: 'AI-Powered Relationship Intelligence',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ToastProvider>
          <AuthProvider>
            {children}
            <ToastContainer />
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  )
}
