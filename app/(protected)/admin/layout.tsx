'use client';

import { useAuth } from '@/lib/hooks/auth/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { isLoading, isAdmin } = useAuth({ adminRequired: true });
  const pathname = usePathname();
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-1/2" />
        <div className="grid gap-6 grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  // If not admin, middleware will redirect to unauthorized page
  if (!isAdmin) {
    return null;
  }
  
  // The sections available in admin area
  const sections = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Users', href: '/admin/users' },
    { label: 'Categories', href: '/admin/categories' },
    { label: 'Exercises', href: '/admin/exercises' },
    { label: 'Scheduled Exercises', href: '/admin/scheduled-exercises' }
  ];

  return (
    <div className="space-y-6">
      <nav className="flex overflow-auto pb-2">
        <div className="flex space-x-1 p-1">
          {sections.map((section) => {
            const isActive = 
              pathname && (
                section.href === '/admin' 
                  ? pathname === '/admin'
                  : pathname.startsWith(section.href)
              );
                
            return (
              <Link
                key={section.href}
                href={section.href}
                className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground/60 hover:text-foreground/80 hover:bg-muted'
                }`}
              >
                {section.label}
              </Link>
            );
          })}
        </div>
      </nav>
      
      {children}
    </div>
  );
}
