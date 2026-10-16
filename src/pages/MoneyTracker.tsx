import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, Wallet, TrendingUp, TrendingDown, IndianRupee,
  Utensils, Bus, BookOpen, GraduationCap, HeartPulse, Gamepad2, ShoppingBag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/NikNoteToast';

// ============================================================
// Money Tracker — personal finance for students
// Real user entries only (starts empty; nothing is invented).
// Persistence follows the app's local-first architecture (localStorage),
// same as study streaks and editor auto-save.
// ============================================================

interface MoneyEntry {
  id: string;
  type: 'income' | 'expense';
  amount: number;         // rupees
  category: string;
  note: string;
  date: string;           // YYYY-MM-DD
  createdAt: number;
}

const STORAGE_KEY = 'niknote_money_tracker';

const CATEGORIES: Record<string, { icon: React.FC<{ className?: string }>; label: string }> = {
  food: { icon: Utensils, label: 'Food & drinks' },
  transport: { icon: Bus, label: 'Transport' },
  books: { icon: BookOpen, label: 'Books & stationery' },
  tuition: { icon: GraduationCap, label: 'Tuition & courses' },
  health: { icon: HeartPulse, label: 'Health' },
  fun: { icon: Gamepad2, label: 'Fun & outings' },
  shopping: { icon: ShoppingBag, label: 'Shopping' },
  other: { icon: Wallet, label: 'Other' },
};

const loadEntries = (): MoneyEntry[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch { /* ignore — non-critical persistence */ }
  return [];
};

const formatRupees = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const monthKey = (date: string) => date.slice(0, 7); // YYYY-MM

