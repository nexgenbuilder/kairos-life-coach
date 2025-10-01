import React from 'react';
import { Github, Twitter, Mail, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export function FooterSection() {
  const navigate = useNavigate();

  const footerLinks = {
    Product: [
      { label: 'Features', href: '#features' },
      { label: 'Modules', href: '#modules' },
      { label: 'AI Capabilities', href: '#ai' },
      { label: 'Pricing', href: '#pricing' },
    ],
    Company: [
      { label: 'About', action: () => {} },
      { label: 'Blog', action: () => {} },
      { label: 'Careers', action: () => {} },
      { label: 'Contact', action: () => {} },
    ],
    Resources: [
      { label: 'Documentation', action: () => {} },
      { label: 'Help Center', action: () => {} },
      { label: 'Community', action: () => {} },
      { label: 'Status', action: () => {} },
    ],
    Legal: [
      { label: 'Privacy', action: () => {} },
      { label: 'Terms', action: () => {} },
      { label: 'Security', action: () => {} },
      { label: 'Cookies', action: () => {} },
    ],
  };

  const handleLinkClick = (href?: string, action?: () => void) => {
    if (href?.startsWith('#')) {
      const element = document.getElementById(href.slice(1));
      element?.scrollIntoView({ behavior: 'smooth' });
    } else if (action) {
      action();
    }
  };

  return (
    <footer className="border-t border-border bg-card/30 backdrop-blur-sm">
      <div className="container mx-auto px-6 py-16">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-12 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-gradient rounded-xl flex items-center justify-center shadow-glow-soft">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-bold text-2xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Kairos
              </h3>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
              The AI-powered life operating system that helps you manage everything through simple conversation.
            </p>
            <div className="flex gap-3">
              <Button variant="ghost" size="icon" className="rounded-full">
                <Twitter className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Github className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Mail className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="space-y-4">
              <h4 className="font-semibold text-foreground">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Button
                      variant="link"
                      className="p-0 h-auto text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => handleLinkClick(link.href, link.action)}
                    >
                      {link.label}
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2025 Kairos. All rights reserved. Your AI-powered life operating system.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-red-500 fill-red-500 animate-pulse" />
              <span>for productivity</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
