"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Calendar, Clock, Dumbbell, FolderOpen, ListChecks, Settings, Shield, Timer, User, Weight, Home, Bell, Package2, History, CalendarDays } from "lucide-react"
import { useSession } from 'next-auth/react'
import { SidebarMenuButton, Sidebar, SidebarContent, SidebarMenu, SidebarHeader, useSidebar } from "./ui/sidebar"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useWeightStore } from "@/lib/stores/weight-store"

export function MainNav() {
  const pathname = usePathname()
  const { weightUnit } = useWeightStore()
  const { data: session } = useSession()
  const { setOpenMobile, isMobile } = useSidebar()

  // Function to handle navigation and close sidebar on mobile
  const handleNavigation = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  const routes = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: <Home className="h-5 w-5 mr-2" />,
      active: pathname === "/dashboard",
    },
    {
      href: "/calendar",
      label: "Calendar",
      icon: <Calendar className="h-5 w-5 mr-2" />,
      active: pathname === "/calendar",
    },
    {
      href: "/timer",
      label: "Timer",
      icon: <Clock className="h-5 w-5 mr-2" />,
      active: pathname === "/timer",
    },
    {
      href: "/timer-strategies",
      label: "Timer Strategies",
      icon: <ListChecks className="h-5 w-5 mr-2" />,
      active: pathname === "/timer-strategies",
    },
    {
      href: "/history",
      label: "History",
      icon: <History className="h-5 w-5 mr-2" />,
      active: pathname === "/history",
    },
    // {
    //   href: "/categories",
    //   label: "Categories",
    //   icon: <FolderOpen className="h-5 w-5 mr-2" />,
    //   active: pathname === "/categories",
    // },
    {
      href: "/exercises",
      label: "Exercises",
      icon: <Dumbbell className="h-5 w-5 mr-2" />,
      active: pathname === "/exercises",
    },
    {
      href: "/workout-plans",
      label: "Workout Plans",
      icon: <CalendarDays className="h-5 w-5 mr-2" />,
      active: pathname.startsWith("/workout-plans"),
    },
    {
      href: "/weights",
      label: `Weights (${weightUnit})`,
      icon: <Weight className="h-5 w-5 mr-2" />,
      active: pathname === "/weights",
    },
    {
      href: "/profile",
      label: "Profile",
      icon: <User className="h-5 w-5 mr-2" />,
      active: pathname === "/profile",
    },
    {
      href: "/settings",
      label: "Settings",
      icon: <Settings className="h-5 w-5 mr-2" />,
      active: pathname === "/settings",
    },
    // Only show admin link for admin users
    ...(session?.user?.role === 'admin' ? [
      {
        href: "/admin",
        label: "Admin",
        icon: <Shield className="h-5 w-5 mr-2" />,
        active: pathname.startsWith("/admin"),
      }
    ] : []),
  ]

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold" onClick={handleNavigation}>
            <Package2 className="h-6 w-6" /> {/* ShadCN example icon */}
            <span>Fitness Tracker</span>
          </Link>
          <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
            <Bell className="h-4 w-4" />
            <span className="sr-only">Toggle notifications</span>
          </Button>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="px-2">
      {routes.map((route) => (
        <SidebarMenuButton
          isActive={route.active}
          key={route.href}
          // variant={route.active ? "secondary" : "ghost"} // Changed active variant to secondary for better sidebar appearance
          size="lg"
          // className={cn("justify-start", route.active && "bg-primary text-primary-foreground hover:text-primary-foreground hover:bg-primary/80")}
          asChild
        >
          <Link href={route.href} onClick={handleNavigation}>
            {route.icon}
            {route.label}
          </Link>
        </SidebarMenuButton>
      ))}
    </SidebarMenu>
  </SidebarContent>
</Sidebar>
  )
}


