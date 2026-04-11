import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FileText, FolderClosed, FolderOpen, Star, Tag, Trash2, Plus, Search,
  ChevronRight, ChevronDown, PanelLeftClose, Heart, Sparkles, Settings, MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNotebooks, Notebook } from '@/hooks/useNotebooks';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';

interface WorkspaceSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onNewNote?: () => void;
}

export const WorkspaceSidebar: React.FC<WorkspaceSidebarProps> = ({ isOpen, onToggle, onNewNote }) => {
  const navigate = useNavigate();
  const { user: _user } = useAuth();
  const { notebooks, loading, deleteNotebook } = useNotebooks();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['__unfiled']));
  const [showTrash, setShowTrash] = useState(false);

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

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    notebooks.forEach(n => n.tags?.forEach(t => tags.add(t)));
    return Array.from(tags).sort();
  }, [notebooks]);

  const favorites = useMemo(() => notebooks.slice(0, 3), [notebooks]);

  const toggleFolder = (folder: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folder)) next.delete(folder); else next.add(folder);
      return next;
    });
  };

  if (!isOpen) return null;

  return (
    <motion.aside
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 280, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 35 }}
      className="h-full border-r border-white/20 bg-white/15 backdrop-blur-2xl flex flex-col flex-shrink-0 overflow-hidden"
    >
      {/* Header with Lovable branding */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/15">
        <div className="flex items-center gap-2">
          <span className="text-base">✨</span>
          <span className="text-lg font-bold tracking-tight" style={{ fontFamily: "'Satisfy', cursive" }}>
            <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 bg-clip-text text-transparent">Niknote</span>
          </span>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-white/20" onClick={onToggle}>
          <PanelLeftClose className="w-4 h-4 text-muted-foreground" />
        </Button>
      </div>

      {/* Search */}
      <div className="px-3 py-2.5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="h-9 text-xs pl-9 rounded-xl bg-white/30 backdrop-blur-sm border-white/20 focus-visible:ring-1 focus-visible:ring-primary/30 placeholder:text-muted-foreground/60"
          />
        </div>
      </div>

      {/* New Note Button */}
      <div className="px-3 pb-2">
        <Button
          size="sm"
          className="w-full gap-2 h-9 text-xs rounded-xl bg-gradient-to-r from-purple-400/80 to-indigo-400/80 text-white border-0 hover:from-purple-500/90 hover:to-indigo-500/90 shadow-sm backdrop-blur-sm"
          onClick={onNewNote || (() => navigate('/notebooks'))}
        >
          <Plus className="w-3.5 h-3.5" />
          New Note
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="px-2 py-1 space-y-1">
          {/* AI Solver */}
          <SidebarItem
            icon={<Sparkles className="w-4 h-4 text-purple-500" />}
            label="AI Solver"
            onClick={() => navigate('/ai-solver')}
            highlighted
          />

          {/* Favorites */}
          {favorites.length > 0 && (
            <SidebarSection title="Favorites" icon={<Star className="w-3.5 h-3.5" />}>
              {favorites.map(nb => (
                <NotebookItem key={nb.id} notebook={nb} onDelete={deleteNotebook} />
              ))}
            </SidebarSection>
          )}

          {/* All Notes */}
          <SidebarSection title="All Notes" icon={<FileText className="w-3.5 h-3.5" />} defaultOpen>
            {Array.from(folderTree.entries()).map(([folder, nbs]) => (
              <FolderItem
                key={folder}
                folder={folder}
                notebooks={nbs}
                isExpanded={expandedFolders.has(folder)}
                onToggle={() => toggleFolder(folder)}
                onDelete={deleteNotebook}
              />
            ))}
            {folderTree.size === 0 && !loading && (
              <p className="text-[11px] text-muted-foreground px-3 py-2">No notebooks yet</p>
            )}
          </SidebarSection>

          {/* Tags */}
          {allTags.length > 0 && (
            <SidebarSection title="Tags" icon={<Tag className="w-3.5 h-3.5" />}>
              <div className="flex flex-wrap gap-1 px-2 py-1">
                {allTags.map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-primary/10 text-primary cursor-pointer hover:bg-primary/20 transition-colors"
                    onClick={() => setSearchQuery(tag)}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </SidebarSection>
          )}

          {/* Trash */}
          <SidebarItem
            icon={<Trash2 className="w-4 h-4 text-muted-foreground" />}
            label="Trash"
            onClick={() => setShowTrash(!showTrash)}
          />
        </div>
      </ScrollArea>

      {/* Bottom: Settings */}
      <div className="border-t border-white/15 p-2">
        <SidebarItem
          icon={<Settings className="w-4 h-4 text-muted-foreground" />}
          label="Settings"
          onClick={() => navigate('/account')}
        />
      </div>
    </motion.aside>
  );
};

// Sub-components

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  className?: string;
  active?: boolean;
  highlighted?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, onClick, className, active, highlighted }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-2.5 w-full px-2.5 py-2 rounded-xl text-sm transition-all duration-200 group",
      active ? "bg-white/25 text-foreground font-medium shadow-sm" : "text-foreground/80 hover:bg-white/15",
      highlighted && "bg-white/10 font-medium",
      className
    )}
  >
    {icon}
    <span className="truncate flex-1 text-left">{label}</span>
  </button>
);

interface SidebarSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const SidebarSection: React.FC<SidebarSectionProps> = ({ title, icon, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 w-full px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
      >
        {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        {icon}
        <span>{title}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface FolderItemProps {
  folder: string;
  notebooks: Notebook[];
  isExpanded: boolean;
  onToggle: () => void;
  onDelete: (id: string) => void;
}

const FolderItem: React.FC<FolderItemProps> = ({ folder, notebooks, isExpanded, onToggle, onDelete }) => {
  const isUnfiled = folder === '__unfiled';
  return (
    <div>
      <button
        onClick={onToggle}
        className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-xl text-sm text-foreground/80 hover:bg-white/15 transition-colors group"
      >
        {isExpanded
          ? <FolderOpen className="w-4 h-4 text-amber-500 flex-shrink-0" />
          : <FolderClosed className="w-4 h-4 text-amber-500 flex-shrink-0" />}
        <span className="truncate flex-1 text-left text-xs">
          {isUnfiled ? 'Unfiled Notes' : folder}
        </span>
        <span className="text-[10px] text-muted-foreground">{notebooks.length}</span>
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden pl-4"
          >
            {notebooks.map(nb => (
              <NotebookItem key={nb.id} notebook={nb} onDelete={onDelete} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface NotebookItemProps {
  notebook: Notebook;
  onDelete: (id: string) => void;
}

const NotebookItem: React.FC<NotebookItemProps> = ({ notebook, onDelete }) => (
  <div className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-xl text-sm text-foreground/80 hover:bg-white/15 transition-colors group cursor-pointer">
    <div
      className="w-3 h-3 rounded-sm flex-shrink-0"
      style={{ backgroundColor: notebook.cover_color }}
    />
    <span className="truncate flex-1 text-left text-xs">{notebook.title}</span>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-white/20">
          <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        <DropdownMenuItem
          className="text-destructive text-xs"
          onClick={() => onDelete(notebook.id)}
        >
          <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
);
