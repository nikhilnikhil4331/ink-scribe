import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Flame } from 'lucide-react';

interface UrgencyTimerProps {
  className?: string;
  variant?: 'banner' | 'card' | 'inline';
}

export const UrgencyTimer: React.FC<UrgencyTimerProps> = ({ className = '', variant = 'banner' }) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    // Set deadline to end of today (creates daily urgency)
    const getDeadline = () => {
      const now = new Date();
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);
      // If less than 2 hours left, extend to tomorrow
      if (endOfDay.getTime() - now.getTime() < 2 * 60 * 60 * 1000) {
        endOfDay.setDate(endOfDay.getDate() + 1);
      }
      return endOfDay.getTime();
    };

    const deadline = getDeadline();

    const timer = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, deadline - now);
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });

      if (diff <= 0) clearInterval(timer);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (variant === 'inline') {
    return (
      <span className={`inline-flex items-center gap-1.5 ${className}`}>
        <Flame className="h-3.5 w-3.5 text-orange-500 animate-pulse" />
        <span className="text-xs font-bold text-orange-600">
          Offer ends in {pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
        </span>
      </span>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`rounded-xl bg-gradient-to-r from-orange-500/10 via-red-500/10 to-pink-500/10 border border-orange-500/20 p-4 ${className}`}>
        <div className="flex items-center gap-2 mb-2">
          <Flame className="h-4 w-4 text-orange-500" />
          <span className="text-sm font-bold text-orange-600">⚡ Limited Time Offer!</span>
        </div>
        <p className="text-xs text-foreground mb-3">
          Premium ₹99/month — abhi upgrade karo, price badhne wala hai!
        </p>
        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-orange-500" />
          <div className="flex gap-1">
            {[
              { val: pad(timeLeft.hours), label: 'hrs' },
              { val: pad(timeLeft.minutes), label: 'min' },
              { val: pad(timeLeft.seconds), label: 'sec' },
            ].map((t, i) => (
              <span key={i} className="flex items-center gap-0.5">
                <span className="bg-orange-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                  {t.val}
                </span>
                <span className="text-[9px] text-orange-500/70">{t.label}</span>
                {i < 2 && <span className="text-orange-500/50 mx-0.5">:</span>}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Banner variant
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white ${className}`}
    >
      <div className="container mx-auto px-4 py-2 flex items-center justify-center gap-3 text-sm font-medium">
        <Flame className="h-4 w-4 animate-pulse flex-shrink-0" />
        <span className="hidden sm:inline">🔥 Special Offer!</span>
        <span>Premium ₹99/month — price badhne wala hai!</span>
        <span className="flex items-center gap-1 font-bold">
          <Clock className="h-3.5 w-3.5" />
          {pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
        </span>
      </div>
    </motion.div>
  );
};
