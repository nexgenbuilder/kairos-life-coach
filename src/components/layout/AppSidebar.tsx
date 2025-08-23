import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  DollarSign,
  Heart,
  Dumbbell,
  CheckSquare,
  Users,
  Calendar,
  Briefcase,
  User,
  Settings,
  Sparkles,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

const lifeCategories = [
  { title: 'Money', url: '/money', icon: DollarSign },
  { title: 'Health', url: '/health', icon: Heart },
  { title: 'Fitness', url: '/fitness', icon: Dumbbell },
  { title: 'Tasks', url: '/tasks', icon: CheckSquare },
  { title: 'Social', url: '/social', icon: Users },
  { title: 'Love', url: '/love', icon: Heart },
  { title: 'Business', url: '/business', icon: Briefcase },
  { title: 'Professional', url: '/professional', icon: User },
  { title: 'Calendar', url: '/calendar', icon: Calendar },
];

const bottomItems = [
  { title: 'Settings', url: '/settings', icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === 'collapsed';
  const { user, signOut } = useAuth();

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-primary/10 text-primary border-r-2 border-primary font-medium" 
      : "hover:bg-accent/50 text-muted-foreground hover:text-foreground";

  return (
    <Sidebar
      className={cn(
        "transition-smooth border-r border-border bg-card/30 backdrop-blur-sm",
        collapsed ? "w-16" : "w-72"
      )}
      collapsible="icon"
    >
      <SidebarHeader className="border-b border-border p-4">
        <NavLink 
          to="/" 
          className="flex items-center space-x-3 group"
        >
          <div className="w-8 h-8 bg-primary-gradient rounded-lg flex items-center justify-center shadow-glow-soft">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="font-bold text-lg bg-hero-gradient bg-clip-text text-transparent">
                Kairos
              </h1>
              <p className="text-xs text-muted-foreground">AI for your life</p>
            </div>
          )}
        </NavLink>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel className={cn("px-3 py-2", collapsed && "sr-only")}>
            Life Categories
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {lifeCategories.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={getNavCls}
                      title={collapsed ? item.title : undefined}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!collapsed && <span className="truncate">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              {bottomItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={getNavCls}
                      title={collapsed ? item.title : undefined}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
              {!collapsed && <span className="truncate">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {/* Sign Out Button */}
              <SidebarMenuItem>
                <Button 
                  variant="ghost" 
                  onClick={signOut}
                  className="w-full justify-start p-2 h-8 font-normal text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  title={collapsed ? "Sign Out" : undefined}
                >
                  <LogOut className="h-4 w-4 flex-shrink-0" />
                  {!collapsed && <span className="ml-2">Sign Out</span>}
                </Button>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}