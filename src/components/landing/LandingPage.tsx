import React from 'react';
import { LandingHeader } from './LandingHeader';
import { HeroSection } from './HeroSection';
import { HowItWorksSection } from './HowItWorksSection';
import { FeatureShowcase } from './FeatureShowcase';
import { PreviewSection } from './PreviewSection';
import { PricingTeaser } from './PricingTeaser';
import { FAQSection } from './FAQSection';
import { CTASection } from './CTASection';
import { DisclaimerBanner } from './DisclaimerBanner';
import { LandingFooter } from './LandingFooter';
import { ReferralWidget } from '@/components/promotion/ReferralWidget';

/**
 * Unified NikNote landing experience (served at /welcome and /landing).
 *
 * Design principles: real product capabilities over fake statistics,
 * meaningful scroll reveals over forced transitions, one restrained accent,
 * paper-and-ink identity.
 *
 * Intentionally NOT composed here anymore (invented social proof / pressure
 * patterns — see AGENT-TUNEUP notes):
 *   SocialProofSection (fabricated testimonials), UrgencyTimer, LiveActivityFeed
 *   (simulated "activity" toasts), ExitIntentPopup, MobilePremiumBar.
 */
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
    const el = document.getElementById('how-it-works');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/20">
      <LandingHeader isDark={isDark} onToggleDark={onToggleDark} onStartWriting={onStartWriting} />

      <main>
        <HeroSection onStartWriting={onStartWriting} onPreviewNotes={handlePreviewNotes} />

        <HowItWorksSection />

        <FeatureShowcase />

        <PreviewSection />

        <PricingTeaser />

        <section className="container mx-auto px-4 lg:px-6 pb-8">
          <ReferralWidget variant="card" />
        </section>

        <FAQSection />

        <CTASection onStartWriting={onStartWriting} />
      </main>

      <DisclaimerBanner />
      <LandingFooter />
    </div>
  );
};
