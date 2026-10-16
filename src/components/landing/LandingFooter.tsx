import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Heart, Shield, Sparkles, Smartphone } from 'lucide-react';
import niknoteLogoImg from '@/assets/niknote-logo.png';

/**
 * Premium footer — compact, useful, honest.
 * Only real links and real claims (no invented support channels, ratings,
 * social accounts, addresses or legal pages).
 */
export const LandingFooter: React.FC = () => {
  const year = new Date().getFullYear();

  const handleWhatsAppShare = () => {
    const msg = encodeURIComponent(
      '🎓 NikNote — Free AI Study App! AI Teacher + Handwriting Notes + Quiz Generator\nTry free: https://niknote.online'
    );
    window.open(`https://wa.me/?text=${msg}`, '_blank', 'noopener,noreferrer');
  };

  const productLinks = [
    { label: 'Features', to: '#features' },
    { label: 'How it works', to: '#how-it-works' },
    { label: 'Pricing', to: '#pricing' },
    { label: 'FAQ', to: '#faq' },
    { label: 'Blog', to: '/blog' },
    { label: 'For schools', to: '/schools' },
  ];

  const moreLinks = [
    { label: 'AI Solver', to: '/ai-solver' },
    { label: 'AI Workspace', to: '/ai' },
    { label: 'Money Tracker', to: '/money' },
    { label: 'QA & Support', to: '/qa' },
    { label: 'Send feedback', to: '/feedback' },
    { label: 'Sign in', to: '/login' },
    { label: 'Create account', to: '/signup' },
  ];

  return (
    <footer className="border-t border-border/50 bg-muted/20">
      <div className="container mx-auto px-4 lg:px-6 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <img src={niknoteLogoImg} alt="" className="h-9 w-9 rounded-lg shadow-soft" />
              <span className="font-display text-lg font-bold text-foreground">NikNote</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-[240px]">
              Handwriting notes + AI teacher for Indian students. Padhai ko asaan banana hai — AI se, Hindi mein.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <a
                href="https://github.com/nikhilnikhil4331"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors press"
                aria-label="NikNote on GitHub"
              >
                <Github className="w-4 h-4" aria-hidden="true" />
                GitHub
              </a>
              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors press"
              >
                <Heart className="w-4 h-4" aria-hidden="true" />
                Share
              </button>
            </div>
          </div>

          {/* Product */}
          <nav aria-label="Product">
            <h3 className="text-xs font-semibold tracking-[0.12em] uppercase text-foreground/70 mb-3">Product</h3>
            <ul className="space-y-2.5">
              {productLinks.map((link) => (
                <li key={link.label}>
                  {link.to.startsWith('#') ? (
                    <a href={link.to} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {link.label}
                    </a>
                  ) : (
                    <Link to={link.to} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* More */}
          <nav aria-label="More">
            <h3 className="text-xs font-semibold tracking-[0.12em] uppercase text-foreground/70 mb-3">Explore</h3>
            <ul className="space-y-2.5">
              {moreLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Trust — factual badges only */}
          <div>
            <h3 className="text-xs font-semibold tracking-[0.12em] uppercase text-foreground/70 mb-3">Why NikNote</h3>
            <ul className="space-y-2.5">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Heart className="w-4 h-4 text-primary" aria-hidden="true" /> Made in India 🇮🇳
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="w-4 h-4 text-primary" aria-hidden="true" /> Free to start
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="w-4 h-4 text-primary" aria-hidden="true" /> Your notes stay yours
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Smartphone className="w-4 h-4 text-primary" aria-hidden="true" /> Phone &amp; laptop ready
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            © {year} NikNote · Founded &amp; built by Nikhil Jatav
          </p>
          <p className="text-xs text-muted-foreground">
            Made with <Heart className="w-3 h-3 inline text-red-500" aria-hidden="true" /> for students
          </p>
        </div>
      </div>
    </footer>
  );
};
