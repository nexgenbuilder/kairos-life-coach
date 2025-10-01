import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useDashboardConfig, DashboardCard } from '@/hooks/useDashboardConfig';
import { LoadingState } from '@/components/ui/loading-spinner';
import { useOrganization } from '@/hooks/useOrganization';
import { GripVertical, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';

export function DashboardPreferences() {
  const { cards, loading, updateDashboardConfig } = useDashboardConfig();
  const { moduleSettings } = useOrganization();

  if (loading) {
    return <LoadingState message="Loading dashboard preferences..." />;
  }

  const handleToggle = (cardId: string) => {
    const updatedCards = cards.map(card =>
      card.id === cardId ? { ...card, enabled: !card.enabled } : card
    );
    updateDashboardConfig(updatedCards);
  };

  const isModuleEnabled = (moduleName: string) => {
    return moduleSettings?.find(m => m.module_name === moduleName)?.is_enabled ?? false;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <LayoutDashboard className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Dashboard Overview</CardTitle>
            <CardDescription>
              Customize what you see on your dashboard quick overview
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {cards.map((card) => {
            const moduleEnabled = isModuleEnabled(card.module);
            
            return (
              <div
                key={card.id}
                className={cn(
                  "flex items-center justify-between p-4 rounded-lg border bg-card transition-smooth",
                  !moduleEnabled && "opacity-50 cursor-not-allowed"
                )}
              >
                <div className="flex items-center gap-3 flex-1">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <Label 
                      htmlFor={card.id}
                      className={cn(
                        "text-sm font-medium cursor-pointer",
                        !moduleEnabled && "cursor-not-allowed"
                      )}
                    >
                      {card.label}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Module: {card.module}
                      {!moduleEnabled && " (module disabled)"}
                    </p>
                  </div>
                </div>
                <Switch
                  id={card.id}
                  checked={card.enabled}
                  onCheckedChange={() => handleToggle(card.id)}
                  disabled={!moduleEnabled}
                />
              </div>
            );
          })}
        </div>

        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Only cards from enabled modules will appear on your dashboard. Enable modules in the Organization or Modules tab.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
