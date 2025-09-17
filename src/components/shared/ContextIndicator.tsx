import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useOrganization } from '@/hooks/useOrganization';
import { Building2, User } from 'lucide-react';

export const ContextIndicator = () => {
  const { activeContext, userContexts } = useOrganization();
  
  const currentContext = userContexts?.find(ctx => ctx.group_id === activeContext?.id);
  
  return (
    <div className="flex items-center gap-2">
      <Badge variant="secondary" className="flex items-center gap-1">
        {currentContext ? (
          <>
            <Building2 className="h-3 w-3" />
            {currentContext.group_name}
          </>
        ) : (
          <>
            <User className="h-3 w-3" />
            Personal
          </>
        )}
      </Badge>
    </div>
  );
};