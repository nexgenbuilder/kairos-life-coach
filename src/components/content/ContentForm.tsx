import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface ContentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface Platform {
  id: string;
  platform_name: string;
  account_handle: string;
}

const ContentForm: React.FC<ContentFormProps> = ({ open, onOpenChange, onSuccess }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    content_type: '',
    description: '',
    platform_id: '',
    status: 'draft',
    scheduled_date: '',
    hashtags: '',
    tags: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && user) {
      fetchPlatforms();
    }
  }, [open, user]);

  const fetchPlatforms = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('content_platforms')
        .select('id, platform_name, account_handle')
        .eq('user_id', user.id)
        .eq('is_active', true);
      
      setPlatforms(data || []);
    } catch (error) {
      console.error('Error fetching platforms:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.title || !formData.content_type) return;

    setLoading(true);
    try {
      const submitData = {
        user_id: user.id,
        title: formData.title,
        content_type: formData.content_type,
        description: formData.description || null,
        platform_id: formData.platform_id || null,
        status: formData.status,
        scheduled_date: formData.scheduled_date ? new Date(formData.scheduled_date).toISOString() : null,
        hashtags: formData.hashtags ? formData.hashtags.split(',').map(h => h.trim()) : null,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : null
      };

      const { error } = await supabase
        .from('content_catalog')
        .insert(submitData);

      if (error) throw error;

      toast({
        title: "Content Created",
        description: "Your content has been added to the catalog.",
      });

      // Reset form
      setFormData({
        title: '',
        content_type: '',
        description: '',
        platform_id: '',
        status: 'draft',
        scheduled_date: '',
        hashtags: '',
        tags: ''
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create content. Please try again.",
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
          <DialogTitle>Create New Content</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Content title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content_type">Content Type</Label>
            <Select
              value={formData.content_type}
              onValueChange={(value) => setFormData({ ...formData, content_type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select content type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="photo">Photo</SelectItem>
                <SelectItem value="carousel">Carousel</SelectItem>
                <SelectItem value="reel">Reel</SelectItem>
                <SelectItem value="story">Story</SelectItem>
                <SelectItem value="livestream">Livestream</SelectItem>
                <SelectItem value="blog">Blog Post</SelectItem>
                <SelectItem value="podcast">Podcast</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="platform">Platform</Label>
            <Select
              value={formData.platform_id}
              onValueChange={(value) => setFormData({ ...formData, platform_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select platform (optional)" />
              </SelectTrigger>
              <SelectContent>
                {platforms.map((platform) => (
                  <SelectItem key={platform.id} value={platform.id}>
                    {platform.platform_name} (@{platform.account_handle})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Content description"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.status === 'scheduled' && (
            <div className="space-y-2">
              <Label htmlFor="scheduled_date">Scheduled Date</Label>
              <Input
                id="scheduled_date"
                type="datetime-local"
                value={formData.scheduled_date}
                onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="hashtags">Hashtags</Label>
            <Input
              id="hashtags"
              value={formData.hashtags}
              onChange={(e) => setFormData({ ...formData, hashtags: e.target.value })}
              placeholder="Separate with commas"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="Separate with commas"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Creating...' : 'Create Content'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ContentForm;