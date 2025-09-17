import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Mail, Send, CheckCircle } from "lucide-react";

const BetaSignup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
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
      
      setSubmitted(true);
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

  if (submitted) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold">Request Submitted!</h3>
              <p className="text-muted-foreground">
                Thanks for your interest! We'll notify you when beta access becomes available.
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setSubmitted(false)}
              className="w-full"
            >
              Submit Another Request
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
          <Mail className="w-6 h-6 text-white" />
        </div>
        <CardTitle className="text-xl">Request Beta Access</CardTitle>
        <CardDescription>
          Join the waitlist to get early access to Kairos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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
            {loading ? "Submitting..." : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Request Access
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default BetaSignup;