import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useOrganization } from "@/hooks/useOrganization";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FileShareDialogProps {
  file: {
    id: string;
    file_name: string;
    shared_with_users?: string[];
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onShareUpdate: () => void;
}

interface Member {
  user_id: string;
  full_name: string;
  avatar_url: string;
}

export const FileShareDialog = ({ file, isOpen, onClose, onShareUpdate }: FileShareDialogProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [sharedWith, setSharedWith] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { activeContext } = useOrganization();

  useEffect(() => {
    if (isOpen && activeContext && file) {
      fetchMembers();
      setSharedWith(file.shared_with_users || []);
    }
  }, [isOpen, activeContext, file]);

  const fetchMembers = async () => {
    if (!activeContext) return;

    try {
      const { data, error } = await supabase.rpc('get_organization_members', {
        org_id: activeContext.id
      });

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
      toast.error("Failed to load members");
    }
  };

  const toggleShare = async (userId: string) => {
    if (!file) return;

    setLoading(true);
    try {
      const newSharedWith = sharedWith.includes(userId)
        ? sharedWith.filter(id => id !== userId)
        : [...sharedWith, userId];

      const { error } = await supabase
        .from('file_metadata')
        .update({ shared_with_users: newSharedWith })
        .eq('id', file.id);

      if (error) throw error;

      setSharedWith(newSharedWith);
      toast.success(
        sharedWith.includes(userId) 
          ? "File access removed" 
          : "File shared successfully"
      );
      onShareUpdate();
    } catch (error) {
      console.error('Error updating file sharing:', error);
      toast.error("Failed to update sharing");
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter(member =>
    member.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!file) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share "{file.file_name}"</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {filteredMembers.map((member) => {
                const isShared = sharedWith.includes(member.user_id);
                return (
                  <div
                    key={member.user_id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.avatar_url} />
                        <AvatarFallback>
                          {member.full_name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{member.full_name}</span>
                    </div>
                    <Button
                      size="sm"
                      variant={isShared ? "default" : "outline"}
                      onClick={() => toggleShare(member.user_id)}
                      disabled={loading}
                    >
                      {isShared ? (
                        <>
                          <Check className="h-4 w-4 mr-1" />
                          Shared
                        </>
                      ) : (
                        "Share"
                      )}
                    </Button>
                  </div>
                );
              })}

              {filteredMembers.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No members found
                </p>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};
