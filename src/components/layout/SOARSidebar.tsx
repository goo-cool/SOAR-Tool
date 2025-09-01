import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { 
  Shield, 
  AlertTriangle, 
  FileText, 
  Workflow, 
  Settings, 
  Menu,
  X
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigationItems = [
  { 
    id: 'dashboard', 
    name: 'Dashboard', 
    path: '/', 
    icon: Shield 
  },
  { 
    id: 'alerts', 
    name: 'Alerts', 
    path: '/alerts', 
    icon: AlertTriangle 
  },
  { 
    id: 'cases', 
    name: 'Cases', 
    path: '/cases', 
    icon: FileText 
  },
  { 
    id: 'playbooks', 
    name: 'Playbooks', 
    path: '/playbooks', 
    icon: Workflow 
  },
  { 
    id: 'settings', 
    name: 'Settings', 
    path: '/settings', 
    icon: Settings 
  }
];

export function SOARSidebar() {
  const { open, setOpen } = useSidebar();
  const collapsed = !open;
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === '/') return currentPath === '/';
    return currentPath.startsWith(path);
  };

  return (
    <Sidebar className={cn(
      "border-r border-sidebar-border transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold text-sidebar-foreground">SOAR Tool</h1>
              <p className="text-sm text-muted-foreground">Security Operations</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setOpen(!open)}
          className="p-2 hover:bg-sidebar-accent"
        >
          {collapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </Button>
      </div>

      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupLabel className={cn(
            "text-muted-foreground text-xs uppercase tracking-wider mb-2",
            collapsed && "sr-only"
          )}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                const active = isActive(item.path);
                
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.path}
                        className={cn(
                          "flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200",
                          "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                          active 
                            ? "bg-primary text-primary-foreground font-medium shadow-sm" 
                            : "text-sidebar-foreground"
                        )}
                      >
                        <IconComponent className="h-5 w-5 flex-shrink-0" />
                        {!collapsed && <span>{item.name}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!collapsed && (
          <div className="mt-8 p-4 bg-card border border-border rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <div className="h-3 w-3 bg-success rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-card-foreground">System Status</span>
            </div>
            <p className="text-xs text-muted-foreground">
              All systems operational
            </p>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}