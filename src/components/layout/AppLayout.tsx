import React from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { ContextSwitcher } from '@/components/organization/ContextSwitcher';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function AppLayout({ children, className }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header with sidebar trigger and context switcher */}
          <header className="h-14 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-4 sticky top-0 z-10">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-smooth" />
            <ContextSwitcher />
          </header>
          
          {/* Main content */}
          <main className={cn("flex-1", className)}>
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}