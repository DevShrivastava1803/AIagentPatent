
import { 
  FileText, 
  Home, 
  FileSearch, 
  MessageSquare, 
  Info,
  Settings
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link } from "react-router-dom";

// Menu items
const mainItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Patent Upload",
    url: "/upload",
    icon: FileText,
  },
  {
    title: "Analysis",
    url: "/analysis",
    icon: FileSearch,
  },
  {
    title: "Chat Assistant",
    url: "/chat",
    icon: MessageSquare,
  }
];

const secondaryItems = [
  {
    title: "About",
    url: "/about",
    icon: Info,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  }
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <Link to="/" className="flex items-center gap-2 px-2">
          <div className="bg-white p-1 rounded">
            <FileSearch className="h-6 w-6 text-blue-600" />
          </div>
          <span className="font-semibold text-white">Patent Insight</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url} className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url} className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="px-3 py-2">
          <p className="text-xs text-sidebar-accent-foreground/70">
            Patent Insight Agent v1.0
          </p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
