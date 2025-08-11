"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"

export function SiteHeader() {
  const pathname = usePathname()
  
  // Map pathnames to page titles
  const getPageTitle = (path: string) => {
    // Main pages
    if (path === "/") return "Home"
    if (path === "/messages") return "Messages"
    if (path === "/messages-fixed") return "Messages Fixed"
    if (path === "/chat") return "AI Chat"
    if (path === "/events") return "Events"
    if (path === "/blog") return "Blog"
    if (path === "/timeline") return "Timeline"
    if (path === "/relationship-dashboard") return "Relationship Dashboard"
    if (path === "/timeline-dashboard") return "Timeline Dashboard"
    if (path === "/test") return "Test"
    if (path === "/protected") return "Protected"
    if (path === "/marquee") return "Marquee"
    
    // Dashboard pages
    if (path === "/dashboard") return "Dashboard"
    if (path === "/dashboard/chat") return "Chat"
    if (path === "/dashboard/timeline") return "Timeline"
    if (path === "/dashboard/upload") return "Upload"
    
    // Auth pages
    if (path === "/auth/login") return "Login"
    if (path === "/auth/sign-up") return "Sign Up"
    if (path === "/auth/sign-up-success") return "Sign Up Success"
    if (path === "/auth/forgot-password") return "Forgot Password"
    if (path === "/auth/update-password") return "Update Password"
    if (path === "/auth/error") return "Error"
    
    // For dynamic routes or unknown paths, try to extract a meaningful title
    const segments = path.split("/").filter(Boolean)
    if (segments.length > 0) {
      // Special handling for known patterns
      if (segments[0] === "auth") {
        return segments.slice(1)
          .join(" ")
          .split("-")
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")
      }
      
      // Default: use the last segment
      return segments[segments.length - 1]
        .split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    }
    
    return "Unmask"
  }
  
  const pageTitle = getPageTitle(pathname)
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{pageTitle}</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" asChild size="sm" className="hidden sm:flex">
            <a
              href="https://github.com/shadcn-ui/ui/tree/main/apps/v4/app/(examples)/dashboard"
              rel="noopener noreferrer"
              target="_blank"
              className="dark:text-foreground"
            >
              GitHub
            </a>
          </Button>
        </div>
      </div>
    </header>
  )
}
