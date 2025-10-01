import React, { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Member {
  user_id: string;
  full_name: string;
  avatar_url?: string;
}

interface MentionAutocompleteProps {
  searchTerm: string;
  members: Member[];
  onSelect: (userId: string, name: string) => void;
  position: { top: number; left: number };
}

export function MentionAutocomplete({ 
  searchTerm, 
  members, 
  onSelect,
  position 
}: MentionAutocompleteProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  // Filter members based on search term
  const filteredMembers = searchTerm === ''
    ? [{ user_id: 'all', full_name: 'all', avatar_url: undefined }, ...members]
    : [
        { user_id: 'all', full_name: 'all', avatar_url: undefined },
        ...members.filter(m => 
          m.full_name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      ];

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchTerm]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredMembers.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : 0);
      } else if (e.key === 'Enter' && filteredMembers[selectedIndex]) {
        e.preventDefault();
        const selected = filteredMembers[selectedIndex];
        onSelect(selected.user_id, selected.full_name);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, filteredMembers, onSelect]);

  if (filteredMembers.length === 0) return null;

  return (
    <div 
      className="absolute z-50 bg-card border border-border rounded-lg shadow-lg overflow-hidden"
      style={{ 
        bottom: `${position.top}px`,
        left: `${position.left}px`,
        maxHeight: '200px',
        minWidth: '200px'
      }}
    >
      <div className="overflow-y-auto max-h-[200px]">
        {filteredMembers.map((member, index) => (
          <button
            key={member.user_id}
            onClick={() => onSelect(member.user_id, member.full_name)}
            className={cn(
              "w-full px-3 py-2 flex items-center space-x-2 hover:bg-accent transition-colors text-left",
              index === selectedIndex && "bg-accent"
            )}
          >
            {member.user_id === 'all' ? (
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-4 w-4 text-primary" />
              </div>
            ) : (
              <Avatar className="h-8 w-8">
                <AvatarImage src={member.avatar_url} />
                <AvatarFallback>
                  {member.full_name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}
            <span className="text-sm font-medium">@{member.full_name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
