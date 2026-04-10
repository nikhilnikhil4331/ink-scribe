

# NikNote 3.0 — Implementation Plan

This is a massive enhancement covering 5 sections. We'll implement in the exact priority order specified: **A → B → C1+C3 → C2 → C4+C5**.

---

## Section A: Mobile UI Fixes (Foundation)

### A1. Fix Top Toolbar (Index.tsx + Toolbar.tsx)
- Add `useIsMobile()` check in the header section of `Index.tsx`
- On mobile (<768px): show only "NikNote" logo (left) and "Export PDF" button (right)
- Move MoodSelector, Reset, Dark Mode, Glass toggle, Undo/Redo into a `DropdownMenu` (from `src/components/ui/dropdown-menu.tsx`) triggered by a ⋮ icon
- Desktop layout stays unchanged

### A2. Create Bottom Navigation Bar (MobileBottomNav.tsx)
- New component: `src/components/MobileBottomNav.tsx`
- Fixed bottom bar with 3 tabs: Write (📝), Style (🎨), Preview (👁️)
- Uses `--primary` color for active tab highlight
- Only renders on mobile via `useIsMobile()`
- Framer Motion 0.3s fade transitions
- State managed in `Index.tsx` — new state: `mobileTab: 'write' | 'style' | 'preview'`

### A3. Convert Settings to Bottom Sheet
- When Style tab is tapped, open a bottom sheet (new `MobileStyleSheet.tsx`) covering 75% screen
- Organizes: Ink Colors (3×3 grid from PenPalette), Font Selection (from FontPreviewPanel), Paper Type (from ControlPanel), Spacing sliders, Voice Typing button, Real Pen Mode toggle
- Backdrop blur + swipe-down dismissible
- Remove floating FAB stack (`bottom-6 right-4` block in Index.tsx) on mobile

### A4. One Screen One Purpose
- When `mobileTab === 'write'`: render only `LineBasedEditor` full-screen, hide preview card and `MobileLivePreview`
- When `mobileTab === 'preview'`: render only `NotebookPreview` full-screen
- Remove the existing `Tabs` (Write/Preview toggle) on mobile, replace with bottom nav driven views

### A5. Quick Styles Bar Above Keyboard
- New component: `src/components/QuickStylesBar.tsx` (44px height)
- Shows 3 recent ink colors + 2 recent fonts + 🎨 icon to open full sheet
- Appears when editor is focused on mobile (use `focus`/`blur` events)
- Store recent selections in `localStorage`

**Files modified:** `Index.tsx`, `Toolbar.tsx`
**Files created:** `MobileBottomNav.tsx`, `MobileStyleSheet.tsx`, `QuickStylesBar.tsx`

---

## Section B: Handwriting Copy Engine Fix

### B1. Improve Analysis Pipeline
- Edit `supabase/functions/analyze-handwriting/index.ts`
- Replace the AI prompt with the enhanced forensic analysis prompt from the directive
- Return additional fields: `slant`, `stroke_thickness`, `pen_pressure_feel`, `letter_spacing_variation`
- Save all parameters to `handwriting_models` table (columns already exist)
- Apply slant/pressure in `HandwritingLine.tsx` and `HandwrittenText.tsx` via CSS transforms

### B2. Improve Analysis UI Flow
- Rewrite `HandwritingAnalyzer.tsx` with 3-step flow:
  - Step 1: Upload screen with example images and helper text
  - Step 2: Animated loading with sequential messages (Framer Motion text transitions)
  - Step 3: Side-by-side comparison (original vs rendered) + parameter meters + Save/Retry buttons

**Files modified:** `analyze-handwriting/index.ts`, `HandwritingAnalyzer.tsx`, `HandwritingLine.tsx`, `HandwrittenText.tsx`

---

## Section C1+C3: Notebooks + Share

### C1. Notebook & Folder Organization
- Create new page: `src/pages/MyNotebooks.tsx` with route `/notebooks`
- Query `notebooks` table, display as cards with title, date, page count, cover color
- Add `folder` column to `notebooks` table (migration)
- Create/delete/rename folders
- Search bar querying notebook titles
- Swipe-to-delete using Framer Motion drag gestures

### C3. Share as Exact Copy
- Add "Share as Image" and "Share as PDF" buttons in `StepPreview.tsx` and the Preview tab in `Index.tsx`
- Image: Use `html2canvas` to capture current page as PNG, then `navigator.share({ files })` with fallback to download
- PDF: Use existing `exportToPDF`, then share via Web Share API
- Add "Made with NikNote" watermark (removable for Pro via `usePremium`)

**Files created:** `MyNotebooks.tsx`
**Files modified:** `Index.tsx`, `StepPreview.tsx`
**Migration:** Add `folder` text column to `notebooks`

---

## Section C2: Rich Content in Editor

### Checklists
- In `LineBasedEditor.tsx`, detect `[] ` prefix → render as checkbox line
- Toggle between ☐/☑ on tap, apply strikethrough
- Render as hand-drawn checkboxes in preview

### Headings
- Detect `# ` and `## ` prefixes → apply larger/bold styling
- Render proportionally larger handwriting in preview

### Bullet Points
- Detect `- ` prefix → render as bullet point with hand-drawn dot in preview

### Highlighting
- Text selection + color picker → store highlight metadata per line
- Render semi-transparent color block in preview

**Files modified:** `LineBasedEditor.tsx`, `HandwritingLine.tsx`, `NotebookPreview.tsx`, `noteLine.ts`

---

## Section C4+C5: Search + Tags

### C4. Universal Search
- Add search overlay in `MyNotebooks.tsx`
- Full-text search across notebook titles and page content (JSONB)
- Results as highlighted notebook cards

### C5. Tags System
- Migration: Add `tags text[]` column to `notebooks` table
- Tag input UI in notebook creation/edit
- Filter notebooks by tag in `MyNotebooks.tsx`
- Colored tag chips display

**Migration:** Add `tags` array column to `notebooks`
**Files modified:** `MyNotebooks.tsx`

---

## Implementation Order
1. Section A (all 5 sub-tasks) — mobile UI foundation
2. Section B (B1 + B2) — handwriting engine
3. Section C1 + C3 — notebooks + sharing
4. Section C2 — rich content
5. Section C4 + C5 — search + tags

Each section will be tested against the scenarios in Section D before moving to the next.

