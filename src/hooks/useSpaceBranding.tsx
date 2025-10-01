import { useEffect } from 'react';
import { useOrganization } from './useOrganization';

interface BrandColors {
  primary?: string;
  secondary?: string;
  accent?: string;
  background?: string;
  text?: string;
}

interface SpaceBranding {
  brand_colors?: BrandColors;
  background_image_url?: string;
  typography?: {
    font?: string;
  };
}

// Convert hex to HSL
function hexToHSL(hex: string): string {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  h = Math.round(h * 360);
  s = Math.round(s * 100);
  const lightness = Math.round(l * 100);

  return `${h} ${s}% ${lightness}%`;
}

export function useSpaceBranding() {
  const { activeContext } = useOrganization();

  useEffect(() => {
    if (!activeContext?.settings) return;

    const settings = activeContext.settings as SpaceBranding;
    const brandColors = settings.brand_colors;
    const backgroundImage = settings.background_image_url;
    const typography = settings.typography;

    // Apply brand colors as CSS custom properties
    if (brandColors) {
      const root = document.documentElement;
      
      if (brandColors.primary) {
        root.style.setProperty('--space-primary', hexToHSL(brandColors.primary));
        root.style.setProperty('--primary', hexToHSL(brandColors.primary));
      }
      
      if (brandColors.secondary) {
        root.style.setProperty('--space-secondary', hexToHSL(brandColors.secondary));
        root.style.setProperty('--secondary', hexToHSL(brandColors.secondary));
      }
      
      if (brandColors.accent) {
        root.style.setProperty('--space-accent', hexToHSL(brandColors.accent));
        root.style.setProperty('--accent', hexToHSL(brandColors.accent));
      }
      
      if (brandColors.background) {
        root.style.setProperty('--space-background', hexToHSL(brandColors.background));
      }
      
      if (brandColors.text) {
        root.style.setProperty('--space-text', hexToHSL(brandColors.text));
      }
    }

    // Apply background image
    if (backgroundImage) {
      document.body.style.backgroundImage = `url(${backgroundImage})`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundAttachment = 'fixed';
      document.body.style.backgroundPosition = 'center';
    } else {
      document.body.style.backgroundImage = '';
    }

    // Apply typography
    if (typography?.font) {
      document.documentElement.style.setProperty('--space-font', typography.font);
      document.body.style.fontFamily = typography.font;
    }

    // Cleanup function to reset when context changes
    return () => {
      const root = document.documentElement;
      root.style.removeProperty('--space-primary');
      root.style.removeProperty('--space-secondary');
      root.style.removeProperty('--space-accent');
      root.style.removeProperty('--space-background');
      root.style.removeProperty('--space-text');
      root.style.removeProperty('--space-font');
      document.body.style.backgroundImage = '';
      document.body.style.fontFamily = '';
    };
  }, [activeContext]);

  return {
    brandColors: activeContext?.settings?.brand_colors as BrandColors | undefined,
    backgroundImage: activeContext?.settings?.background_image_url as string | undefined,
    typography: activeContext?.settings?.typography as { font?: string } | undefined,
  };
}