export const MoneyTracker: React.FC = () => {
  const [entries, setEntries] = useState<MoneyEntry[]>(loadEntries);
  const [selectedMonth, setSelectedMonth] = useState<string>(() => new Date().toISOString().slice(0, 7));
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('food');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  // Persist real entries
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch { /* ignore — non-critical persistence */ }
  }, [entries]);

  const monthEntries = useMemo(
    () => entries.filter((e) => monthKey(e.date) === selectedMonth),
    [entries, selectedMonth],
  );

  const totals = useMemo(() => {
    const income = monthEntries.filter((e) => e.type === 'income').reduce((t, e) => t + e.amount, 0);
    const expense = monthEntries.filter((e) => e.type === 'expense').reduce((t, e) => t + e.amount, 0);
    return { income, expense, balance: income - expense };
  }, [monthEntries]);

  const categoryTotals = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of monthEntries) {
      if (e.type !== 'expense') continue;
      map.set(e.category, (map.get(e.category) || 0) + e.amount);
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [monthEntries]);

  const maxCategory = categoryTotals.length ? categoryTotals[0][1] : 1;

  const availableMonths = useMemo(() => {
    const months = new Set(entries.map((e) => monthKey(e.date)));
    months.add(new Date().toISOString().slice(0, 7));
    return [...months].sort().reverse();
  }, [entries]);

  const handleAdd = useCallback((ev: React.FormEvent) => {
    ev.preventDefault();
    const value = parseFloat(amount);
    if (!Number.isFinite(value) || value <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    const entry: MoneyEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type,
      amount: Math.round(value * 100) / 100,
      category,
      note: note.trim(),
      date,
      createdAt: Date.now(),
    };
    setEntries((prev) => [...prev, entry]);
    setAmount('');
    setNote('');
    setShowForm(false);
    setSelectedMonth(monthKey(date));
    toast.success(type === 'income' ? 'Income added 💰' : 'Expense added 🧾');
  }, [amount, type, category, note, date]);

  const handleDelete = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    toast.deleted();
  }, []);

  const monthLabel = (key: string) =>
    new Date(`${key}-01T00:00:00`).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8 pb-24">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2.5">
              <FeatureIconSm /> Money Tracker
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Track pocket money, expenses and savings — all data stays on your device.
            </p>
          </div>
          <Button variant="premium" onClick={() => setShowForm((v) => !v)} className="shrink-0">
            <Plus className="w-4 h-4" />
            Add entry
          </Button>
        </div>

        {/* Month filter */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1" role="tablist" aria-label="Month">
          {availableMonths.slice(0, 6).map((key) => (
            <button
              key={key}
              role="tab"
              aria-selected={selectedMonth === key}
              onClick={() => setSelectedMonth(key)}
              className={`px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors press ${
                selectedMonth === key
                  ? 'bg-primary text-primary-foreground shadow-soft'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {monthLabel(key)}
            </button>
          ))}
        </div>

        {/* Add form */}
        <AnimatePresence>
          {showForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              onSubmit={handleAdd}
              className="overflow-hidden mb-6"
            >
              <div className="rounded-2xl border border-border/50 bg-card shadow-soft p-4 space-y-3">
                {/* Type toggle */}
                <div className="grid grid-cols-2 gap-2">
                  {(['expense', 'income'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={`h-11 rounded-xl text-sm font-semibold transition-colors press ${
                        type === t
                          ? t === 'income'
                            ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30'
                            : 'bg-red-500/15 text-red-600 border border-red-500/30'
                          : 'bg-muted/40 text-muted-foreground border border-transparent hover:bg-muted'
                      }`}
                    >
                      {t === 'income' ? 'Income' : 'Expense'}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <label className="space-y-1.5">
                    <span className="text-xs font-medium text-muted-foreground">Amount (₹)</span>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      inputMode="decimal"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0"
                      className="w-full h-11 px-3 rounded-xl border border-input bg-background text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                      required
                    />
                  </label>
                  <label className="space-y-1.5">
                    <span className="text-xs font-medium text-muted-foreground">Date</span>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl border border-input bg-background text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                      required
                    />
                  </label>
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs font-medium text-muted-foreground">Category</span>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(CATEGORIES).map(([key, cat]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setCategory(key)}
                        className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-colors press ${
                          category === key
                            ? 'bg-primary/15 text-primary border border-primary/30'
                            : 'bg-muted/40 text-muted-foreground border border-transparent hover:bg-muted'
                        }`}
                      >
                        <cat.icon className="w-3.5 h-3.5" />
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="block space-y-1.5">
                  <span className="text-xs font-medium text-muted-foreground">Note (optional)</span>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="e.g. Physics tuition"
                    maxLength={80}
                    className="w-full h-11 px-3 rounded-xl border border-input bg-background text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </label>

                <div className="flex gap-2 pt-1">
                  <Button type="submit" variant="premium" className="flex-1">
                    Save entry
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Overview cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="rounded-2xl border border-border/50 bg-card shadow-soft p-4">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
              <Wallet className="w-3.5 h-3.5 text-primary" aria-hidden="true" /> Balance
            </div>
            <p className={`font-display text-xl sm:text-2xl font-bold ${totals.balance < 0 ? 'text-red-500' : 'text-foreground'}`}>
              {formatRupees(totals.balance)}
            </p>
          </div>
          <div className="rounded-2xl border border-border/50 bg-card shadow-soft p-4">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" aria-hidden="true" /> Income
            </div>
            <p className="font-display text-xl sm:text-2xl font-bold text-emerald-600">{formatRupees(totals.income)}</p>
          </div>
          <div className="rounded-2xl border border-border/50 bg-card shadow-soft p-4">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
              <TrendingDown className="w-3.5 h-3.5 text-red-500" aria-hidden="true" /> Expenses
            </div>
            <p className="font-display text-xl sm:text-2xl font-bold text-red-500">{formatRupees(totals.expense)}</p>
          </div>
        </div>

        {/* Category breakdown — real saved data only */}
        {categoryTotals.length > 0 && (
          <div className="rounded-2xl border border-border/50 bg-card shadow-soft p-4 mb-6">
            <h2 className="text-sm font-semibold text-foreground mb-3">Where money went — {monthLabel(selectedMonth)}</h2>
            <div className="space-y-2.5">
              {categoryTotals.map(([cat, total]) => {
                const meta = CATEGORIES[cat] || CATEGORIES.other;
                return (
                  <div key={cat} className="flex items-center gap-3">
                    <meta.icon className="w-4 h-4 text-muted-foreground flex-shrink-0" aria-hidden="true" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground truncate">{meta.label}</span>
                        <span className="font-semibold text-foreground ml-2">{formatRupees(total)}</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-primary/70 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${(total / maxCategory) * 100}%` }}
                          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Transactions list */}
        <div className="rounded-2xl border border-border/50 bg-card shadow-soft overflow-hidden">
          <h2 className="text-sm font-semibold text-foreground px-4 pt-4 pb-2">Transactions</h2>
          {monthEntries.length === 0 ? (
            <div className="px-4 pb-10 pt-4 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[hsl(var(--paper))] border border-[hsl(var(--line-color))] shadow-soft mb-4">
                <IndianRupee className="w-7 h-7 text-primary" aria-hidden="true" />
              </div>
              <p className="text-sm font-medium text-foreground">No entries for {monthLabel(selectedMonth)}</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-[260px] mx-auto">
                Add your first income or expense to see your balance and spending breakdown here.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border/40">
              <AnimatePresence initial={false}>
                {[...monthEntries].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt).map((e) => {
                  const meta = CATEGORIES[e.category] || CATEGORIES.other;
                  return (
                    <motion.li
                      key={e.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -16 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-3 px-4 py-3"
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        e.type === 'income' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-muted/50 text-muted-foreground'
                      }`}>
                        <meta.icon className="w-4 h-4" aria-hidden="true" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {e.note || meta.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(`${e.date}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          {' · '}{meta.label}
                        </p>
                      </div>
                      <span className={`text-sm font-semibold whitespace-nowrap ${
                        e.type === 'income' ? 'text-emerald-600' : 'text-foreground'
                      }`}>
                        {e.type === 'income' ? '+' : '−'}{formatRupees(e.amount)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDelete(e.id)}
                        aria-label={`Delete ${e.note || meta.label} entry`}
                        className="p-2 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors press"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

// Small brand tile next to the title (soft-depth icon tile, lightweight)
const FeatureIconSm: React.FC = () => (
  <span
    aria-hidden="true"
    className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 border border-primary/15 text-primary"
    style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7), 0 4px 12px rgba(15,23,42,0.08)' }}
  >
    <Wallet className="w-4.5 h-4.5" />
  </span>
);

export default MoneyTracker;
