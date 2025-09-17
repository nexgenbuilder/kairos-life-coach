import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SharedSpacesOnboarding } from '@/components/organization/SharedSpacesOnboarding';
import { useAuth } from '@/hooks/useAuth';

const SignupPage = () => {
  const [step, setStep] = useState<'auth' | 'onboarding'>('auth');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [betaPassword, setBetaPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // If user is already authenticated, go to onboarding
    if (user) {
      setStep('onboarding');
    }
  }, [user]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate beta password first
      const { data: validation, error: validateError } = await supabase.functions.invoke('validate-beta-password', {
        body: { betaPassword }
      });

      if (validateError || !validation?.valid) {
        throw new Error('Invalid beta password. Please contact support for access.');
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/signup`,
          data: {
            full_name: fullName,
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Account created successfully!",
        description: "Please check your email to confirm your account before continuing.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingComplete = () => {
    navigate('/dashboard');
  };

  if (step === 'onboarding' && user) {
    return <SharedSpacesOnboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-secondary/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-primary-gradient rounded-lg flex items-center justify-center mx-auto mb-4 shadow-glow-soft">
            <span className="text-white font-bold text-xl">K</span>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Join Kairos
          </CardTitle>
          <CardDescription>
            Create your account and set up your workspace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm">
              <p className="font-medium text-blue-900 dark:text-blue-100 mb-2">🚀 Beta Access Required</p>
              <p className="text-blue-700 dark:text-blue-300">
                Kairos is currently in private beta. You need a beta access code to create an account.
              </p>
            </div>
            
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="beta-code">Beta Access Code</Label>
                <Input
                  id="beta-code"
                  type="password"
                  placeholder="Enter your beta access code"
                  value={betaPassword}
                  onChange={(e) => setBetaPassword(e.target.value)}
                  required
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
                  required
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
                  required
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
                  required
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating account..." : "Create Account & Continue"}
              </Button>
            </form>
            
            <div className="text-center pt-4">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/auth')}>
                  Sign in
                </Button>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignupPage;