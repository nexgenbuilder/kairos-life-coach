import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Users, 
  Building2, 
  Heart, 
  Briefcase, 
  FolderOpen,
  ArrowRight,
  Check
} from 'lucide-react';
import { useOrganization } from '@/hooks/useOrganization';
import { useToast } from '@/components/ui/use-toast';

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
];

interface SharedSpacesOnboardingProps {
  onComplete: () => void;
}

export const SharedSpacesOnboarding: React.FC<SharedSpacesOnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<GroupType>('individual');
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  
  const { createGroup } = useOrganization();
  const { toast } = useToast();

  const handleTypeSelection = (type: GroupType) => {
    setSelectedType(type);
    
    // Set default modules based on type
    const defaultModules = getDefaultModulesForType(type);
    setSelectedModules(defaultModules);
    
    if (type === 'individual') {
      // Skip name/description for individual
      setStep(3);
    } else {
      setStep(2);
    }
  };

  const handleModuleToggle = (moduleName: string) => {
    setSelectedModules(prev => 
      prev.includes(moduleName)
        ? prev.filter(m => m !== moduleName)
        : [...prev, moduleName]
    );
  };

  const handleCreateGroup = async () => {
    setIsCreating(true);
    
    try {
      if (selectedType === 'individual') {
        // Individual context already created during signup
        onComplete();
        return;
      }

      if (!groupName.trim()) {
        toast({
          title: "Group name required",
          description: "Please enter a name for your group.",
          variant: "destructive",
        });
        return;
      }

      await createGroup(groupName, selectedType, groupDescription);
      
      toast({
        title: "Group created successfully!",
        description: `Your ${selectedType} is ready to use.`,
      });
      
      onComplete();
    } catch (error) {
      console.error('Error creating group:', error);
      toast({
        title: "Error creating group",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
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
              {GROUP_TYPES.map((type) => (
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

  if (step === 2) {
    const selectedTypeInfo = GROUP_TYPES.find(t => t.value === selectedType)!;
    
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
              <Label htmlFor="groupName">{selectedType === 'family' ? 'Family Name' : 'Group Name'}</Label>
              <Input
                id="groupName"
                placeholder={`Enter your ${selectedType} name`}
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="groupDescription">Description (Optional)</Label>
              <Textarea
                id="groupDescription"
                placeholder="Describe your group's purpose"
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
                rows={3}
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
                disabled={!groupName.trim()}
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

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Choose Your Modules</CardTitle>
          <CardDescription>
            Select the features you need. You can always change these later.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {AVAILABLE_MODULES.map((module) => (
              <div
                key={module.name}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedModules.includes(module.name)
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => handleModuleToggle(module.name)}
              >
                <div className="flex items-start space-x-3">
                  <Checkbox
                    checked={selectedModules.includes(module.name)}
                    onChange={() => handleModuleToggle(module.name)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium">{module.label}</h3>
                    <p className="text-sm text-muted-foreground">{module.description}</p>
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
                    return (
                      <Badge key={moduleName} variant="secondary">
                        {module?.label}
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
              onClick={() => selectedType === 'individual' ? setStep(1) : setStep(2)}
            >
              Back
            </Button>
            <Button
              onClick={handleCreateGroup}
              disabled={isCreating || selectedModules.length === 0}
              className="px-8"
            >
              {isCreating ? 'Creating...' : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  {selectedType === 'individual' ? 'Continue' : 'Create Group'}
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

function getDefaultModulesForType(type: GroupType): string[] {
  switch (type) {
    case 'individual':
      return ['today', 'tasks', 'calendar', 'money', 'health', 'fitness', 'news'];
    case 'family':
      return ['today', 'tasks', 'calendar', 'money', 'fitness', 'news'];
    case 'team':
    case 'project':
      return ['today', 'tasks', 'calendar', 'professional', 'creators'];
    case 'organization':
      return ['today', 'tasks', 'calendar', 'professional', 'business', 'money', 'creators'];
    default:
      return ['today', 'tasks', 'calendar'];
  }
}