'use server'
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import DashboardClient from './components/dashboard-client';

export default async function DashboardPage() {
  // Get session on server-side
  const session = await getServerSession(authOptions);
  
  console.log('[Dashboard] Server-side session check:', {
    hasSession: !!session,
    userEmail: session?.user?.email,
    userId: session?.user?.id
  });
  
  // Redirect if not authenticated - this happens server-side
  if (!session) {
    console.log('[Dashboard] No session found, redirecting to signin');
    redirect('/auth/signin');
  }

  // Pass session to client component - guaranteed to have session here
  return <DashboardClient session={session} />;
}
