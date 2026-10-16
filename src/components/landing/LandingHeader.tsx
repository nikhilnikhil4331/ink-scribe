import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun, Menu, X, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LandingHeaderProps {
  isDark: boolean;
  onToggleDark: () => void;
  onStartWriting: () => void;
}

/**
 * Premium sticky nav — clear states, smooth transitions, full keyboard support.
 * Preserves existing anchors; no important feature hides behind complex menus.
 */
export const LandingHeader: React.FC<LandingHeaderProps> = ({
  isDark,
  onToggleDark,
  onStartWriting,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
  ];

  const handleShareWhatsApp = () => {
    const msg = encodeURIComponent(
      '🎓 NikNote — Free AI Study App for Indian Students!\n\n✍️ Convert text to 16+ handwriting styles\n🧠 AI Teacher, Quiz Generator, Flashcards\n📱 Works on phone & laptop\n\nTry free: https://niknote.online'
    );
    window.open(`https://wa.me/?text=${msg}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/85 backdrop-blur-xl supports-[backdrop-filter]:bg-background/75"
    >
      <div className="container mx-auto px-4 lg:px-6">
        <div className="h-16 flex items-center justify-between">
          {/* Logo — SPA navigation */}
          <Link to="/" className="flex items-center gap-2.5 press" aria-label="NikNote home">
            <img
              src="/niknote-logo.png"
              alt=""
              className="h-9 w-auto object-contain"
              loading="eager"
            />
            <span className="hidden lg:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 text-[10px] font-bold text-primary border border-primary/15">
              🇮🇳 Made in India
            </span>
          </Link>

          {/* Desktop nav — hover underline, clear states */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Primary">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="relative px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted/50 press"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShareWhatsApp}
              className="hidden sm:flex rounded-xl text-green-600 hover:bg-green-500/10 hover:text-green-700"
              title="Share on WhatsApp"
              aria-label="Share NikNote on WhatsApp"
            >
              <MessageCircle className="w-5 h-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleDark}
              className="rounded-xl hover:bg-secondary/80"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDark ? 'Light mode' : 'Dark mode'}
            >
              {isDark ? <Sun className="w-5 h-5 text-foreground" /> : <Moon className="w-5 h-5 text-foreground" />}
            </Button>

            <Button
              onClick={onStartWriting}
              variant="premium"
              className="hidden sm:flex h-10 px-5 rounded-full text-sm"
            >
              Start Free ✨
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden rounded-xl"
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-expanded={mobileMenuOpen}
              aria-controls="landing-mobile-menu"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu — animated, keyboard accessible */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            id="landing-mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden overflow-hidden border-t border-border/40 bg-background/95 backdrop-blur-xl"
          >
            <nav className="container mx-auto px-4 py-4 space-y-1" aria-label="Mobile">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-lg transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-3 flex gap-2">
                <Button
                  onClick={() => { onStartWriting(); setMobileMenuOpen(false); }}
                  variant="premium"
                  className="flex-1 h-11 rounded-full"
                >
                  Start Free ✨
                </Button>
                <Button
                  onClick={() => { handleShareWhatsApp(); setMobileMenuOpen(false); }}
                  variant="outline"
                  className="h-11 rounded-full border-green-500/40 text-green-600 hover:bg-green-500/10"
                  aria-label="Share on WhatsApp"
                >
                  <MessageCircle className="w-4 h-4" />
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};
