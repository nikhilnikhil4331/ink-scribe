import React from 'react';
import { LandingHeader } from './LandingHeader';
import { HeroSection } from './HeroSection';
import { FeatureShowcase } from './FeatureShowcase';
import { PreviewSection } from './PreviewSection';
import { CTASection } from './CTASection';

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
    // Scroll to preview section
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
        
        <FeatureShowcase />
        
        <div id="preview-section">
          <PreviewSection />
        </div>
        
        <CTASection onStartWriting={onStartWriting} />
        
        {/* Footer */}
        <footer className="py-8 border-t border-border/50">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                © 2024 Nik Note. Made with ❤️ for note-takers everywhere.
              </p>
              <div className="flex items-center gap-6">
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Privacy
                </a>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Terms
                </a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};
