import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  Users, 
  Building2, 
  Heart, 
  Briefcase, 
  FolderOpen,
  ArrowRight,
  Check,
  Share,
  Lock,
  Globe,
  Shield
} from 'lucide-react';
import { useOrganization } from '@/hooks/useOrganization';
import { useToast } from '@/components/ui/use-toast';
import { ProfileSetupForm } from './ProfileSetupForm';
import { supabase } from '@/integrations/supabase/client';

type SpaceType = 'individual' | 'family' | 'team' | 'organization' | 'project';

const SPACE_TYPES = [
  {
    value: 'individual' as SpaceType,
    label: 'Continue as Individual',
    description: 'Private Life OS just for you',
    icon: Users,
    color: 'bg-blue-500',
  },
  {
    value: 'family' as SpaceType,
    label: 'Create a Family Space',
    description: 'Share calendars, budgets, and plans with family',
    icon: Heart,
    color: 'bg-pink-500',
  },
  {
    value: 'team' as SpaceType,
    label: 'Create a Team Space',
    description: 'Collaborate on projects with friends or colleagues',
    icon: Users,
    color: 'bg-green-500',
  },
  {
    value: 'organization' as SpaceType,
    label: 'Create an Organization',
    description: 'Business with structured roles and admin controls',
    icon: Building2,
    color: 'bg-purple-500',
  },
  {
    value: 'project' as SpaceType,
    label: 'Create a Project Space',
    description: 'Focused collaboration for specific projects',
    icon: FolderOpen,
    color: 'bg-orange-500',
  },
];

const AVAILABLE_MODULES = [
  { name: 'today', label: 'Today Dashboard', description: 'Daily overview and quick actions' },
  { name: 'tasks', label: 'Task Management', description: 'Todo lists and project tracking' },
  { name: 'calendar', label: 'Calendar', description: 'Event scheduling and planning' },
  { name: 'money', label: 'Personal Finance', description: 'Income and expense tracking' },
  { name: 'health', label: 'Health Tracker', description: 'Medical records and health metrics' },
  { name: 'fitness', label: 'Fitness Tracker', description: 'Workout and exercise logging' },
  { name: 'feed', label: 'Social Feed', description: 'Collaborative posts and team updates' },
  { name: 'social', label: 'Social Network', description: 'Social connections and interactions' },
  { name: 'love', label: 'Relationships', description: 'Personal relationship management' },
  { name: 'business', label: 'Business Management', description: 'Business operations and tracking' },
  { name: 'professional', label: 'Professional CRM', description: 'Sales pipeline and contact management' },
  { name: 'creators', label: 'Content Creation', description: 'Creator tools and analytics' },
  { name: 'crypto', label: 'Crypto Portfolio', description: 'Cryptocurrency tracking' },
  { name: 'stocks', label: 'Stock Portfolio', description: 'Stock market investments' },
  { name: 'news', label: 'News Feed', description: 'Personalized news and updates' },
];

interface SharedSpacesOnboardingProps {
  onComplete: () => void;
}

