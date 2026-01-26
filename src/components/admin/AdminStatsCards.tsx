import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Crown, BookOpen, FileText, 
  LogIn, UserPlus, Download, CreditCard,
  Eye, Activity
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StatsData {
  totalUsers: number;
  premiumUsers: number;
  totalNotebooks: number;
  totalPages: number;
  todayLogins: number;
  todaySignups: number;
  todayExports: number;
  paymentAttempts: number;
  todayVisits: number;
  activeUsers: number;
}

interface AdminStatsCardsProps {
  stats: StatsData;
  loading?: boolean;
}

const statsConfig = [
  { key: 'totalUsers', label: 'Total Users', icon: Users, color: 'bg-blue-500/10 text-blue-500' },
  { key: 'premiumUsers', label: 'Premium Users', icon: Crown, color: 'bg-amber-500/10 text-amber-500' },
  { key: 'activeUsers', label: 'Active Today', icon: Activity, color: 'bg-green-500/10 text-green-500' },
  { key: 'todayVisits', label: 'Today Visits', icon: Eye, color: 'bg-purple-500/10 text-purple-500' },
  { key: 'todaySignups', label: 'Signups Today', icon: UserPlus, color: 'bg-emerald-500/10 text-emerald-500' },
  { key: 'todayLogins', label: 'Logins Today', icon: LogIn, color: 'bg-cyan-500/10 text-cyan-500' },
  { key: 'totalNotebooks', label: 'Total Notebooks', icon: BookOpen, color: 'bg-indigo-500/10 text-indigo-500' },
  { key: 'totalPages', label: 'Total Pages', icon: FileText, color: 'bg-pink-500/10 text-pink-500' },
  { key: 'todayExports', label: 'Exports Today', icon: Download, color: 'bg-orange-500/10 text-orange-500' },
  { key: 'paymentAttempts', label: 'Payment Attempts', icon: CreditCard, color: 'bg-red-500/10 text-red-500' },
];

export const AdminStatsCards: React.FC<AdminStatsCardsProps> = ({ stats, loading }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {statsConfig.map((stat, index) => {
        const Icon = stat.icon;
        const value = stats[stat.key as keyof StatsData];
        
        return (
          <motion.div
            key={stat.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="rounded-xl overflow-hidden">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${stat.color}`}>
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground truncate">{stat.label}</p>
                    <p className="text-lg sm:text-xl font-bold">
                      {loading ? '...' : value}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};
