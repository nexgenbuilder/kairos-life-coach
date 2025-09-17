import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HeroSection } from '@/components/HeroSection';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <header className="p-4 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-gradient rounded-lg flex items-center justify-center shadow-glow-soft">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <h1 className="font-bold text-lg bg-hero-gradient bg-clip-text text-transparent">
              Kairos
            </h1>
          </div>
          <Button onClick={() => navigate('/auth')} variant="outline">
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero section */}
      <div className="border-b border-border">
        <HeroSection />
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 backdrop-blur-sm p-6">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>&copy; 2024 Kairos. Your AI-powered life operating system.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;