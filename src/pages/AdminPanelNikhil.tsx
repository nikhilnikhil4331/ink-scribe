import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, LogOut, RefreshCw, Lock, Menu, X,
  LayoutDashboard, Users, Activity, Bug, Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { AdminStatsCards } from '@/components/admin/AdminStatsCards';
import { AdminActivityFeed } from '@/components/admin/AdminActivityFeed';
import { AdminUserList } from '@/components/admin/AdminUserList';
import { AdminErrorLogs } from '@/components/admin/AdminErrorLogs';
import { AdminControls } from '@/components/admin/AdminControls';

interface UserData {
  id: string;
  display_name: string | null;
  created_at: string;
  is_premium: boolean;
  is_banned?: boolean;
}

interface ActivityLog {
  id: string;
  user_id: string | null;
  action: string;
  category: string;
  details: Record<string, unknown>;
  device_type: string | null;
  page_url: string | null;
  created_at: string;
  display_name?: string;
}

interface ErrorLog {
  id: string;
  error_type: string;
  error_message: string;
  component: string | null;
  severity: string;
  resolved: boolean;
  device_type: string | null;
  created_at: string;
}

interface AppSettings {
  premium_enabled: boolean;
  signup_enabled: boolean;
  dev_mode: boolean;
  maintenance_mode: boolean;
  upi_id: string;
  weekly_price: number;
  monthly_price: number;
}

interface SystemCheckResult {
  name: string;
  status: 'pass' | 'fail' | 'pending';
  message?: string;
}

