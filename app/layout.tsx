import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import AuthProvider from '@/components/auth/auth-provider'
import { Toaster } from '@/components/ui/toaster'
import { getServerSession } from 'next-auth'
import { authOptions } from './api/auth/[...nextauth]/route'


export const metadata: Metadata = {
  title: 'Fitness Tracker',
  description: 'Track your fitness and workouts with customizable exercises and timers',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await getServerSession(authOptions);
  // console.log('[RootLayout] Server-side session check:', {
  //   hasSession: !!session,
  //   userEmail: session?.user?.email,
  //   userId: session?.user?.id
  // });
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning={true}>
        <AuthProvider session={session}>
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
