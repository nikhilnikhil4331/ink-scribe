import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Twitter, Github, Mail, Heart } from 'lucide-react';

export const LandingFooter: React.FC = () => {
  const handleWhatsAppShare = () => {
    const msg = encodeURIComponent(
      '🎓 NikNote — Free AI Study App! AI Teacher + Handwriting Notes + Quiz Generator\nTry free: https://niknote.online'
    );
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  return (
    <footer className="py-12 border-t border-border/50 bg-background">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <img
                src="/niknote-logo.png"
                alt="NikNote"
                className="h-8 w-auto object-contain"
              />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              AI-Powered Study App for Indian Students. Handwriting notes, AI Teacher, Quiz Generator — sab ek jagah!
            </p>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/10 text-[10px] font-bold text-orange-600 border border-orange-200">
              🇮🇳 Made in India
            </span>
          </div>

          {/* Features */}
          <div>
            <h4 className="font-semibold text-foreground mb-3 text-sm">Features</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">✍️ Handwriting Notes</Link></li>
              <li><Link to="/ai" className="text-sm text-muted-foreground hover:text-foreground transition-colors">🧠 AI Teacher</Link></li>
              <li><Link to="/ai-solver" className="text-sm text-muted-foreground hover:text-foreground transition-colors">📝 AI Solver</Link></li>
              <li><Link to="/documents" className="text-sm text-muted-foreground hover:text-foreground transition-colors">📄 Document AI</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-foreground mb-3 text-sm">Resources</h4>
            <ul className="space-y-2">
              <li><Link to="/upgrade" className="text-sm text-muted-foreground hover:text-foreground transition-colors">💎 Premium Plans</Link></li>
              <li><a href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">❓ FAQ</a></li>
              <li><a href="mailto:support@niknote.online" className="text-sm text-muted-foreground hover:text-foreground transition-colors">📧 Contact Us</a></li>
              <li><a href="mailto:abuse@niknote.online" className="text-sm text-muted-foreground hover:text-foreground transition-colors">🚫 Report Abuse</a></li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="font-semibold text-foreground mb-3 text-sm">Connect</h4>
            <div className="space-y-2">
              <button
                onClick={handleWhatsAppShare}
                className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Share on WhatsApp
              </button>
              <a
                href="https://twitter.com/NikNote"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Twitter className="w-4 h-4" />
                Follow on Twitter
              </a>
              <a
                href="https://github.com/nikhilnikhil4331/ink-scribe"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="w-4 h-4" />
                Star on GitHub
              </a>
              <a
                href="mailto:support@niknote.online"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Mail className="w-4 h-4" />
                Email Support
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border/50 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} NikNote. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Terms of Service</a>
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Refund Policy</a>
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> in India 🇮🇳
          </p>
        </div>
      </div>
    </footer>
  );
};