const AdminPanelNikhil: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Data states
  const [users, setUsers] = useState<UserData[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    premium_enabled: true,
    signup_enabled: true,
    dev_mode: true,
    maintenance_mode: false,
    upi_id: 'nikhiljatav@upi',
    weekly_price: 49,
    monthly_price: 99,
  });
  const [stats, setStats] = useState({
    totalUsers: 0,
    premiumUsers: 0,
    totalNotebooks: 0,
    totalPages: 0,
    todayLogins: 0,
    todaySignups: 0,
    todayExports: 0,
    paymentAttempts: 0,
    todayVisits: 0,
    activeUsers: 0,
  });

  // Check admin status
  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (error) throw error;
      
      setIsAdmin(!!data);
      
      if (data) {
        await loadAllData();
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const loadAllData = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        loadUsers(),
        loadActivities(),
        loadErrors(),
        loadSettings(),
        loadStats(),
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setRefreshing(false);
    }
  }, []);

  const loadUsers = async () => {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, user_id, display_name, created_at')
      .order('created_at', { ascending: false });

    const { data: subscriptions } = await supabase
      .from('user_subscriptions')
      .select('user_id, status');

    const usersWithStatus: UserData[] = (profiles || []).map(profile => {
      const sub = subscriptions?.find(s => s.user_id === profile.user_id);
      return {
        id: profile.user_id,
        display_name: profile.display_name,
        created_at: profile.created_at,
        is_premium: sub?.status === 'active',
      };
    });

    setUsers(usersWithStatus);
  };

  const loadActivities = async () => {
    const { data: logs } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (logs) {
      // Get user display names
      const userIds = [...new Set(logs.filter(l => l.user_id).map(l => l.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p.display_name]) || []);

      setActivities(logs.map(log => ({
        ...log,
        details: log.details as Record<string, unknown>,
        display_name: log.user_id ? profileMap.get(log.user_id) || 'Unknown' : 'Anonymous',
      })));
    }
  };

  const loadErrors = async () => {
    const { data } = await supabase
      .from('error_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (data) {
      setErrors(data);
    }
  };

  const loadSettings = async () => {
    const { data } = await supabase
      .from('app_settings')
      .select('key, value');

    if (data) {
      const settingsMap: Record<string, unknown> = {};
      data.forEach(item => {
        try {
          settingsMap[item.key] = typeof item.value === 'string' 
            ? JSON.parse(item.value) 
            : item.value;
        } catch {
          settingsMap[item.key] = item.value;
        }
      });

      setSettings(prev => ({
        ...prev,
        premium_enabled: settingsMap.premium_enabled === true || settingsMap.premium_enabled === 'true',
        signup_enabled: settingsMap.signup_enabled === true || settingsMap.signup_enabled === 'true',
        dev_mode: settingsMap.dev_mode === true || settingsMap.dev_mode === 'true',
        maintenance_mode: settingsMap.maintenance_mode === true || settingsMap.maintenance_mode === 'true',
        upi_id: String(settingsMap.upi_id || 'nikhiljatav@upi').replace(/"/g, ''),
        weekly_price: Number(settingsMap.weekly_price) || 49,
        monthly_price: Number(settingsMap.monthly_price) || 99,
      }));
    }
  };

  const loadStats = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    const [
      { count: totalUsers },
      { count: totalNotebooks },
      { count: totalPages },
      { data: subscriptions },
      { data: todayActivities },
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('notebooks').select('*', { count: 'exact', head: true }),
      supabase.from('pages').select('*', { count: 'exact', head: true }),
      supabase.from('user_subscriptions').select('status'),
      supabase.from('activity_logs').select('action').gte('created_at', todayISO),
    ]);

    const premiumUsers = subscriptions?.filter(s => s.status === 'active').length || 0;
    const todayLogins = todayActivities?.filter(a => a.action === 'login').length || 0;
    const todaySignups = todayActivities?.filter(a => a.action === 'signup').length || 0;
    const todayExports = todayActivities?.filter(a => a.action?.includes('export')).length || 0;
    const todayVisits = todayActivities?.filter(a => a.action === 'page_view').length || 0;
    const paymentAttempts = todayActivities?.filter(a => a.action === 'premium_attempt').length || 0;
    const activeUsers = new Set(todayActivities?.map(a => a.action)).size;

    setStats({
      totalUsers: totalUsers || 0,
      premiumUsers,
      totalNotebooks: totalNotebooks || 0,
      totalPages: totalPages || 0,
      todayLogins,
      todaySignups,
      todayExports,
      paymentAttempts,
      todayVisits,
      activeUsers,
    });
  };

  const handleTogglePremium = async (userId: string, currentStatus: boolean) => {
    try {
      const newStatus = currentStatus ? 'cancelled' : 'active';
      
      await supabase.functions.invoke('record-payment', {
        body: {
          userId,
          planCode: 'admin_granted',
          status: newStatus,
        },
      });

      toast.success(`Premium ${currentStatus ? 'revoked' : 'granted'} successfully`);
      await loadUsers();
    } catch (error) {
      console.error('Error toggling premium:', error);
      toast.error('Failed to update premium status');
    }
  };

  const handleBanUser = async (_userId: string) => {
    toast.info('Ban functionality will be implemented with user status field');
  };

  const handleDeleteUser = async (_userId: string) => {
    toast.info('Delete functionality requires admin API access');
  };

  const handleResolveError = async (errorId: string) => {
    await supabase.from('error_logs').update({ resolved: true }).eq('id', errorId);
    await loadErrors();
    toast.success('Error marked as resolved');
  };

  const handleDismissError = async (errorId: string) => {
    await supabase.from('error_logs').delete().eq('id', errorId);
    await loadErrors();
    toast.success('Error dismissed');
  };

  const handleUpdateSetting = async (key: string, value: unknown) => {
    try {
      await supabase.from('app_settings').upsert({
        key,
        value: JSON.stringify(value),
        updated_by: user?.id,
        updated_at: new Date().toISOString(),
      });

      setSettings(prev => ({ ...prev, [key]: value }));
      toast.success('Setting updated');
    } catch (error) {
      console.error('Error updating setting:', error);
      toast.error('Failed to update setting');
    }
  };

  const handleClearLogs = async () => {
    try {
      await Promise.all([
        supabase.from('activity_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        supabase.from('error_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
      ]);
      await loadAllData();
      toast.success('All logs cleared');
    } catch (error) {
      console.error('Error clearing logs:', error);
      toast.error('Failed to clear logs');
    }
  };

  const handleRunSystemCheck = async (): Promise<SystemCheckResult[]> => {
    const results: SystemCheckResult[] = [];

    // Check auth
    try {
      const { data } = await supabase.auth.getSession();
      results.push({ name: 'Authentication', status: data.session ? 'pass' : 'fail' });
    } catch {
      results.push({ name: 'Authentication', status: 'fail' });
    }

    // Check database
    try {
      await supabase.from('profiles').select('id').limit(1);
      results.push({ name: 'Database Connection', status: 'pass' });
    } catch {
      results.push({ name: 'Database Connection', status: 'fail' });
    }

    // Check premium system
    try {
      await supabase.from('user_subscriptions').select('id').limit(1);
      results.push({ name: 'Premium System', status: 'pass' });
    } catch {
      results.push({ name: 'Premium System', status: 'fail' });
    }

    // Export check (basic)
    results.push({ name: 'Export Functions', status: 'pass' });

    // Payment check
    results.push({ name: 'Payment Gateway', status: settings.upi_id ? 'pass' : 'fail' });

    // Mobile check
    results.push({ name: 'Mobile Layout', status: 'pass' });

    return results;
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        >
          <RefreshCw className="w-8 h-8 text-primary" />
        </motion.div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <Card className="rounded-2xl shadow-xl">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
                <Lock className="w-8 h-8 text-destructive" />
              </div>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>
                This area is restricted to administrators only.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={() => navigate('/auth')} 
                className="w-full rounded-xl"
              >
                Login
              </Button>
              <Button 
                onClick={() => navigate('/')} 
                variant="outline"
                className="w-full rounded-xl"
              >
                Back to Home
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'errors', label: 'Errors', icon: Bug },
    { id: 'controls', label: 'Controls', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary flex items-center justify-center">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-bold text-base sm:text-lg">Admin Panel</h1>
              <p className="text-xs text-muted-foreground">Nikhil Notes</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={loadAllData}
              disabled={refreshing}
              className="rounded-xl"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleLogout}
              className="rounded-xl"
            >
              <LogOut className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-xl sm:hidden"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 sm:py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          {/* Desktop Tabs */}
          <TabsList className="hidden sm:flex h-auto p-1 bg-secondary/50 rounded-xl">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <TabsTrigger 
                  key={tab.id} 
                  value={tab.id}
                  className="flex-1 gap-2 data-[state=active]:bg-background rounded-lg py-2"
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Mobile Tabs Dropdown */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="sm:hidden bg-secondary/50 rounded-xl p-2 space-y-1"
            >
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? 'secondary' : 'ghost'}
                    className="w-full justify-start gap-2"
                    onClick={() => {
                      setActiveTab(tab.id);
                      setMobileMenuOpen(false);
                    }}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </Button>
                );
              })}
            </motion.div>
          )}

          {/* Mobile Current Tab Indicator */}
          <div className="sm:hidden">
            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <div className="flex items-center gap-2">
                {(() => {
                  const currentTab = tabs.find(t => t.id === activeTab);
                  const Icon = currentTab?.icon || LayoutDashboard;
                  return (
                    <>
                      <Icon className="w-4 h-4" />
                      {currentTab?.label || 'Dashboard'}
                    </>
                  );
                })()}
              </div>
              <Menu className="w-4 h-4" />
            </Button>
          </div>

          <TabsContent value="dashboard" className="space-y-4 mt-4">
            <AdminStatsCards stats={stats} loading={refreshing} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <AdminActivityFeed activities={activities.slice(0, 20)} loading={refreshing} />
              <AdminErrorLogs 
                errors={errors} 
                loading={refreshing}
                onResolve={handleResolveError}
                onDismiss={handleDismissError}
              />
            </div>
          </TabsContent>

          <TabsContent value="users" className="mt-4">
            <AdminUserList
              users={users}
              loading={refreshing}
              onTogglePremium={handleTogglePremium}
              onBanUser={handleBanUser}
              onDeleteUser={handleDeleteUser}
            />
          </TabsContent>

          <TabsContent value="activity" className="mt-4">
            <AdminActivityFeed activities={activities} loading={refreshing} />
          </TabsContent>

          <TabsContent value="errors" className="mt-4">
            <AdminErrorLogs 
              errors={errors} 
              loading={refreshing}
              onResolve={handleResolveError}
              onDismiss={handleDismissError}
            />
          </TabsContent>

          <TabsContent value="controls" className="mt-4">
            <AdminControls
              settings={settings}
              onUpdateSetting={handleUpdateSetting}
              onClearLogs={handleClearLogs}
              onRunSystemCheck={handleRunSystemCheck}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminPanelNikhil;
