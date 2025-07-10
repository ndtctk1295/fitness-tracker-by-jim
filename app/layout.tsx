import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import AuthProvider from '@/components/auth/auth-provider'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

import { Toaster } from '@/components/ui/toaster'

export const metadata: Metadata = {
  title: 'Fitness Tracker',
  description: 'Track your fitness and workouts with customizable exercises and timers',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning={true}>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >


              {children}
              <Toaster />


          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
