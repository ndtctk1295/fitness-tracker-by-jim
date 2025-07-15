import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { SessionProvider } from 'next-auth/react'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

import { Toaster } from '@/components/ui/toaster'
import { auth } from '@/auth'

export const metadata: Metadata = {
  title: 'Fitness Tracker',
  description: 'Track your fitness and workouts with customizable exercises and timers',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth();
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning={true}>
        <SessionProvider session={session}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >


              {children}
              <Toaster />


          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
