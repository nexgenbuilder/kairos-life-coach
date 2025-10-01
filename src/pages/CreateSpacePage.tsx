import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useOrganization } from '@/hooks/useOrganization';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

type SpaceType = 'individual' | 'family' | 'team' | 'organization' | 'project';

interface ModuleOption {
  name: string;
  label: string;
  description: string;
}

const AVAILABLE_MODULES: ModuleOption[] = [
  { name: 'today', label: 'Today', description: 'Daily overview and quick actions' },
  { name: 'tasks', label: 'Tasks', description: 'Manage tasks and to-dos' },
  { name: 'calendar', label: 'Calendar', description: 'Schedule and events' },
  { name: 'money', label: 'Money', description: 'Track income and expenses' },
  { name: 'health', label: 'Health', description: 'Health metrics and medications' },
  { name: 'fitness', label: 'Fitness', description: 'Workout tracking' },
  { name: 'business', label: 'Business', description: 'Business finances and payroll' },
  { name: 'professional', label: 'Professional', description: 'Work schedule and PTO' },
  { name: 'creators', label: 'Creators', description: 'Content management' },
  { name: 'connections', label: 'Connections', description: 'Manage relationships' },
  { name: 'social', label: 'Social', description: 'Social feed and posts' },
  { name: 'love', label: 'Love', description: 'Relationship tracking' },
  { name: 'crypto', label: 'Crypto', description: 'Cryptocurrency portfolio' },
  { name: 'stocks', label: 'Stocks', description: 'Stock portfolio tracking' },
  { name: 'news', label: 'News', description: 'News and updates' },
  { name: 'cloud', label: 'Cloud', description: 'File storage and sharing' },
];

const getDefaultModules = (type: SpaceType): string[] => {
  switch (type) {
    case 'individual':
      return ['today', 'tasks', 'calendar', 'money', 'health', 'fitness'];
    case 'family':
      return ['today', 'tasks', 'calendar', 'money', 'health'];
    case 'team':
      return ['today', 'tasks', 'calendar', 'professional', 'cloud'];
    case 'organization':
      return ['today', 'tasks', 'calendar', 'business', 'professional', 'cloud'];
    case 'project':
      return ['today', 'tasks', 'calendar', 'cloud'];
    default:
      return ['today', 'tasks', 'calendar'];
  }
};

