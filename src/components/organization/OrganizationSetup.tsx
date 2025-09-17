import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Building2, Users, Settings } from 'lucide-react';
import { useOrganization } from '@/hooks/useOrganization';
import { useToast } from '@/components/ui/use-toast';

const AVAILABLE_MODULES = [
  { name: 'professional', label: 'Professional CRM', description: 'Sales pipeline and contact management' },
  { name: 'tasks', label: 'Task Management', description: 'Todo lists and project tracking' },
  { name: 'calendar', label: 'Calendar', description: 'Event scheduling and planning' },
  { name: 'money', label: 'Personal Finance', description: 'Income and expense tracking' },
  { name: 'health', label: 'Health Tracker', description: 'Medical records and health metrics' },
  { name: 'fitness', label: 'Fitness Tracker', description: 'Workout and exercise logging' },
  { name: 'creators', label: 'Content Creation', description: 'Creator tools and analytics' },
  { name: 'crypto', label: 'Crypto Portfolio', description: 'Cryptocurrency tracking' },
  { name: 'stocks', label: 'Stock Portfolio', description: 'Stock market investments' },
  { name: 'news', label: 'News Feed', description: 'Personalized news and updates' },
];

interface OrganizationSetupProps {
  onComplete: () => void;
}

export const OrganizationSetup: React.FC<OrganizationSetupProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [orgName, setOrgName] = useState('');
  const [orgDescription, setOrgDescription] = useState('');
  const [selectedModules, setSelectedModules] = useState<string[]>(['professional', 'tasks', 'calendar']);
  const [isCreating, setIsCreating] = useState(false);
  
  const { createOrganization } = useOrganization();
  const { toast } = useToast();

  const handleModuleToggle = (moduleName: string) => {
    setSelectedModules(prev => 
      prev.includes(moduleName)
        ? prev.filter(m => m !== moduleName)
        : [...prev, moduleName]
    );
  };

  const handleCreateOrganization = async () => {
    if (!orgName.trim()) {
      toast({
        title: "Organization name required",
        description: "Please enter a name for your organization.",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      await createOrganization(orgName, orgDescription);
      
      toast({
        title: "Organization created successfully!",
        description: "You can now start using your modules.",
      });
      
      onComplete();
    } catch (error) {
      console.error('Error creating organization:', error);
      toast({
        title: "Error creating organization",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  if (step === 1) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardHeader className="text-center">
            <Building2 className="w-12 h-12 mx-auto mb-4 text-primary" />
            <CardTitle className="text-2xl">Welcome to Your Organization</CardTitle>
            <CardDescription>
              Set up your organization to get started with team collaboration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="orgName">Organization Name</Label>
              <Input
                id="orgName"
                placeholder="Enter your organization name"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="orgDescription">Description (Optional)</Label>
              <Textarea
                id="orgDescription"
                placeholder="Describe your organization"
                value={orgDescription}
                onChange={(e) => setOrgDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                onClick={() => setStep(2)}
                disabled={!orgName.trim()}
                className="px-8"
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader className="text-center">
          <Settings className="w-12 h-12 mx-auto mb-4 text-primary" />
          <CardTitle className="text-2xl">Choose Your Modules</CardTitle>
          <CardDescription>
            Select the features your organization needs. You can always change these later.
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
              onClick={() => setStep(1)}
            >
              Back
            </Button>
            <Button
              onClick={handleCreateOrganization}
              disabled={isCreating || selectedModules.length === 0}
              className="px-8"
            >
              {isCreating ? 'Creating...' : 'Create Organization'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};