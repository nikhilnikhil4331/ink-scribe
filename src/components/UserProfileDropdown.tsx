import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, Crown, History, ChevronDown, Brain, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { usePremium } from '@/hooks/usePremium';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const UserProfileDropdown: React.FC = () => {
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
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2 rounded-xl h-9 px-3 hover:bg-primary/10"
      >
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
          <User className="w-3.5 h-3.5 text-primary-foreground" />
        </div>
        <span className="hidden sm:inline text-sm font-medium max-w-[100px] truncate">
          {displayName}
        </span>
        {isPremium && <Crown className="w-3.5 h-3.5 text-amber-500" />}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown Menu */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-64 z-50 rounded-2xl border bg-card/95 backdrop-blur-xl shadow-2xl overflow-hidden"
            >
              {/* User Info Header */}
              <div className="p-4 border-b bg-gradient-to-r from-primary/5 to-primary/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                    <User className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{displayName}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    {isPremium && (
                      <span className="inline-flex items-center gap-1 text-xs text-amber-600 mt-1">
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
                  <button
                    key={index}
                    onClick={() => { setIsOpen(false); item.onClick(); }}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors
                      ${item.highlight 
                        ? 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20' 
                        : 'hover:bg-muted/50 text-foreground'
                      }
                    `}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Sign Out */}
              <div className="p-2 border-t">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