export const SharedSpacesOnboarding: React.FC<SharedSpacesOnboardingProps> = ({ onComplete }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<SpaceType>('individual');
  const [spaceName, setSpaceName] = useState('');
  const [spaceDescription, setSpaceDescription] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('private');
  const [joinApprovalRequired, setJoinApprovalRequired] = useState(true);
  const [discoverable, setDiscoverable] = useState(false);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [moduleSettings, setModuleSettings] = useState<Record<string, { shared: boolean; visibility: string }>>({});
  const [category, setCategory] = useState<string>('');
  const [location, setLocation] = useState('');
  const [pricingType, setPricingType] = useState<'free' | 'paid'>('free');
  const [priceAmount, setPriceAmount] = useState('');
  const [subscriptionInterval, setSubscriptionInterval] = useState<'monthly' | 'yearly'>('monthly');
  const [isCreating, setIsCreating] = useState(false);
  
  const { createGroup } = useOrganization();
  const { toast } = useToast();

  const handleTypeSelection = (type: SpaceType) => {
    setSelectedType(type);
    
    // Set default visibility based on type
    if (type === 'organization') {
      setVisibility('public');
      setDiscoverable(true);
    } else {
      setVisibility('private');
      setDiscoverable(false);
    }
    
    // Set default modules based on type
    const defaultModules = getDefaultModulesForType(type);
    setSelectedModules(defaultModules);
    
    // Set default module settings based on type
    const defaultSettings: Record<string, { shared: boolean; visibility: string }> = {};
    defaultModules.forEach(moduleName => {
      const moduleDefaults = getDefaultModuleSettingsForType(type, moduleName);
      defaultSettings[moduleName] = moduleDefaults;
    });
    setModuleSettings(defaultSettings);
    
    if (type === 'individual') {
      // Profile setup for individual
      setStep(2);
    } else {
      setStep(2);
    }
  };

  const handleModuleToggle = (moduleName: string) => {
    setSelectedModules(prev => {
      const newModules = prev.includes(moduleName)
        ? prev.filter(m => m !== moduleName)
        : [...prev, moduleName];
      
      // Set default settings for newly added modules
      if (!prev.includes(moduleName)) {
        const moduleDefaults = getDefaultModuleSettingsForType(selectedType, moduleName);
        setModuleSettings(prevSettings => ({
          ...prevSettings,
          [moduleName]: moduleDefaults
        }));
      } else {
        // Remove settings for removed modules
        setModuleSettings(prevSettings => {
          const newSettings = { ...prevSettings };
          delete newSettings[moduleName];
          return newSettings;
        });
      }
      
      return newModules;
    });
  };

  const handleModuleSettingChange = (moduleName: string, setting: 'shared' | 'visibility', value: boolean | string) => {
    setModuleSettings(prev => ({
      ...prev,
      [moduleName]: {
        ...prev[moduleName],
        [setting]: value
      }
    }));
  };

  const handleCreateSpace = async () => {
    setIsCreating(true);
    
    try {
      console.log('[Onboarding] Creating space, type:', selectedType);
      
      if (selectedType === 'individual') {
        // Create individual context - still needs an organization for the app to work
        const newSpace = await createGroup('Personal Space', 'individual', 'Your personal workspace');
        
        if (newSpace?.id) {
          // Update visibility settings
          await supabase
            .from('organizations')
            .update({
              visibility: 'private',
              discoverable: false,
              join_approval_required: false,
            })
            .eq('id', newSpace.id);
        }
        
        console.log('[Onboarding] Individual space created:', newSpace?.id);
        
        // Wait a moment for the database to update
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        toast({
          title: "Welcome to Kairos!",
          description: "Your personal workspace is ready.",
        });
        
        // Use React Router navigate instead of hard redirect
        navigate('/', { replace: true });
        return;
      }

      if (!spaceName.trim()) {
        toast({
          title: "Space name required",
          description: "Please enter a name for your space.",
          variant: "destructive",
        });
        setIsCreating(false);
        return;
      }

      const newSpace = await createGroup(spaceName, selectedType, spaceDescription);
      
      if (newSpace?.id) {
        // Update visibility settings and additional fields for the new space
        await supabase
          .from('organizations')
          .update({
            visibility,
            discoverable: visibility === 'public' && discoverable,
            join_approval_required: joinApprovalRequired,
            category: category || null,
            location: location || null,
            pricing_type: pricingType,
            price_amount_cents: pricingType === 'paid' ? Math.round(parseFloat(priceAmount || '0') * 100) : 0,
            subscription_interval: pricingType === 'paid' ? subscriptionInterval : null,
          })
          .eq('id', newSpace.id);
      }
      
      console.log('[Onboarding] Space created:', newSpace?.id);
      
      // Wait a moment for the database to update
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Space created successfully!",
        description: `Your ${selectedType} is ready to use.`,
      });
      
      // Use React Router navigate instead of hard redirect
      navigate('/', { replace: true });
    } catch (error) {
      console.error('[Onboarding] Error creating space:', error);
      toast({
        title: "Error creating space",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
      setIsCreating(false);
    }
  };

  if (step === 1) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-4xl mx-auto p-6">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">Welcome to Kairos</CardTitle>
              <CardDescription className="text-lg">
                Choose how you'd like to use Kairos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {SPACE_TYPES.map((type) => (
                  <Card
                    key={type.value}
                    className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-primary"
                    onClick={() => handleTypeSelection(type.value)}
                  >
                    <CardContent className="p-6 text-center">
                      <div className={`w-16 h-16 ${type.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                        <type.icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="font-semibold text-lg mb-2">{type.label}</h3>
                      <p className="text-muted-foreground text-sm">{type.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (step === 2 && selectedType === 'individual') {
    return (
      <ProfileSetupForm 
        onComplete={() => setStep(4)}
        onBack={() => setStep(1)}
      />
    );
  }

  if (step === 2) {
    const selectedTypeInfo = SPACE_TYPES.find(t => t.value === selectedType)!;
    
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-2xl mx-auto p-6">
          <Card>
            <CardHeader className="text-center">
              <div className={`w-16 h-16 ${selectedTypeInfo.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <selectedTypeInfo.icon className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl">{selectedTypeInfo.label}</CardTitle>
              <CardDescription>
                Set up your {selectedType} details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="spaceName">{selectedType === 'family' ? 'Family Name' : 'Space Name'}</Label>
                <Input
                  id="spaceName"
                  placeholder={`Enter your ${selectedType} name`}
                  value={spaceName}
                  onChange={(e) => setSpaceName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="spaceDescription">Description (Optional)</Label>
                <Textarea
                  id="spaceDescription"
                  placeholder="Describe your space's purpose"
                  value={spaceDescription}
                  onChange={(e) => setSpaceDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md"
                >
                  <option value="">Select a category</option>
                  <option value="business">Business</option>
                  <option value="non_profit">Non-Profit</option>
                  <option value="church">Church</option>
                  <option value="community">Community</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="dating">Dating</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location (Optional)</Label>
                <Input
                  id="location"
                  placeholder="City, Country"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={!spaceName.trim()}
                  className="px-8"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (step === 3) {
    return (
      <ProfileSetupForm 
        onComplete={() => setStep(4)}
        onBack={() => setStep(2)}
      />
    );
  }

  // Visibility and pricing settings step (step 4, only for non-individual)
  if (step === 4 && selectedType !== 'individual') {
    const selectedTypeInfo = SPACE_TYPES.find(t => t.value === selectedType)!;
    
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-2xl mx-auto p-6">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Space Settings</CardTitle>
              <CardDescription>
                Configure visibility and pricing for your space
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <RadioGroup value={visibility} onValueChange={(value: any) => setVisibility(value)}>
                <div className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-accent/50" onClick={() => setVisibility('private')}>
                  <RadioGroupItem value="private" id="private" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-muted-foreground" />
                      <Label htmlFor="private" className="text-base font-semibold cursor-pointer">
                        Private Space
                      </Label>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Invitation-only. Only people you invite can join this space.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-accent/50" onClick={() => setVisibility('public')}>
                  <RadioGroupItem value="public" id="public" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Globe className="w-5 h-5 text-muted-foreground" />
                      <Label htmlFor="public" className="text-base font-semibold cursor-pointer">
                        Public Space
                      </Label>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      People can discover and request to join this space.
                    </p>
                  </div>
                </div>
              </RadioGroup>

              {visibility === 'public' && (
                <>
                  <div className="space-y-4 p-4 bg-accent/20 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="discoverable" 
                        checked={discoverable}
                        onCheckedChange={(checked) => setDiscoverable(checked as boolean)}
                      />
                      <Label htmlFor="discoverable" className="cursor-pointer">
                        Make this space discoverable in public listings
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="approval" 
                        checked={joinApprovalRequired}
                        onCheckedChange={(checked) => setJoinApprovalRequired(checked as boolean)}
                      />
                      <Label htmlFor="approval" className="cursor-pointer">
                        Require approval for join requests
                      </Label>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Pricing</Label>
                    <RadioGroup value={pricingType} onValueChange={(value: any) => setPricingType(value)}>
                      <div className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-accent/50" onClick={() => setPricingType('free')}>
                        <RadioGroupItem value="free" id="free" />
                        <div className="flex-1">
                          <Label htmlFor="free" className="text-base font-semibold cursor-pointer">
                            Free
                          </Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            Anyone can join without payment
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-accent/50" onClick={() => setPricingType('paid')}>
                        <RadioGroupItem value="paid" id="paid" />
                        <div className="flex-1">
                          <Label htmlFor="paid" className="text-base font-semibold cursor-pointer">
                            Paid
                          </Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            Charge a membership fee
                          </p>
                        </div>
                      </div>
                    </RadioGroup>

                    {pricingType === 'paid' && (
                      <div className="space-y-4 p-4 bg-accent/20 rounded-lg">
                        <div className="space-y-2">
                          <Label htmlFor="price">Price (USD)</Label>
                          <Input
                            id="price"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="9.99"
                            value={priceAmount}
                            onChange={(e) => setPriceAmount(e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Billing Interval</Label>
                          <RadioGroup value={subscriptionInterval} onValueChange={(value: any) => setSubscriptionInterval(value)}>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="monthly" id="monthly" />
                              <Label htmlFor="monthly" className="cursor-pointer">Monthly</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="yearly" id="yearly" />
                              <Label htmlFor="yearly" className="cursor-pointer">Yearly</Label>
                            </div>
                          </RadioGroup>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={() => setStep(3)}
                >
                  Back
                </Button>
                <Button
                  onClick={() => setStep(5)}
                  className="px-8"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const finalStep = selectedType === 'individual' ? 4 : 5;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Choose Your Modules</CardTitle>
            <CardDescription>
              Select the features you need and configure sharing settings. You can always change these later.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              {AVAILABLE_MODULES.filter(module => {
                // Filter out feed module for individual spaces
                if (selectedType === 'individual' && module.name === 'feed') {
                  return false;
                }
                return true;
              }).map((module) => (
                <div
                  key={module.name}
                  className={`p-4 border rounded-lg transition-colors ${
                    selectedModules.includes(module.name)
                      ? 'border-primary bg-primary/5'
                      : 'border-border'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      checked={selectedModules.includes(module.name)}
                      onCheckedChange={() => handleModuleToggle(module.name)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium">{module.label}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{module.description}</p>
                      
                      {/* Module sharing settings - only show for non-individual types */}
                      {selectedModules.includes(module.name) && selectedType !== 'individual' && (
                        <div className="space-y-3 pt-3 border-t">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              checked={moduleSettings[module.name]?.shared || false}
                              onCheckedChange={(checked) => handleModuleSettingChange(module.name, 'shared', checked)}
                            />
                            <Label className="text-sm flex items-center gap-2">
                              <Share className="w-3 h-3" />
                              Shared with all members
                            </Label>
                          </div>
                          
                          {!moduleSettings[module.name]?.shared && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Lock className="w-3 h-3" />
                              <span>Private to admins only</span>
                            </div>
                          )}
                          
                          {moduleSettings[module.name]?.shared && (
                            <div className="flex items-center gap-2 text-sm">
                              <Label>Visibility:</Label>
                              <select
                                value={moduleSettings[module.name]?.visibility || 'all_members'}
                                onChange={(e) => handleModuleSettingChange(module.name, 'visibility', e.target.value)}
                                className="border rounded px-2 py-1 text-sm bg-background"
                              >
                                <option value="all_members">All Members</option>
                                <option value="admin_only">Admins Only</option>
                              </select>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Selected Modules</h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedModules.map((moduleName) => {
                      const module = AVAILABLE_MODULES.find(m => m.name === moduleName);
                      const isShared = moduleSettings[moduleName]?.shared;
                      return (
                        <Badge key={moduleName} variant="secondary" className="flex items-center gap-1">
                          {module?.label}
                          {selectedType !== 'individual' && (
                            isShared ? <Share className="w-3 h-3" /> : <Lock className="w-3 h-3" />
                          )}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => selectedType === 'individual' ? setStep(3) : setStep(4)}
              >
                Back
              </Button>
              <Button
                onClick={handleCreateSpace}
                disabled={isCreating || selectedModules.length === 0}
                className="px-8"
              >
                {isCreating ? 'Creating...' : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    {selectedType === 'individual' ? 'Continue' : 'Create Space'}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

function getDefaultModulesForType(type: SpaceType): string[] {
  switch (type) {
    case 'individual':
      return ['today', 'tasks', 'calendar', 'money', 'health', 'fitness', 'news'];
    case 'family':
      return ['today', 'tasks', 'calendar', 'money', 'fitness', 'feed', 'news'];
    case 'team':
    case 'project':
      return ['today', 'tasks', 'calendar', 'professional', 'creators', 'feed'];
    case 'organization':
      return ['today', 'tasks', 'calendar', 'professional', 'business', 'money', 'creators', 'feed'];
    default:
      return ['today', 'tasks', 'calendar'];
  }
}

function getDefaultModuleSettingsForType(type: SpaceType, moduleName: string): { shared: boolean; visibility: string } {
  switch (type) {
    case 'individual':
      return { shared: false, visibility: 'private' };
    
    case 'family':
      // Family groups share most modules
      if (['money', 'fitness', 'news'].includes(moduleName)) {
        return { shared: true, visibility: 'all_members' };
      }
      return { shared: false, visibility: 'private' };
    
    case 'team':
    case 'project':
      // Team/project groups share work-related modules
      if (['tasks', 'calendar', 'professional', 'creators', 'business'].includes(moduleName)) {
        return { shared: true, visibility: 'all_members' };
      }
      return { shared: false, visibility: 'private' };
    
    case 'organization':
      // Organizations have admin-controlled sharing
      if (['tasks', 'calendar', 'creators'].includes(moduleName)) {
        return { shared: true, visibility: 'all_members' };
      }
      if (['professional', 'business', 'money', 'crypto', 'stocks'].includes(moduleName)) {
        return { shared: true, visibility: 'admin_only' };
      }
      return { shared: false, visibility: 'private' };
    
    default:
      return { shared: true, visibility: 'all_members' };
  }
}