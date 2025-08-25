import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface PlatformFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  platform?: {
    id: string;
    platform_name: string;
    account_handle: string;
    account_display_name?: string;
    account_url?: string;
    followers_count: number;
    is_active: boolean;
  };
}

const PlatformForm: React.FC<PlatformFormProps> = ({ open, onOpenChange, onSuccess, platform }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    platform_name: platform?.platform_name || '',
    account_handle: platform?.account_handle || '',
    account_display_name: platform?.account_display_name || '',
    account_url: platform?.account_url || '',
    followers_count: platform?.followers_count || 0,
    is_active: platform?.is_active ?? true
  });
  const [loading, setLoading] = useState(false);

  // Update form data when platform prop changes
  useEffect(() => {
    if (platform) {
      setFormData({
        platform_name: platform.platform_name,
        account_handle: platform.account_handle,
        account_display_name: platform.account_display_name || '',
        account_url: platform.account_url || '',
        followers_count: platform.followers_count,
        is_active: platform.is_active
      });
    } else {
      setFormData({
        platform_name: '',
        account_handle: '',
        account_display_name: '',
        account_url: '',
        followers_count: 0,
        is_active: true
      });
    }
  }, [platform]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.platform_name || !formData.account_handle) return;

    setLoading(true);
    try {
      if (platform) {
        // Update existing platform
        const { error } = await supabase
          .from('content_platforms')
          .update({
            platform_name: formData.platform_name,
            account_handle: formData.account_handle,
            account_display_name: formData.account_display_name || null,
            account_url: formData.account_url || null,
            followers_count: formData.followers_count,
            is_active: formData.is_active
          })
          .eq('id', platform.id);

        if (error) throw error;

        toast({
          title: "Account Updated",
          description: "Your platform account has been updated successfully.",
        });
      } else {
        // Create new platform
        const { error } = await supabase
          .from('content_platforms')
          .insert({
            user_id: user.id,
            platform_name: formData.platform_name,
            account_handle: formData.account_handle,
            account_display_name: formData.account_display_name || null,
            account_url: formData.account_url || null,
            followers_count: formData.followers_count,
            is_active: formData.is_active
          });

        if (error) throw error;

        toast({
          title: "Account Added",
          description: "Your platform account has been added successfully.",
        });
      }

      // Reset form only if not editing
      if (!platform) {
        setFormData({
          platform_name: '',
          account_handle: '',
          account_display_name: '',
          account_url: '',
          followers_count: 0,
          is_active: true
        });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add platform account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{platform ? 'Edit Platform Account' : 'Add New Platform Account'}</DialogTitle>
          <DialogDescription>
            {platform 
              ? 'Update your platform account details and metrics'
              : 'Connect a new social media account to track your content across multiple accounts'
            }
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="platform_name">Platform</Label>
            <Select
              value={formData.platform_name}
              onValueChange={(value) => setFormData({ ...formData, platform_name: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="youtube">YouTube</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
                <SelectItem value="twitter">Twitter/X</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="twitch">Twitch</SelectItem>
                <SelectItem value="snapchat">Snapchat</SelectItem>
                <SelectItem value="pinterest">Pinterest</SelectItem>
                <SelectItem value="discord">Discord</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="account_handle">Account Handle</Label>
            <Input
              id="account_handle"
              value={formData.account_handle}
              onChange={(e) => setFormData({ ...formData, account_handle: e.target.value })}
              placeholder="@username"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="account_display_name">Display Name</Label>
            <Input
              id="account_display_name"
              value={formData.account_display_name}
              onChange={(e) => setFormData({ ...formData, account_display_name: e.target.value })}
              placeholder="Your Name or Brand"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="account_url">Profile URL</Label>
            <Input
              id="account_url"
              type="url"
              value={formData.account_url}
              onChange={(e) => setFormData({ ...formData, account_url: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="followers_count">Followers Count</Label>
            <Input
              id="followers_count"
              type="number"
              value={formData.followers_count}
              onChange={(e) => setFormData({ ...formData, followers_count: parseInt(e.target.value) || 0 })}
              placeholder="0"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label htmlFor="is_active">Active Platform</Label>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading 
                ? (platform ? 'Updating...' : 'Adding...') 
                : (platform ? 'Update Account' : 'Add Platform')
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PlatformForm;