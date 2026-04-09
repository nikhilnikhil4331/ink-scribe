import React from 'react';
import { PenLine } from 'lucide-react';
import { Link } from 'react-router-dom';

export const LandingFooter: React.FC = () => {
  return (
    <footer className="py-12 border-t border-border/50 bg-background">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <PenLine className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-foreground">NikNote</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Turn typed text into realistic handwritten notes. Built for students, teachers, and creators.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-foreground mb-3 text-sm">Product</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Generator</Link></li>
              <li><Link to="/upgrade" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link></li>
              <li><Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Examples</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-foreground mb-3 text-sm">Support</h4>
            <ul className="space-y-2">
              <li><a href="mailto:support@niknote.online" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</a></li>
              <li><a href="mailto:abuse@niknote.online" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Report Abuse</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-foreground mb-3 text-sm">Legal</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Refund Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/50 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} NikNote. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Made with ❤️ in India
          </p>
        </div>
      </div>
    </footer>
  );
};
