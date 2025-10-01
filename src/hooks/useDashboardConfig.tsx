import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from './useOrganization';
import { useToast } from '@/hooks/use-toast';

export interface DashboardCard {
  id: string;
  module: string;
  label: string;
  enabled: boolean;
  order: number;
}

export interface DashboardConfig {
  enabled_cards: string[];
  card_order: { [key: string]: number };
}

const DEFAULT_CARDS: DashboardCard[] = [
  { id: 'today_tasks', module: 'tasks', label: 'Today\'s Tasks', enabled: false, order: 0 },
  { id: 'spend_week', module: 'money', label: 'Weekly Spending', enabled: false, order: 1 },
  { id: 'leads', module: 'professional', label: 'Leads', enabled: false, order: 2 },
  { id: 'fitness_streak', module: 'fitness', label: 'Fitness Streak', enabled: false, order: 3 },
  { id: 'upcoming_events', module: 'calendar', label: 'Upcoming Events', enabled: false, order: 4 },
  { id: 'health_metrics', module: 'health', label: 'Health Summary', enabled: false, order: 5 },
  { id: 'content_performance', module: 'creators', label: 'Content Performance', enabled: false, order: 6 },
  { id: 'crypto_portfolio', module: 'crypto', label: 'Crypto Portfolio', enabled: false, order: 7 },
];

export function useDashboardConfig() {
  const { activeContext, moduleSettings } = useOrganization();
  const [cards, setCards] = useState<DashboardCard[]>(DEFAULT_CARDS);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!activeContext || !moduleSettings) {
      setLoading(false);
      return;
    }

    // Get dashboard config from any module's settings (we'll use the first enabled module)
    const moduleWithDashboard = moduleSettings.find(m => 
      m.settings && typeof m.settings === 'object' && 'dashboard' in m.settings
    );

    if (moduleWithDashboard?.settings && typeof moduleWithDashboard.settings === 'object') {
      const dashboardConfig = (moduleWithDashboard.settings as any).dashboard as DashboardConfig;
      
      if (dashboardConfig) {
        const updatedCards = DEFAULT_CARDS.map(card => ({
          ...card,
          enabled: dashboardConfig.enabled_cards?.includes(card.id) ?? card.enabled,
          order: dashboardConfig.card_order?.[card.id] ?? card.order,
        }));
        setCards(updatedCards.sort((a, b) => a.order - b.order));
      }
    }

    setLoading(false);
  }, [activeContext, moduleSettings]);

  const updateDashboardConfig = async (updatedCards: DashboardCard[]) => {
    if (!activeContext) return;

    try {
      const config: DashboardConfig = {
        enabled_cards: updatedCards.filter(c => c.enabled).map(c => c.id),
        card_order: Object.fromEntries(updatedCards.map(c => [c.id, c.order])),
      };

      // Update the first enabled module's settings with dashboard config
      const firstModule = moduleSettings?.[0];
      if (!firstModule) return;

      const currentSettings = (firstModule.settings as any) || {};
      const newSettings = {
        ...currentSettings,
        dashboard: config,
      };

      const { error } = await supabase
        .from('module_permissions')
        .update({ settings: newSettings })
        .eq('organization_id', activeContext.id)
        .eq('module_name', firstModule.module_name);

      if (error) throw error;

      setCards(updatedCards.sort((a, b) => a.order - b.order));
      
      toast({
        title: 'Dashboard updated',
        description: 'Your dashboard preferences have been saved.',
      });
    } catch (error) {
      console.error('Error updating dashboard config:', error);
      toast({
        title: 'Error',
        description: 'Failed to update dashboard preferences.',
        variant: 'destructive',
      });
    }
  };

  const getEnabledCards = () => {
    // Filter by enabled status and module access
    return cards.filter(card => {
      const module = moduleSettings?.find(m => m.module_name === card.module);
      return card.enabled && module?.is_enabled;
    });
  };

  return {
    cards,
    loading,
    updateDashboardConfig,
    getEnabledCards,
  };
}
