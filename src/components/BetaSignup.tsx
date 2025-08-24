import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const BetaSignup = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleBetaSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.functions.invoke('beta-signup', {
        body: { email, name }
      });

      if (error) throw error;

      toast({
        title: "Thanks for your interest!",
        description: "We'll contact you when beta access is available.",
      });
      
      setEmail("");
      setName("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit beta request",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-bold">Request Beta Access</CardTitle>
        <CardDescription>
          Join our waitlist to get early access to Kairos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleBetaSignup} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="beta-name">Name</Label>
            <Input
              id="beta-name"
              type="text"
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="beta-email">Email</Label>
            <Input
              id="beta-email"
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Submitting..." : "Request Beta Access"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default BetaSignup;