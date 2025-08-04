"use client"

import * as React from "react"
import { GalleryVerticalEnd } from "lucide-react"
import Image from "next/image"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { getStaticPageList, type PageInfo } from "@/lib/page-discovery"

// Group pages by category
function groupPagesByCategory(pages: PageInfo[]) {
  const grouped: Record<string, PageInfo[]> = {
    'Main': [],
  };
  
  pages.forEach(page => {
    const category = page.category || 'Main';
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(page);
  });
  
  return grouped;
}

// Get all pages and organize them
const allPages = getStaticPageList();
const groupedPages = groupPagesByCategory(allPages);

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [currentPath, setCurrentPath] = React.useState('');

  React.useEffect(() => {
    // Set the current path on mount and when it changes
    setCurrentPath(window.location.pathname);
  }, []);

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/">
                <Image 
                  src="/unmask2.png" 
                  alt="Unmask" 
                  width={120} 
                  height={40} 
                  className="h-8 w-auto"
                />
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {Object.entries(groupedPages).map(([category, pages]) => (
          <SidebarGroup key={category}>
            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {category}
            </div>
            <SidebarMenu>
              {pages.map((page) => {
                const isActive = currentPath === page.url;
                return (
                  <SidebarMenuItem key={page.url}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <a href={page.url}>
                        {page.title}
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
