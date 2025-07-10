'use client';

import { MainNav } from '@/components/main-nav';
import { UserProfileMenu } from '@/components/auth/user-profile-menu';
import { ModeToggle } from '@/components/theme-toggle';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Bell, Home, LineChart, Package, Package2, ShoppingCart, Users } from 'lucide-react'; // Example icons
import Link from 'next/link'; // Import Link
import { Button } from '@/components/ui/button'; // Import Button
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'; // Import Card components
import { Separator } from '@radix-ui/react-separator';
import { SidebarInset, SidebarProvider, SidebarTrigger, Sidebar } from '../ui/sidebar'; // Ensure Sidebar is imported
import React from 'react';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '../ui/breadcrumb';
import NotificationButton from '../noti/noti-button';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  const isAuthPage = pathname.startsWith('/auth/');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isAuthPage) {
    return (
      <div className="min-h-screen">
        <main className="flex-1">{children}</main>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar> {/* MainNav is now conceptually part of the Sidebar component from ui/sidebar */}
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Package2 className="h-6 w-6" />
              <span className="">Fitness Tracker</span>
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto">
            <MainNav />
          </div>
          <div className="mt-auto p-4">
            <div className="mt-4 flex flex-col space-y-2">
              <ModeToggle />
              {/* UserProfileMenu is removed from here, will be in the header */}
            </div>
          </div>
        </div>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          
          {/* Breadcrumb or other header content can go here */}

          <div className="ml-auto flex items-center gap-2"> {/* Container for items on the right */}
            <NotificationButton/>
            <UserProfileMenu /> {/* UserProfileMenu added here */}
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 overflow-y-auto"> {/* Added overflow-y-auto to main */}
          {children}
        </main>
        <footer className="border-t py-4 px-6 mt-auto bg-background">
            <div className="flex flex-col gap-2 text-center text-xs text-muted-foreground md:flex-row md:gap-4">
              <p>© {new Date().getFullYear()} Fitness Tracker. All rights reserved.</p> {/* Corrected "By ." */}
            </div>
          </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}

{/* <SidebarProvider>
      <MainNav />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                    <BreadcrumbItem className={index === 0 ? "hidden md:block" : ""}>
                      {crumb.href ? (
                        <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                      ) : (
                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                      )}
                    </BreadcrumbItem>
                    {index < breadcrumbs.length - 1 && <BreadcrumbSeparator className="hidden md:block" />}
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          )}
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
        <footer className="border-t py-4 px-6 mt-auto">
            <div className="flex flex-col gap-2 text-center text-xs text-muted-foreground md:flex-row md:gap-4">
              <p>© {new Date().getFullYear()} Fitness Tracker. All rights reserved.</p>
            </div>
          </footer>
      </SidebarInset>
    </SidebarProvider> */}