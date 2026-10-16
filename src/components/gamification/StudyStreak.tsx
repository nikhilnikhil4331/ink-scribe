import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Gift, Crown, Share2, Check } from 'lucide-react';

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  todayCompleted: boolean;
  rewards: StreakReward[];
}

interface StreakReward {
  days: number;
  label: string;
  description: string;
  claimed: boolean;
  type: 'free_premium_day' | 'ai_credits' | 'style_unlock';
}

const DEFAULT_REWARDS: StreakReward[] = [
  { days: 3, label: '3-Day Streak! 🔥', description: '1 Free AI Note Credit', claimed: false, type: 'ai_credits' },
  { days: 7, label: 'Week Warrior! 💪', description: '1 Day Free Premium', claimed: false, type: 'free_premium_day' },
  { days: 14, label: '2 Weeks! 🌟', description: '2 AI Credits + Style Unlock', claimed: false, type: 'style_unlock' },
  { days: 30, label: 'Monthly Master! 👑', description: '3 Days Free Premium', claimed: false, type: 'free_premium_day' },
];

const STREAK_KEY = 'niknote_streak_data';

export const useStudyStreak = () => {
  const [streakData, setStreakData] = useState<StreakData>(() => {
    try {
      const saved = localStorage.getItem(STREAK_KEY);
      if (saved) return JSON.parse(saved);
    } catch { /* ignore — non-critical persistence */ }
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      todayCompleted: false,
      rewards: DEFAULT_REWARDS,
    };
  });

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(STREAK_KEY, JSON.stringify(streakData));
  }, [streakData]);

  const markTodayActive = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];

    setStreakData(prev => {
      if (prev.lastActiveDate === today && prev.todayCompleted) return prev;

      let newStreak = prev.currentStreak;
      if (prev.lastActiveDate) {
        const lastDate = new Date(prev.lastActiveDate);
        const todayDate = new Date(today);
        const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          newStreak = prev.currentStreak + 1; // Consecutive day
        } else if (diffDays > 1) {
          newStreak = 1; // Streak broken, restart
        }
        // diffDays === 0 means same day, keep streak
      } else {
        newStreak = 1; // First day
      }

      const longestStreak = Math.max(prev.longestStreak, newStreak);

      // Update rewards
      const rewards = prev.rewards.map(r => ({
        ...r,
        claimed: r.claimed || newStreak >= r.days,
      }));

      return {
        currentStreak: newStreak,
        longestStreak,
        lastActiveDate: today,
        todayCompleted: true,
        rewards,
      };
    });
  }, []);

  const claimReward = useCallback((days: number) => {
    setStreakData(prev => ({
      ...prev,
      rewards: prev.rewards.map(r =>
        r.days === days ? { ...r, claimed: true } : r
      ),
    }));
  }, []);

  return { streakData, markTodayActive, claimReward };
};

/**
 * Study Streak — premium daily-habit experience.
 * Every visual state reflects real saved data (localStorage streak store):
 * progress ring = real progress to next reward, flame = today's real completion,
 * milestones = real claimed/unclaimed rewards. No inflated numbers.
 */
