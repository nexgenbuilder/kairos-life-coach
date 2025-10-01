import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  ChevronDown, 
  Users, 
  Building2, 
  Heart, 
  FolderOpen,
  User,
  Plus
} from 'lucide-react';
import { useOrganization } from '@/hooks/useOrganization';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { SharedSpacesOnboarding } from './SharedSpacesOnboarding';

const SPACE_TYPE_ICONS = {
  individual: User,
  family: Heart,
  team: Users,
  organization: Building2,
  project: FolderOpen,
};

export const ContextSwitcher: React.FC = () => {
  const { activeContext, userContexts, switchContext, loading } = useOrganization();
  const [isSwitching, setIsSwitching] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleContextSwitch = async (contextId: string) => {
    if (contextId === activeContext?.id) return;
    
    setIsSwitching(true);
    try {
      await switchContext(contextId);
      toast({
        title: "Context switched",
        description: "Loading your new workspace...",
      });
    } catch (error) {
      toast({
        title: "Error switching context",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSwitching(false);
    }
  };

  if (loading || !activeContext) {
    return (
      <div className="w-48 h-10 bg-muted animate-pulse rounded-md" />
    );
  }

  const IconComponent = SPACE_TYPE_ICONS[activeContext.type as keyof typeof SPACE_TYPE_ICONS] || Building2;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="w-48 justify-between"
            disabled={isSwitching}
          >
            <div className="flex items-center space-x-2">
              <IconComponent className="w-4 h-4" />
              <span className="truncate">{activeContext.name}</span>
            </div>
            <ChevronDown className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="start">
          <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
            Switch Space
          </div>
          <DropdownMenuSeparator />
          
          {userContexts.map((context) => {
            const ContextIcon = SPACE_TYPE_ICONS[context.group_type as keyof typeof SPACE_TYPE_ICONS] || Building2;
            const isActive = context.group_id === activeContext.id;
            
            return (
              <DropdownMenuItem
                key={context.group_id}
                onClick={() => handleContextSwitch(context.group_id)}
                className="flex items-center space-x-3 cursor-pointer"
                disabled={isActive || isSwitching}
              >
                <ContextIcon className="w-4 h-4" />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{context.group_name}</span>
                    {isActive && (
                      <Badge variant="secondary" className="text-xs">
                        Active
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-muted-foreground capitalize">
                      {context.group_type}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {context.role}
                    </Badge>
                  </div>
                </div>
              </DropdownMenuItem>
            );
          })}
          
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => setShowCreateDialog(true)}
          >
            <Plus className="w-4 w-4" />
            <span>Create New Space</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <SharedSpacesOnboarding 
            onComplete={() => {
              setShowCreateDialog(false);
              window.location.reload();
            }} 
          />
        </DialogContent>
      </Dialog>
    </>
  );
};