import React, { useState, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, Crown, History, ChevronDown, Brain, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { usePremium } from '@/hooks/usePremium';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const UserProfileDropdown = forwardRef<HTMLDivElement>((_, ref) => {
  const { user, signOut } = useAuth();
  const { isPremium } = usePremium();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check admin status
  React.useEffect(() => {
    if (user) {
      supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' })
        .then(({ data }) => setIsAdmin(!!data));
    }
  }, [user]);

  const handleSignOut = async () => {
    setIsOpen(false);
    await signOut();
    toast.success('Signed out successfully');
    navigate('/');
  };

  const displayName = user?.user_metadata?.full_name || 
    user?.email?.split('@')[0] || 
    'User';

  const menuItems = [
    { label: 'AI Solver', icon: Brain, onClick: () => navigate('/ai-solver') },
    { label: 'My History', icon: History, onClick: () => navigate('/history') },
    ...(isAdmin ? [{ label: 'Admin Panel', icon: Shield, onClick: () => navigate('/admin-panel-nikhil') }] : []),
    ...(isPremium ? [] : [{ label: 'Upgrade to Premium', icon: Crown, onClick: () => navigate('/payment'), highlight: true }]),
  ];

  return (
    <div className="relative" ref={ref}>
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 h-9 px-3 rounded-2xl bg-secondary/80 hover:bg-secondary border border-border/50 transition-all duration-200"
      >
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center shadow-sm">
          <User className="w-3.5 h-3.5 text-primary-foreground" />
        </div>
        <span className="hidden sm:inline text-sm font-medium max-w-[100px] truncate">
          {displayName}
        </span>
        {isPremium && <Crown className="w-3.5 h-3.5 text-amber-500" />}
        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop with blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-[100] bg-black/20 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown Menu - Ultra high z-index */}
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ 
                type: 'spring', 
                stiffness: 500, 
                damping: 30,
                mass: 0.8
              }}
              className="fixed right-4 sm:absolute sm:right-0 top-[60px] sm:top-full sm:mt-2 w-[calc(100vw-2rem)] sm:w-72 z-[101] rounded-3xl border border-border/50 bg-card/98 backdrop-blur-2xl shadow-2xl shadow-black/20 overflow-hidden"
            >
              {/* User Info Header */}
              <div className="p-5 border-b border-border/50 bg-gradient-to-br from-primary/5 via-primary/3 to-transparent">
                <div className="flex items-center gap-4">
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center shadow-lg shadow-primary/25"
                  >
                    <User className="w-7 h-7 text-primary-foreground" />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{displayName}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    {isPremium && (
                      <span className="inline-flex items-center gap-1 text-xs text-amber-600 mt-1 font-medium">
                        <Crown className="w-3 h-3" />
                        Premium Member
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-2">
                {menuItems.map((item, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { setIsOpen(false); item.onClick(); }}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all
                      ${item.highlight 
                        ? 'bg-gradient-to-r from-amber-500/10 to-amber-500/5 text-amber-600 hover:from-amber-500/20 hover:to-amber-500/10' 
                        : 'hover:bg-muted/60 text-foreground'
                      }
                    `}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${item.highlight ? 'bg-amber-500/10' : 'bg-muted'}`}>
                      <item.icon className="w-4 h-4" />
                    </div>
                    {item.label}
                  </motion.button>
                ))}
              </div>

              {/* Sign Out */}
              <div className="p-2 border-t border-border/50">
                <motion.button
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-red-500 hover:bg-red-500/10 transition-all"
                >
                  <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center">
                    <LogOut className="w-4 h-4" />
                  </div>
                  Sign Out
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
});

UserProfileDropdown.displayName = 'UserProfileDropdown';