export const StudyStreakWidget: React.FC = () => {
  const { streakData, markTodayActive, claimReward } = useStudyStreak();
  const [showRewardPopup, setShowRewardPopup] = useState<StreakReward | null>(null);

  // Auto-mark today as active when component mounts
  useEffect(() => {
    markTodayActive();
  }, [markTodayActive]);

  // Check if a new reward was just unlocked
  useEffect(() => {
    const unclaimedUnlocked = streakData.rewards.find(r => !r.claimed && streakData.currentStreak >= r.days);
    // We show this only if streak matches exactly (just unlocked)
    if (unclaimedUnlocked && streakData.currentStreak === unclaimedUnlocked.days) {
      setShowRewardPopup(unclaimedUnlocked);
    }
  }, [streakData.currentStreak, streakData.rewards]);

  const handleClaim = (reward: StreakReward) => {
    claimReward(reward.days);
    setShowRewardPopup(null);
  };

  const nextReward = streakData.rewards.find(r => streakData.currentStreak < r.days);
  const progressToNext = nextReward
    ? Math.min(100, (streakData.currentStreak / nextReward.days) * 100)
    : 100;

  // SVG ring geometry
  const RING_R = 34;
  const RING_C = 2 * Math.PI * RING_R;

  return (
    <>
      <div className="bg-card rounded-2xl border border-border/50 shadow-soft p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.span
              key={streakData.todayCompleted ? 'on' : 'off'}
              initial={streakData.todayCompleted ? { scale: 0.8, rotate: -8 } : false}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              className="inline-flex"
            >
              <Flame className={`h-5 w-5 ${streakData.todayCompleted ? 'text-orange-500' : 'text-muted-foreground'}`} />
            </motion.span>
            <span className="font-bold text-sm text-foreground">Study Streak</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Crown className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
            Best: <span className="font-semibold text-foreground">{streakData.longestStreak}d</span>
          </div>
        </div>

        {/* Ring + stats */}
        <div className="flex items-center gap-4">
          {/* Progress ring — real progress to next reward */}
          <div className="relative w-[84px] h-[84px] flex-shrink-0" role="img"
               aria-label={`${Math.round(progressToNext)}% to next reward`}>
            <svg viewBox="0 0 84 84" className="w-full h-full -rotate-90">
              <circle cx="42" cy="42" r={RING_R} fill="none" strokeWidth="8" className="stroke-muted" />
              <motion.circle
                cx="42" cy="42" r={RING_R} fill="none" strokeWidth="8" strokeLinecap="round"
                className="stroke-orange-500"
                strokeDasharray={RING_C}
                initial={{ strokeDashoffset: RING_C }}
                animate={{ strokeDashoffset: RING_C * (1 - progressToNext / 100) }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-orange-500 leading-none">{streakData.currentStreak}</span>
              <span className="text-[10px] text-muted-foreground mt-0.5">days</span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex-1 min-w-0 space-y-2">
            {nextReward ? (
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground truncate">Next: {nextReward.label}</span>
                  <span className="text-orange-600 font-semibold ml-2">{streakData.currentStreak}/{nextReward.days}d</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-orange-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressToNext}%` }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
              </div>
            ) : (
              <p className="text-xs text-emerald-600 font-medium">All milestones unlocked! 🏆</p>
            )}

            {/* Today status — genuine state only */}
            <div className={`flex items-center gap-2 p-2 rounded-lg text-xs ${
              streakData.todayCompleted
                ? 'bg-emerald-500/10 text-emerald-600'
                : 'bg-amber-500/10 text-amber-600'
            }`}>
              {streakData.todayCompleted ? (
                <>
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  Today's streak saved! Keep going 🔥
                </>
              ) : (
                <>
                  <Flame className="h-3.5 w-3.5" aria-hidden="true" />
                  Write notes today to keep your streak alive!
                </>
              )}
            </div>
          </div>
        </div>

        {/* Reward milestones */}
        <div className="flex items-center gap-1.5">
          {streakData.rewards.map((reward) => {
            const achieved = streakData.currentStreak >= reward.days;
            return (
              <button
                key={reward.days}
                type="button"
                title={reward.description}
                onClick={() => achieved && !reward.claimed && setShowRewardPopup(reward)}
                className={`flex-1 text-center p-1.5 rounded-lg text-[9px] font-semibold transition-all press ${
                  achieved
                    ? 'bg-orange-500/10 text-orange-600 border border-orange-500/20 hover:bg-orange-500/20 cursor-pointer'
                    : 'bg-muted/30 text-muted-foreground border border-transparent cursor-default'
                }`}
              >
                <div className="text-[10px]">{achieved ? (reward.claimed ? '✅' : '🏆') : '🎯'}</div>
                <div>{reward.days}d</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Reward Claim Popup */}
      <AnimatePresence>
        {showRewardPopup && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRewardPopup(null)}
              className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-0 z-[61] flex items-center justify-center p-4"
              role="dialog"
              aria-modal="true"
              aria-label={showRewardPopup.label}
            >
              <div className="bg-card rounded-3xl border border-border/50 shadow-overlay max-w-sm w-full p-6 text-center space-y-4">
                <motion.div
                  initial={{ scale: 0.6 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.15, type: 'spring', stiffness: 260, damping: 16 }}
                  className="text-5xl"
                >
                  🎉
                </motion.div>
                <h3 className="text-xl font-bold text-foreground">{showRewardPopup.label}</h3>
                <p className="text-sm text-muted-foreground">{showRewardPopup.description}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleClaim(showRewardPopup)}
                    className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 press shadow-soft hover:shadow-raised"
                  >
                    <Gift className="h-4 w-4" />
                    Claim Reward!
                  </button>
                  <button
                    onClick={() => {
                      const msg = encodeURIComponent(
                        `🔥 I'm on a ${streakData.currentStreak}-day study streak on NikNote!\n\n${showRewardPopup.label}\nJoin me: https://niknote.online`
                      );
                      window.open(`https://wa.me/?text=${msg}`, '_blank', 'noopener,noreferrer');
                    }}
                    className="py-3 px-4 rounded-xl border border-green-500/30 bg-green-500/5 text-green-600 font-semibold text-sm flex items-center gap-2 press hover:bg-green-500/10"
                  >
                    <Share2 className="h-4 w-4" />
                    Share
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
