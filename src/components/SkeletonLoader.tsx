// ============================================================
// SkeletonLoader — Reusable skeleton/shimmer loading components
// Use these wherever data is being fetched
// ============================================================

import { cn } from '@/lib/utils';

// Base skeleton line
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-shimmer rounded-lg', className)}
      {...props}
    />
  );
}

// ============================================================
// Editor Skeleton — When notebook is loading
// ============================================================
export function EditorSkeleton() {
  return (
    <div className="p-6 space-y-6">
      {/* Title */}
      <Skeleton className="h-8 w-48" />
      
      {/* Toolbar */}
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-9 rounded-lg" />
        ))}
        <Skeleton className="h-9 w-px mx-1" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={`b-${i}`} className="h-9 w-9 rounded-lg" />
        ))}
      </div>

      {/* Editor lines */}
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-6"
            style={{ width: `${60 + Math.random() * 35}%` }}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Preview Skeleton — When preview is generating
// ============================================================
export function PreviewSkeleton() {
  return (
    <div className="p-8 bg-paper rounded-2xl space-y-4">
      {/* Paper header */}
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16" />
      </div>

      {/* Handwritten-style lines with varying widths */}
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-0.5 w-0.5 rounded-full" />
          <Skeleton
            className="h-5"
            style={{
              width: `${50 + Math.random() * 45}%`,
              fontFamily: 'Caveat, cursive',
            }}
          />
        </div>
      ))}
      
      <div className="mt-6 text-center">
        <Skeleton className="h-3 w-32 mx-auto" />
      </div>
    </div>
  );
}

// ============================================================
// Notebook Card Skeleton — For notebooks list
// ============================================================
export function NotebookCardSkeleton() {
  return (
    <div className="panel-card p-4 space-y-3">
      <div className="flex items-start gap-3">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="flex justify-between items-center pt-2 border-t">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-7 w-7 rounded-lg" />
      </div>
    </div>
  );
}

// ============================================================
// Notebook Grid Skeleton — Multiple cards
// ============================================================
export function NotebookGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <NotebookCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ============================================================
// AI Analysis Skeleton — For handwriting analyzer
// ============================================================
export function AIAnalysisSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-56" />
        </div>
      </div>
      
      {/* Analysis steps */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex gap-3 items-center p-3 rounded-xl bg-muted/50">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-2 w-48" />
          </div>
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>
      ))}
    </div>
  );
}

// ============================================================
// Style Selector Skeleton — Font/paper selector
// ============================================================
export function StyleSelectorSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-4 w-24" />
      <div className="flex gap-2 overflow-x-auto pb-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="w-16 h-20 rounded-xl flex-shrink-0" />
        ))}
      </div>
    </div>
  );
}