export default function CreateSpacePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createGroup } = useOrganization();
  
  const [isCreating, setIsCreating] = useState(false);
  const [spaceName, setSpaceName] = useState('');
  const [spaceType, setSpaceType] = useState<SpaceType>('individual');
  const [description, setDescription] = useState('');
  const [selectedModules, setSelectedModules] = useState<string[]>(getDefaultModules('individual'));
  const [isDiscoverable, setIsDiscoverable] = useState(false);
  const [pricingType, setPricingType] = useState<'free' | 'paid'>('free');
  const [priceAmount, setPriceAmount] = useState('');
  const [subscriptionInterval, setSubscriptionInterval] = useState<'monthly' | 'yearly'>('monthly');

  const handleTypeChange = (value: SpaceType) => {
    setSpaceType(value);
    setSelectedModules(getDefaultModules(value));
  };

  const toggleModule = (moduleName: string) => {
    setSelectedModules(prev =>
      prev.includes(moduleName)
        ? prev.filter(m => m !== moduleName)
        : [...prev, moduleName]
    );
  };

  const handleCreateSpace = async () => {
    if (!spaceName.trim()) {
      toast({
        title: 'Name Required',
        description: 'Please enter a name for your space',
        variant: 'destructive',
      });
      return;
    }

    if (selectedModules.length === 0) {
      toast({
        title: 'Modules Required',
        description: 'Please select at least one module',
        variant: 'destructive',
      });
      return;
    }

    if (pricingType === 'paid' && (!priceAmount || parseFloat(priceAmount) <= 0)) {
      toast({
        title: 'Price Required',
        description: 'Please enter a valid price for paid spaces',
        variant: 'destructive',
      });
      return;
    }

    setIsCreating(true);

    try {
      console.log('[CreateSpace] Creating space with:', { spaceName, spaceType, selectedModules, pricingType });
      
      const result = await createGroup(
        spaceName.trim(),
        spaceType,
        description.trim(),
        selectedModules,
        isDiscoverable
      );

      if (!result.success || !result.groupId) {
        throw new Error(result.error || 'Failed to create space');
      }

      console.log('[CreateSpace] Space created, updating settings...');

      // Update pricing and other settings
      const { error: updateError } = await supabase
        .from('organizations')
        .update({
          pricing_type: pricingType,
          price_amount_cents: pricingType === 'paid' ? Math.round(parseFloat(priceAmount) * 100) : 0,
          subscription_interval: pricingType === 'paid' ? subscriptionInterval : null,
        })
        .eq('id', result.groupId);

      if (updateError) {
        console.error('[CreateSpace] Error updating pricing:', updateError);
        throw updateError;
      }

      console.log('[CreateSpace] Space created successfully!');
      
      toast({
        title: 'Space Created!',
        description: `${spaceName} has been created successfully`,
      });
      
      // Navigate to dashboard after successful creation
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
    } catch (error: any) {
      console.error('[CreateSpace] Space creation error:', error);
      toast({
        title: 'Creation Failed',
        description: error.message || 'Failed to create space. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <AppLayout>
      <div className="container max-w-4xl mx-auto p-6 space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/spaces')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Spaces
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Create New Space</CardTitle>
            <CardDescription>
              Set up a new space to organize your activities and collaborate with others
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Space Name */}
            <div className="space-y-2">
              <Label htmlFor="space-name">Space Name *</Label>
              <Input
                id="space-name"
                placeholder="e.g., My Personal Space, Family Hub, Project Alpha"
                value={spaceName}
                onChange={(e) => setSpaceName(e.target.value)}
                disabled={isCreating}
              />
            </div>

            {/* Space Type */}
            <div className="space-y-2">
              <Label htmlFor="space-type">Space Type *</Label>
              <Select value={spaceType} onValueChange={handleTypeChange} disabled={isCreating}>
                <SelectTrigger id="space-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual - Personal space for your own use</SelectItem>
                  <SelectItem value="family">Family - Shared space for family members</SelectItem>
                  <SelectItem value="team">Team - Collaborate with your team</SelectItem>
                  <SelectItem value="organization">Organization - Manage your business</SelectItem>
                  <SelectItem value="project">Project - Dedicated project workspace</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Describe the purpose of this space..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isCreating}
                rows={3}
              />
            </div>

            {/* Modules Selection */}
            <div className="space-y-3">
              <Label>Modules *</Label>
              <p className="text-sm text-muted-foreground">
                Select the features you want to enable for this space
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {AVAILABLE_MODULES.map((module) => (
                  <div
                    key={module.name}
                    className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                  >
                    <Checkbox
                      id={module.name}
                      checked={selectedModules.includes(module.name)}
                      onCheckedChange={() => toggleModule(module.name)}
                      disabled={isCreating}
                    />
                    <div className="flex-1">
                      <label
                        htmlFor={module.name}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {module.label}
                      </label>
                      <p className="text-xs text-muted-foreground">
                        {module.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing Type */}
            <div className="space-y-3">
              <Label>Pricing</Label>
              <Select value={pricingType} onValueChange={(value: 'free' | 'paid') => setPricingType(value)} disabled={isCreating}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free - No charge to join</SelectItem>
                  <SelectItem value="paid">Paid - Requires subscription</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Price Details (shown only for paid) */}
            {pricingType === 'paid' && (
              <div className="space-y-3 p-4 rounded-lg border border-border bg-accent/10">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (USD) *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="9.99"
                    value={priceAmount}
                    onChange={(e) => setPriceAmount(e.target.value)}
                    disabled={isCreating}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Billing Interval</Label>
                  <Select value={subscriptionInterval} onValueChange={(value: 'monthly' | 'yearly') => setSubscriptionInterval(value)} disabled={isCreating}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Visibility */}
            <div className="flex items-start space-x-3 p-4 rounded-lg border border-border">
              <Checkbox
                id="discoverable"
                checked={isDiscoverable}
                onCheckedChange={(checked) => setIsDiscoverable(checked as boolean)}
                disabled={isCreating}
              />
              <div className="flex-1">
                <label
                  htmlFor="discoverable"
                  className="text-sm font-medium cursor-pointer"
                >
                  Make this space discoverable
                </label>
                <p className="text-xs text-muted-foreground mt-1">
                  Allow others to find and request to join this space
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => navigate('/spaces')}
                disabled={isCreating}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateSpace}
                disabled={isCreating || !spaceName.trim()}
                className="flex-1"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Space'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
