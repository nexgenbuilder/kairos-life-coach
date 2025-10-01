import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogIn, UserPlus, Mail, Lock, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function AccessSection() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');

  const handleBetaRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('beta-signup', {
        body: { email }
      });

      if (error) throw error;

      toast({
        title: "Request submitted!",
        description: "We'll send you a beta access code soon.",
      });
      setEmail('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="access" className="py-24 bg-gradient-to-b from-background to-primary/5">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold">
            Ready to get{' '}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              started?
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join the private beta and experience the future of life management
          </p>
        </div>

        <Card className="max-w-2xl mx-auto p-8 bg-gradient-to-br from-card to-primary/5 border-2 border-primary/20">
          <Tabs defaultValue="beta" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="beta">
                <Sparkles className="h-4 w-4 mr-2" />
                Beta Access
              </TabsTrigger>
              <TabsTrigger value="signup">
                <UserPlus className="h-4 w-4 mr-2" />
                Sign Up
              </TabsTrigger>
              <TabsTrigger value="login">
                <LogIn className="h-4 w-4 mr-2" />
                Log In
              </TabsTrigger>
            </TabsList>

            <TabsContent value="beta" className="space-y-6">
              <div className="text-center space-y-2 mb-6">
                <h3 className="text-2xl font-bold">Request Beta Access</h3>
                <p className="text-muted-foreground">
                  We'll send you an access code to get started
                </p>
              </div>
              <form onSubmit={handleBetaRequest} className="space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : 'Request Access'}
                </Button>
              </form>
              <p className="text-sm text-muted-foreground text-center">
                Already have an access code?{' '}
                <Button 
                  variant="link" 
                  className="p-0 h-auto"
                  onClick={() => navigate('/signup')}
                >
                  Sign up here
                </Button>
              </p>
            </TabsContent>

            <TabsContent value="signup" className="space-y-6">
              <div className="text-center space-y-2 mb-6">
                <h3 className="text-2xl font-bold">Create Your Account</h3>
                <p className="text-muted-foreground">
                  You'll need a beta access code to sign up
                </p>
              </div>
              <Button 
                className="w-full" 
                size="lg"
                onClick={() => navigate('/signup')}
              >
                Continue to Sign Up
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                Don't have an access code?{' '}
                <Button 
                  variant="link" 
                  className="p-0 h-auto"
                  onClick={() => document.getElementById('access')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Request access
                </Button>
              </p>
            </TabsContent>

            <TabsContent value="login" className="space-y-6">
              <div className="text-center space-y-2 mb-6">
                <h3 className="text-2xl font-bold">Welcome Back</h3>
                <p className="text-muted-foreground">
                  Sign in to continue to your dashboard
                </p>
              </div>
              <Button 
                className="w-full" 
                size="lg"
                onClick={() => navigate('/auth')}
              >
                Continue to Log In
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                New to Kairos?{' '}
                <Button 
                  variant="link" 
                  className="p-0 h-auto"
                  onClick={() => navigate('/signup')}
                >
                  Create an account
                </Button>
              </p>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Beta Info */}
        <div className="mt-12 text-center">
          <Card className="inline-block p-6 bg-muted/50 border-border">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">🚀 Private Beta:</span> Kairos is currently in private beta. 
              Limited spots available for early adopters.
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
}
