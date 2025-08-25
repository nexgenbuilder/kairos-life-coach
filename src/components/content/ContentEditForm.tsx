import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Platform {
  id: string;
  platform_name: string;
  account_handle: string;
}

interface Content {
  id: string;
  title: string;
  description?: string;
  content_type: string;
  platform_id?: string;
  status: string;
  scheduled_date?: string;
  published_date?: string;
  ad_spend_cents: number;
  hashtags?: string[];
  tags?: string[];
}

interface ContentEditFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  content: Content | null;
  platforms: Platform[];
}

const ContentEditForm: React.FC<ContentEditFormProps> = ({ 
  open, 
  onOpenChange, 
  onSuccess, 
  content,
  platforms 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content_type: '',
    platform_id: '',
    status: 'draft',
    scheduled_date: '',
    published_date: '',
    ad_spend_cents: 0,
    hashtags: [] as string[],
    tags: [] as string[]
  });
  const [loading, setLoading] = useState(false);
  const [hashtagInput, setHashtagInput] = useState('');
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (content) {
      setFormData({
        title: content.title,
        description: content.description || '',
        content_type: content.content_type,
        platform_id: content.platform_id || '',
        status: content.status,
        scheduled_date: content.scheduled_date || '',
        published_date: content.published_date || '',
        ad_spend_cents: content.ad_spend_cents,
        hashtags: content.hashtags || [],
        tags: content.tags || []
      });
    }
  }, [content]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !content || !formData.title) return;

    // Validate scheduling requirements
    if (formData.status === 'scheduled' && !formData.scheduled_date) {
      toast({
        title: "Validation Error",
        description: "Please select a scheduled date when changing status to scheduled.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const updateData: any = {
        title: formData.title,
        description: formData.description || null,
        content_type: formData.content_type,
        platform_id: formData.platform_id || null,
        status: formData.status,
        ad_spend_cents: formData.ad_spend_cents,
        hashtags: formData.hashtags.length > 0 ? formData.hashtags : null,
        tags: formData.tags.length > 0 ? formData.tags : null,
      };

      // Handle scheduling date
      if (formData.status === 'scheduled' && formData.scheduled_date) {
        updateData.scheduled_date = formData.scheduled_date;
      } else if (formData.status !== 'scheduled') {
        updateData.scheduled_date = null;
      }

      // Handle published date
      if (formData.status === 'published' && formData.published_date) {
        updateData.published_date = formData.published_date;
      } else if (formData.status === 'published' && !formData.published_date) {
        updateData.published_date = new Date().toISOString();
      }

      const { error } = await supabase
        .from('content_catalog')
        .update(updateData)
        .eq('id', content.id);

      if (error) throw error;

      toast({
        title: "Content Updated",
        description: `Content has been updated and ${formData.status === 'scheduled' ? 'scheduled' : formData.status === 'published' ? 'published' : 'saved as draft'}.`,
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addHashtag = () => {
    if (hashtagInput.trim() && !formData.hashtags.includes(hashtagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        hashtags: [...prev.hashtags, hashtagInput.trim()]
      }));
      setHashtagInput('');
    }
  };

  const removeHashtag = (hashtag: string) => {
    setFormData(prev => ({
      ...prev,
      hashtags: prev.hashtags.filter(h => h !== hashtag)
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  if (!content) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Content</DialogTitle>
          <DialogDescription>
            Update content details and schedule for publishing
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Content Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter content title"
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
                  <SelectItem value="photo">Photo</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="carousel">Carousel</SelectItem>
                  <SelectItem value="story">Story</SelectItem>
                  <SelectItem value="reel">Reel</SelectItem>
                  <SelectItem value="livestream">Livestream</SelectItem>
                  <SelectItem value="blog">Blog Post</SelectItem>
                  <SelectItem value="article">Article</SelectItem>
                  <SelectItem value="tweet">Tweet</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="platform_id">Platform Account</Label>
              <Select
                value={formData.platform_id}
                onValueChange={(value) => setFormData({ ...formData, platform_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select platform account" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No platform selected</SelectItem>
                  {platforms.map((platform) => (
                    <SelectItem key={platform.id} value={platform.id}>
                      {platform.platform_name} - @{platform.account_handle}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.status === 'scheduled' && (
            <div className="space-y-2">
              <Label htmlFor="scheduled_date">Scheduled Date & Time</Label>
              <Input
                id="scheduled_date"
                type="datetime-local"
                value={formData.scheduled_date}
                onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                required={formData.status === 'scheduled'}
              />
            </div>
          )}

          {formData.status === 'published' && (
            <div className="space-y-2">
              <Label htmlFor="published_date">Published Date & Time</Label>
              <Input
                id="published_date"
                type="datetime-local"
                value={formData.published_date}
                onChange={(e) => setFormData({ ...formData, published_date: e.target.value })}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Description/Caption</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Write your post caption or description..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ad_spend">Ad Spend ($)</Label>
            <Input
              id="ad_spend"
              type="number"
              step="0.01"
              value={formData.ad_spend_cents / 100}
              onChange={(e) => setFormData({ 
                ...formData, 
                ad_spend_cents: Math.round(parseFloat(e.target.value) * 100) || 0 
              })}
              placeholder="0.00"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Hashtags</Label>
              <div className="flex gap-2">
                <Input
                  value={hashtagInput}
                  onChange={(e) => setHashtagInput(e.target.value)}
                  placeholder="#hashtag"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHashtag())}
                />
                <Button type="button" onClick={addHashtag} variant="outline">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {formData.hashtags.map((hashtag) => (
                  <span
                    key={hashtag}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-sm"
                  >
                    #{hashtag}
                    <button
                      type="button"
                      onClick={() => removeHashtag(hashtag)}
                      className="hover:text-destructive"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="tag"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag} variant="outline">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-secondary/50 text-secondary-foreground rounded-md text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-destructive"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Updating...' : 'Update Content'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ContentEditForm;