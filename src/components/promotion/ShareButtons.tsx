import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, MessageCircle, Twitter, Linkedin, Copy, Check, X, ExternalLink } from 'lucide-react';
import { PROMO_MESSAGES, getShareLinks } from '@/utils/promotion';
import { toast } from 'sonner';

interface ShareButtonsProps {
  variant?: 'floating' | 'inline' | 'compact';
  className?: string;
}

export const ShareButtons: React.FC<ShareButtonsProps> = ({ variant = 'floating', className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareLinks = getShareLinks(
    'NikNote — Free AI Study App for Indian Students! 🎓',
    'Check out NikNote! AI teacher, handwriting notes, quizzes & flashcards. 100% Free!'
  );

  const handleCopy = async () => {
    await navigator.clipboard.writeText('https://niknote.online');
    setCopied(true);
    toast.success('Link copied! Share with classmates 🎓');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const msg = PROMO_MESSAGES.whatsapp[Math.floor(Math.random() * PROMO_MESSAGES.whatsapp.length)];
    window.open(shareLinks.whatsapp, '_blank');
    toast.success('Share on WhatsApp! 📱');
  };

  const handleTelegram = () => {
    window.open(shareLinks.telegram, '_blank');
    toast.success('Share on Telegram! 📨');
  };

  const handleTwitter = () => {
    window.open(shareLinks.twitter, '_blank');
    toast.success('Share on Twitter! 🐦');
  };

  const shareButtons = [
    { icon: <MessageCircle className="w-5 h-5" />, label: 'WhatsApp', action: handleWhatsApp, color: 'bg-green-500 hover:bg-green-600', textColor: 'text-white' },
    { icon: <ExternalLink className="w-5 h-5" />, label: 'Telegram', action: handleTelegram, color: 'bg-blue-500 hover:bg-blue-600', textColor: 'text-white' },
    { icon: <Twitter className="w-5 h-5" />, label: 'Twitter', action: handleTwitter, color: 'bg-sky-500 hover:bg-sky-600', textColor: 'text-white' },
    { icon: copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />, label: 'Copy Link', action: handleCopy, color: 'bg-gray-600 hover:bg-gray-700', textColor: 'text-white' },
  ];

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {shareButtons.map(btn => (
          <button key={btn.label} onClick={btn.action} className={`p-2 rounded-lg ${btn.color} ${btn.textColor} transition-colors`} title={btn.label}>
            {btn.icon}
          </button>
        ))}
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {shareButtons.map(btn => (
          <button key={btn.label} onClick={btn.action} className={`flex items-center gap-2 px-3 py-2 rounded-xl ${btn.color} ${btn.textColor} text-xs font-medium transition-colors`}>
            {btn.icon}
            {btn.label}
          </button>
        ))}
      </div>
    );
  }

  // Floating variant
  return (
    <>
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 left-6 z-50 w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow"
        title="Share NikNote"
      >
        <Share2 className="w-5 h-5" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-[60]"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed bottom-20 left-6 z-[61] w-72 bg-white/95 backdrop-blur-2xl rounded-2xl border border-white/30 shadow-2xl p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold">Share NikNote 🎓</h3>
                <button onClick={() => setIsOpen(false)} className="p-1 rounded-lg hover:bg-muted/50">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground mb-3">
                Share with classmates & friends! Help Indian students study better 📚
              </p>
              <div className="space-y-2">
                {shareButtons.map(btn => (
                  <button
                    key={btn.label}
                    onClick={() => { btn.action(); setIsOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl ${btn.color} ${btn.textColor} text-sm font-medium transition-all hover:scale-[1.02]`}
                  >
                    {btn.icon}
                    {btn.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
