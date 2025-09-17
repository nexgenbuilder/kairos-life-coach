import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useOrganization } from '@/hooks/useOrganization';
import { toast } from '@/hooks/use-toast';

interface Person {
  id?: string;
  full_name: string;
  email: string;
  phone: string;
  type: string;
  company: string;
  position: string;
  address: string;
  birthday: string;
  notes: string;
  tags: string[];
  social_media_links: Record<string, string>;
}

interface PersonFormProps {
  person?: Person | null;
  module: 'social' | 'love' | 'business' | 'professional';
  onSave: () => void;
  onCancel: () => void;
}

const PersonForm: React.FC<PersonFormProps> = ({ person, module, onSave, onCancel }) => {
  const { user } = useAuth();
  const { activeContext } = useOrganization();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: person?.full_name || '',
    email: person?.email || '',
    phone: person?.phone || '',
    type: person?.type || getDefaultType(module),
    company: person?.company || '',
    position: person?.position || '',
    address: person?.address || '',
    birthday: person?.birthday || '',
    notes: person?.notes || '',
    tags: person?.tags || [],
    social_media_links: person?.social_media_links || {}
  });

  const [newTag, setNewTag] = useState('');
  const [socialPlatform, setSocialPlatform] = useState('');
  const [socialUsername, setSocialUsername] = useState('');

  function getDefaultType(module: string) {
    switch (module) {
      case 'social': return 'friend';
      case 'love': return 'family';
      case 'business': return 'client';
      case 'professional': return 'colleague';
      default: return 'contact';
    }
  }

  const getTypeOptions = () => {
    switch (module) {
      case 'social':
        return [
          { value: 'friend', label: 'Friend' },
          { value: 'work', label: 'Work Friend' },
          { value: 'romantic', label: 'Romantic' },
          { value: 'school', label: 'School Friend' },
          { value: 'family', label: 'Family Friend' },
          { value: 'neighbor', label: 'Neighbor' },
          { value: 'acquaintance', label: 'Acquaintance' }
        ];
      case 'love':
        return [
          { value: 'family', label: 'Family' },
          { value: 'partner', label: 'Partner' },
          { value: 'spouse', label: 'Spouse' },
          { value: 'relative', label: 'Relative' }
        ];
      case 'business':
        return [
          { value: 'client', label: 'Client' },
          { value: 'supplier', label: 'Supplier' },
          { value: 'partner', label: 'Business Partner' },
          { value: 'vendor', label: 'Vendor' }
        ];
      case 'professional':
        return [
          { value: 'colleague', label: 'Colleague' },
          { value: 'manager', label: 'Manager' },
          { value: 'hr', label: 'HR Contact' },
          { value: 'client', label: 'Professional Client' }
        ];
      default:
        return [{ value: 'contact', label: 'Contact' }];
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addSocialMedia = () => {
    if (socialPlatform.trim() && socialUsername.trim()) {
      setFormData(prev => ({
        ...prev,
        social_media_links: {
          ...prev.social_media_links,
          [socialPlatform.trim()]: socialUsername.trim()
        }
      }));
      setSocialPlatform('');
      setSocialUsername('');
    }
  };

  const removeSocialMedia = (platform: string) => {
    setFormData(prev => ({
      ...prev,
      social_media_links: Object.fromEntries(
        Object.entries(prev.social_media_links).filter(([key]) => key !== platform)
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      const personData = {
        user_id: user.id,
        organization_id: activeContext?.id || null,
        full_name: formData.full_name,
        email: formData.email || null,
        phone: formData.phone || null,
        type: formData.type,
        company: formData.company || null,
        position: formData.position || null,
        address: formData.address || null,
        birthday: formData.birthday || null,
        notes: formData.notes || null,
        tags: formData.tags.length > 0 ? formData.tags : null,
        social_media_links: Object.keys(formData.social_media_links).length > 0 ? formData.social_media_links : {}
      };

      if (person?.id) {
        const { error } = await supabase
          .from('people')
          .update(personData)
          .eq('id', person.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('people')
          .insert([personData]);
        if (error) throw error;
      }

      toast({
        title: 'Success',
        description: `Contact ${person?.id ? 'updated' : 'created'} successfully`,
      });

      onSave();
    } catch (error) {
      console.error('Error saving person:', error);
      toast({
        title: 'Error',
        description: 'Failed to save contact',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{person?.id ? 'Edit Contact' : 'Add New Contact'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="type">Type</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getTypeOptions().map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="birthday">Birthday</Label>
              <Input
                id="birthday"
                type="date"
                value={formData.birthday}
                onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" variant="outline" size="sm" onClick={addTag}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <Label>Social Media</Label>
            <div className="space-y-2 mb-2">
              {Object.entries(formData.social_media_links).map(([platform, username]) => (
                <div key={platform} className="flex items-center justify-between bg-muted p-2 rounded">
                  <span><strong>{platform}:</strong> {username}</span>
                  <X className="h-4 w-4 cursor-pointer" onClick={() => removeSocialMedia(platform)} />
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Platform (e.g., Instagram, LinkedIn)"
                value={socialPlatform}
                onChange={(e) => setSocialPlatform(e.target.value)}
              />
              <Input
                placeholder="Username/Handle"
                value={socialUsername}
                onChange={(e) => setSocialUsername(e.target.value)}
              />
              <Button type="button" variant="outline" size="sm" onClick={addSocialMedia}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : person?.id ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PersonForm;