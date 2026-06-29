import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Copy, Check, MessageCircle, ExternalLink, X, Sparkles, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  getReferralStats,
  getReferralWhatsAppMessage,
  getReferralLink,
  trackShare,
} from '@/utils/referral';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const ReferralWidget: React.FC<{ variant?: 'banner' | 'card' | 'compact' }> = ({
  variant = 'card',
}) => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [dismissed, setDismissed] = useState(() =>
    localStorage.getItem('niknote_referral_dismissed') === 'true'
  );

  const userId = user?.id || 'guest';
  const stats = getReferralStats(userId);

  const handleCopyLink = async () => {
    const link = getReferralLink(user?.id);
    await navigator.clipboard.writeText(link);
    setCopied(true);
    trackShare('copy');
    toast.success('Link copied! Ab share karo dosto ko 🎁');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const msg = getReferralWhatsAppMessage(user?.id);
    window.open(`https://wa.me/?text=${msg}`, '_blank');
    trackShare('whatsapp');
    toast.success('WhatsApp pe share karo! 3 dosto ke liye = Premium free 🎉');
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('niknote_referral_dismissed', 'true');
  };

  if (dismissed) return null;

  // Compact variant — for sidebar or small spaces
  if (variant === 'compact') {
    return (
      <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-200/50">
        <div className="flex items-center gap-2 mb-2">
          <Gift className="w-4 h-4 text-purple-500" />
          <span className="text-xs font-bold text-foreground">Invite & Earn Premium!</span>
        </div>
        <p className="text-[10px] text-muted-foreground mb-2">
          3 dosto ko bhejo = 1 month Premium free 🎁
        </p>
        <div className="flex gap-1.5">
          <button
            onClick={handleWhatsApp}
            className="flex-1 py-1.5 rounded-lg bg-green-500 text-white text-[10px] font-bold flex items-center justify-center gap-1 hover:bg-green-600 transition-colors"
          >
            <MessageCircle className="w-3 h-3" />
            WhatsApp
          </button>
          <button
            onClick={handleCopyLink}
            className="flex-1 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-[10px] font-bold flex items-center justify-center gap-1 hover:bg-gray-200 transition-colors"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
      </div>
    );
  }

  // Card variant — for landing page or account page
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-2xl bg-gradient-to-br from-purple-500/5 via-blue-500/5 to-primary/5 border border-purple-200/50 p-6 overflow-hidden"
    >
      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 p-1 rounded-lg hover:bg-muted/50 text-muted-foreground"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg">
            <Gift className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Invite & Earn Premium! 🎁</h3>
            <p className="text-sm text-muted-foreground">3 dosto ko batao = 1 month Premium FREE</p>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              {stats.count} of {stats.count + stats.needed} friends invited
            </span>
            <span className="text-xs font-bold text-purple-600">
              {stats.rewarded ? '🎉 Premium Unlocked!' : `${stats.needed} more to go`}
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((stats.count / 3) * 100, 100)}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Share Actions */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={handleWhatsApp}
            className="flex-1 h-11 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            Share on WhatsApp 📱
          </Button>
          <Button
            onClick={handleCopyLink}
            variant="outline"
            className="flex-1 h-11 rounded-xl font-semibold gap-2"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy Referral Link'}
          </Button>
        </div>

        {/* Referral code */}
        <div className="mt-3 text-center">
          <span className="text-[11px] text-muted-foreground">
            Your code: <span className="font-mono font-bold text-foreground">{stats.code}</span>
          </span>
        </div>
      </div>
    </motion.div>
  );
};
