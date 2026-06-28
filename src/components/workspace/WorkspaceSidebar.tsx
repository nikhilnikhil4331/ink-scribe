import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FileText, FolderClosed, FolderOpen, Star, Tag, Trash2, Plus, Search,
  ChevronRight, ChevronDown, PanelLeftClose, Sparkles, Settings,
  BookOpen, Clock, Palette, Brain, MessageCircle, BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNotebooks, Notebook } from '@/hooks/useNotebooks';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface WorkspaceSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onNewNote?: () => void;
}

export const WorkspaceSidebar: React.FC<WorkspaceSidebarProps> = ({ isOpen, onToggle, onNewNote }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notebooks, loading, deleteNotebook } = useNotebooks();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['__unfiled']));

  const folderTree = useMemo(() => {
    const filtered = notebooks.filter(n =>
      !searchQuery || n.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const folders = new Map<string, Notebook[]>();
    filtered.forEach(nb => {
      const folder = nb.folder || '__unfiled';
      if (!folders.has(folder)) folders.set(folder, []);
      folders.get(folder)!.push(nb);
    });
    return folders;
  }, [notebooks, searchQuery]);

  const favorites = useMemo(() => notebooks.filter(n => n.is_favorite).slice(0, 5), [notebooks]);

  const toggleFolder = (folder: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folder)) next.delete(folder); else next.add(folder);
      return next;
    });
  };

  if (!isOpen) return null;

  const quickActions = [
    { icon: <Sparkles className="w-4 h-4" />, label: 'AI Teacher', action: () => navigate('/ai'), color: 'text-purple-500 bg-purple-50' },
    { icon: <FileText className="w-4 h-4" />, label: 'New Note', action: onNewNote || (() => {}), color: 'text-blue-500 bg-blue-50' },
    { icon: <BookOpen className="w-4 h-4" />, label: 'Documents', action: () => navigate('/documents'), color: 'text-green-500 bg-green-50' },
    { icon: <Brain className="w-4 h-4" />, label: 'QA Tests', action: () => navigate('/qa'), color: 'text-orange-500 bg-orange-50' },
  ];

  return (
    <div className="h-full w-[260px] bg-white/40 backdrop-blur-xl border-r border-white/20 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-3 flex items-center justify-between border-b border-white/15">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg overflow-hidden flex items-center justify-center">
            <img src="/niknote-logo.png" alt="NikNote" className="w-full h-full object-contain" />
          </div>
          <span className="text-sm font-bold text-foreground">Workspace</span>
        </div>
        <Button variant="ghost" size="icon" onClick={onToggle} className="h-7 w-7 rounded-lg hover:bg-white/30">
          <PanelLeftClose className="w-4 h-4" />
        </Button>
      </div>

      {/* Search */}
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-xs rounded-lg bg-white/50 border-white/20 focus:bg-white/70"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-3 pb-3">
        <div className="grid grid-cols-2 gap-1.5">
          {quickActions.map((action) => (
            <motion.button
              key={action.label}
              whileTap={{ scale: 0.95 }}
              onClick={action.action}
              className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white/40 transition-colors"
            >
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", action.color)}>
                {action.icon}
              </div>
              <span className="text-[10px] font-medium text-muted-foreground">{action.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="h-px bg-white/15 mx-3" />

      {/* Favorites */}
      {favorites.length > 0 && (
        <div className="px-3 py-2">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Star className="w-3 h-3 text-amber-500" />
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Favorites</span>
          </div>
          {favorites.map((nb) => (
            <motion.button
              key={nb.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/notebooks`)}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/40 transition-colors text-left"
            >
              <FileText className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
              <span className="text-xs text-foreground truncate">{nb.title}</span>
            </motion.button>
          ))}
        </div>
      )}

      {/* Folders & Notes */}
      <ScrollArea className="flex-1">
        <div className="px-3 py-2">
          <div className="flex items-center gap-1.5 mb-2">
            <FolderOpen className="w-3 h-3 text-blue-500" />
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Folders</span>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-6 bg-white/30 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : folderTree.size === 0 ? (
            <div className="text-center py-6">
              <FileText className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-[11px] text-muted-foreground">No notes yet</p>
              <Button variant="ghost" size="sm" onClick={onNewNote} className="mt-2 text-xs h-7">
                <Plus className="w-3 h-3 mr-1" /> Create first note
              </Button>
            </div>
          ) : (
            Array.from(folderTree.entries()).map(([folder, nbs]) => {
              const isExpanded = expandedFolders.has(folder);
              const isUnfiled = folder === '__unfiled';
              return (
                <div key={folder} className="mb-1">
                  <button
                    onClick={() => toggleFolder(folder)}
                    className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-white/40 transition-colors"
                  >
                    {isExpanded ? <ChevronDown className="w-3 h-3 text-muted-foreground" /> : <ChevronRight className="w-3 h-3 text-muted-foreground" />}
                    {isUnfiled ? <FolderClosed className="w-3.5 h-3.5 text-blue-400" /> : <FolderOpen className="w-3.5 h-3.5 text-amber-500" />}
                    <span className="text-xs font-medium text-foreground flex-1 text-left truncate">
                      {isUnfiled ? 'My Notes' : folder}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{nbs.length}</span>
                  </button>
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden ml-5">
                        {nbs.map((nb) => (
                          <motion.button
                            key={nb.id}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate('/notebooks')}
                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/40 transition-colors text-left group"
                          >
                            <FileText className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                            <span className="text-[11px] text-foreground truncate flex-1">{nb.title}</span>
                            <button
                              onClick={(e) => { e.stopPropagation(); deleteNotebook(nb.id); }}
                              className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-50 transition-all"
                            >
                              <Trash2 className="w-2.5 h-2.5 text-red-400" />
                            </button>
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* Bottom section */}
      <div className="p-3 border-t border-white/15 space-y-1">
        <button onClick={() => navigate('/notebooks')} className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/40 transition-colors text-left">
          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Recent</span>
        </button>
        <button onClick={() => navigate('/account')} className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/40 transition-colors text-left">
          <Settings className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Settings</span>
        </button>
        {user ? (
          <div className="flex items-center gap-2 px-2 py-1.5">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center">
              <span className="text-[10px] text-white font-bold">{user.email?.[0]?.toUpperCase() || 'U'}</span>
            </div>
            <span className="text-[11px] text-muted-foreground truncate">{user.email?.split('@')[0]}</span>
          </div>
        ) : (
          <button onClick={() => navigate('/login')} className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/40 transition-colors text-left">
            <span className="text-xs text-primary font-medium">Sign in</span>
          </button>
        )}
      </div>
    </div>
  );
};
