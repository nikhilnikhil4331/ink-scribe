import React from 'react';
import { LandingHeader } from './LandingHeader';
import { HeroSection } from './HeroSection';
import { SocialProofSection } from './SocialProofSection';
import { HowItWorksSection } from './HowItWorksSection';
import { FeatureShowcase } from './FeatureShowcase';
import { PreviewSection } from './PreviewSection';
import { PricingTeaser } from './PricingTeaser';
import { FAQSection } from './FAQSection';
import { CTASection } from './CTASection';
import { DisclaimerBanner } from './DisclaimerBanner';
import { LandingFooter } from './LandingFooter';

interface LandingPageProps {
  isDark: boolean;
  onToggleDark: () => void;
  onStartWriting: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  isDark,
  onToggleDark,
  onStartWriting,
}) => {
  const handlePreviewNotes = () => {
    const previewSection = document.getElementById('preview-section');
    if (previewSection) {
      previewSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader 
        isDark={isDark} 
        onToggleDark={onToggleDark}
        onStartWriting={onStartWriting}
      />
      
      <main className="pt-16">
        <HeroSection 
          onStartWriting={onStartWriting}
          onPreviewNotes={handlePreviewNotes}
        />
        
        <SocialProofSection />
        
        <HowItWorksSection />
        
        <FeatureShowcase />
        
        <div id="preview-section">
          <PreviewSection />
        </div>
        
        <PricingTeaser />
        
        <FAQSection />
        
        <CTASection onStartWriting={onStartWriting} />
        
        <DisclaimerBanner />
        
        <LandingFooter />
      </main>
    </div>
  );
};
