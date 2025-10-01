import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Building2, 
  Heart, 
  FolderOpen,
  ArrowRight,
  ArrowLeft,
  Check,
  Share,
  Lock,
  Sparkles
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/hooks/useOrganization';
import { useToast } from '@/hooks/use-toast';

type GroupType = 'individual' | 'family' | 'team' | 'organization' | 'project';

const GROUP_TYPES = [
  {
    value: 'individual' as GroupType,
    label: 'Continue as Individual',
    description: 'Private Life OS just for you',
    icon: Users,
    color: 'bg-blue-500',
  },
  {
    value: 'family' as GroupType,
    label: 'Create a Family Group',
    description: 'Share calendars, budgets, and plans with family',
    icon: Heart,
    color: 'bg-pink-500',
  },
  {
    value: 'team' as GroupType,
    label: 'Create a Team',
    description: 'Collaborate on projects with friends or colleagues',
    icon: Users,
    color: 'bg-green-500',
  },
  {
    value: 'organization' as GroupType,
    label: 'Create an Organization',
    description: 'Business with structured roles and admin controls',
    icon: Building2,
    color: 'bg-purple-500',
  },
  {
    value: 'project' as GroupType,
    label: 'Create a Project Group',
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
  { name: 'social', label: 'Social Network', description: 'Social connections and interactions' },
  { name: 'love', label: 'Relationships', description: 'Personal relationship management' },
  { name: 'business', label: 'Business Management', description: 'Business operations and tracking' },
  { name: 'professional', label: 'Professional CRM', description: 'Sales pipeline and contact management' },
  { name: 'creators', label: 'Content Creation', description: 'Creator tools and analytics' },
  { name: 'crypto', label: 'Crypto Portfolio', description: 'Cryptocurrency tracking' },
  { name: 'stocks', label: 'Stock Portfolio', description: 'Stock market investments' },
  { name: 'news', label: 'News Feed', description: 'Personalized news and updates' },
  { name: 'cloud', label: 'Cloud Storage', description: 'Shared file storage' },
];

export const UnifiedSignupFlow = () => {
  const navigate = useNavigate();
  const { createGroup } = useOrganization();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Account creation
  const [betaPassword, setBetaPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Step 2: Group type selection
  const [selectedType, setSelectedType] = useState<GroupType>('individual');

  // Step 3: Group details
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');

  // Step 4: Module selection
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [moduleSettings, setModuleSettings] = useState<Record<string, { shared: boolean; visibility: string }>>({});

  const getDefaultModules = (type: GroupType): string[] => {
    const baseModules = ['today', 'tasks', 'calendar'];
    
    switch (type) {
      case 'individual':
        return [...baseModules, 'money', 'health', 'fitness'];
      case 'family':
        return [...baseModules, 'money', 'health', 'connections'];
      case 'team':
      case 'project':
        return [...baseModules, 'professional', 'cloud'];
      case 'organization':
        return [...baseModules, 'professional', 'business', 'cloud'];
      default:
        return baseModules;
    }
  };

  const getDefaultSettings = (type: GroupType, moduleName: string) => {
    if (type === 'individual') {
      return { shared: false, visibility: 'private' };
    }
    
    const sharedByDefault = ['calendar', 'tasks', 'cloud', 'professional', 'business'];
    return {
      shared: sharedByDefault.includes(moduleName),
      visibility: sharedByDefault.includes(moduleName) ? 'all_members' : 'private'
    };
  };

  const handleAccountCreation = async () => {
    setLoading(true);
    try {
      // Validate beta password
      const { data: validation, error: validateError } = await supabase.functions.invoke('validate-beta-password', {
        body: { betaPassword }
      });

      if (validateError || !validation?.valid) {
        throw new Error('Invalid beta password. Please contact support for access.');
      }

      // Create account
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: { full_name: fullName }
        }
      });

      if (error) throw error;

      toast({
        title: "Account created!",
        description: "Please check your email to confirm your account."
      });

      setStep(2);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTypeSelection = (type: GroupType) => {
    setSelectedType(type);
    const defaultModules = getDefaultModules(type);
    setSelectedModules(defaultModules);
    
    const settings: Record<string, { shared: boolean; visibility: string }> = {};
    defaultModules.forEach(mod => {
      settings[mod] = getDefaultSettings(type, mod);
    });
    setModuleSettings(settings);

    if (type === 'individual') {
      // Skip group details for individual
      setStep(4);
    } else {
      setStep(3);
    }
  };

  const handleModuleToggle = (moduleName: string) => {
    if (selectedModules.includes(moduleName)) {
      setSelectedModules(selectedModules.filter(m => m !== moduleName));
    } else {
      setSelectedModules([...selectedModules, moduleName]);
      setModuleSettings({
        ...moduleSettings,
        [moduleName]: getDefaultSettings(selectedType, moduleName)
      });
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      if (selectedType === 'individual') {
        // Create individual context
        await createGroup('My Workspace', 'individual', 'Personal workspace');
      } else {
        // Create group
        await createGroup(groupName, selectedType, groupDescription);
      }

      toast({
        title: "Setup complete!",
        description: "Welcome to Kairos"
      });

      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-secondary/20 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-primary-gradient rounded-lg flex items-center justify-center mx-auto mb-4 shadow-glow-soft">
            <Sparkles className="text-white h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold bg-hero-gradient bg-clip-text text-transparent">
            {step === 1 && "Create Your Account"}
            {step === 2 && "Choose Your Setup"}
            {step === 3 && "Group Details"}
            {step === 4 && "Select Modules"}
          </CardTitle>
          <CardDescription>
            {step === 1 && "Join Kairos and start organizing your life"}
            {step === 2 && "How would you like to use Kairos?"}
            {step === 3 && `Set up your ${selectedType}`}
            {step === 4 && "Choose which modules to enable"}
          </CardDescription>
          <div className="flex justify-center space-x-2 mt-4">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-2 w-12 rounded-full transition-colors ${
                  s <= step ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </CardHeader>

        <CardContent>
          {/* Step 1: Account Creation */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm">
                <p className="font-medium text-blue-900 dark:text-blue-100 mb-2">🚀 Beta Access Required</p>
                <p className="text-blue-700 dark:text-blue-300">
                  Kairos is currently in private beta. You need a beta access code to create an account.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="beta-code">Beta Access Code</Label>
                <Input
                  id="beta-code"
                  type="password"
                  placeholder="Enter your beta access code"
                  value={betaPassword}
                  onChange={(e) => setBetaPassword(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="full-name">Full Name</Label>
                <Input
                  id="full-name"
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <Button 
                onClick={handleAccountCreation} 
                className="w-full" 
                disabled={loading || !betaPassword || !fullName || !email || !password}
              >
                {loading ? "Creating account..." : "Create Account & Continue"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <div className="text-center pt-4">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/auth')}>
                    Sign in
                  </Button>
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Group Type Selection */}
          {step === 2 && (
            <div className="space-y-4">
              {GROUP_TYPES.map((type) => {
                const Icon = type.icon;
                return (
                  <Button
                    key={type.value}
                    variant="outline"
                    className="w-full h-auto p-4 justify-start hover:border-primary"
                    onClick={() => handleTypeSelection(type.value)}
                  >
                    <div className={`${type.color} p-3 rounded-lg mr-4`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">{type.label}</div>
                      <div className="text-sm text-muted-foreground">{type.description}</div>
                    </div>
                  </Button>
                );
              })}
            </div>
          )}

          {/* Step 3: Group Details */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="group-name">{selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} Name</Label>
                <Input
                  id="group-name"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder={`Enter ${selectedType} name`}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="group-description">Description (optional)</Label>
                <Textarea
                  id="group-description"
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  placeholder="Describe the purpose of this group"
                />
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setStep(2)} className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button onClick={() => setStep(4)} disabled={!groupName} className="w-full">
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Module Selection */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto">
                {AVAILABLE_MODULES.map((module) => {
                  const isSelected = selectedModules.includes(module.name);
                  const settings = moduleSettings[module.name];
                  
                  return (
                    <div
                      key={module.name}
                      className={`border rounded-lg p-3 transition-colors ${
                        isSelected ? 'border-primary bg-primary/5' : 'border-border'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleModuleToggle(module.name)}
                          />
                          <div className="flex-1">
                            <div className="font-medium">{module.label}</div>
                            <div className="text-sm text-muted-foreground">{module.description}</div>
                            
                            {isSelected && selectedType !== 'individual' && settings && (
                              <div className="flex items-center space-x-2 mt-2">
                                {settings.shared ? (
                                  <Badge variant="secondary" className="text-xs">
                                    <Share className="h-3 w-3 mr-1" />
                                    Shared
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-xs">
                                    <Lock className="h-3 w-3 mr-1" />
                                    Private
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setStep(selectedType === 'individual' ? 2 : 3)} 
                  className="w-full"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button 
                  onClick={handleComplete} 
                  disabled={loading || selectedModules.length === 0}
                  className="w-full"
                >
                  {loading ? "Setting up..." : "Complete Setup"}
                  <Check className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
