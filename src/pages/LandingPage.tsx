import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeroSection } from '@/components/HeroSection';
import { SmartChatInterface } from '@/components/chat/SmartChatInterface';
import { useAuth } from '@/hooks/useAuth';

const LandingPage = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    console.log('[LandingPage] Loading:', loading, 'User:', !!user);
    
    if (!loading && user) {
      console.log('[LandingPage] User authenticated, redirecting to /dashboard');
      navigate("/dashboard", { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const scrollToChat = () => {
    const chatElement = document.getElementById('chat-section');
    if (chatElement) {
      chatElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Hero section */}
      <div className="border-b border-border">
        <HeroSection onStartChat={scrollToChat} />
      </div>

      {/* Chat section */}
      <div id="chat-section" className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto p-6">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold mb-2">Try Kairos AI</h2>
            <p className="text-muted-foreground">
              Experience the power of conversational AI for managing your life
            </p>
          </div>
          <SmartChatInterface />
        </div>
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