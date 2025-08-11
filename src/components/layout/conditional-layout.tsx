"use client"

import { usePathname } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

// Simple header without sidebar functionality
function SimpleHeader() {
  const pathname = usePathname()
  
  // Map pathnames to page titles
  const getPageTitle = (path: string) => {
    if (path === "/") return "Home"
    if (path === "/marquee") return "Marquee"
    
    const segments = path.split("/").filter(Boolean)
    if (segments.length > 0) {
      return segments[segments.length - 1]
        .split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    }
    
    return "Unmask"
  }
  
  const pageTitle = getPageTitle(pathname)
  
  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <h1 className="text-base font-medium">{pageTitle}</h1>
        <div className="ml-auto flex items-center gap-2">
          {/* Add any header actions here if needed */}
        </div>
      </div>
    </header>
  )
}

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Check if the current path is in the (no-sidebar) folder
  const isNoSidebarRoute = pathname.startsWith('/(no-sidebar)') || 
                          pathname === '/' || 
                          pathname.startsWith('/marquee')

  if (isNoSidebarRoute) {
    // Render without sidebar
    return (
      <>
        <SimpleHeader />
        <div className="flex flex-1 flex-col">
          {children}
        </div>
      </>
    )
  }

  // Render with sidebar
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}