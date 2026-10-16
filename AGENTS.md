# AGENTS.md — NikNote (ink-scribe)

> Project instructions for AI coding agents (Claude Code, Codex, Cursor, Copilot, Arena, etc.).
> Behavioral guidelines adapted from [multica-ai/andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills) (MIT)
> — derived from Andrej Karpathy's observations on LLM coding pitfalls.
> Specialist agent personas live in `.claude/agents/` — adapted from [msitarzewski/agency-agents](https://github.com/msitarzewski/agency-agents) (MIT).

---

## Project Snapshot

- **Product**: NikNote — AI study app for Indian students (handwriting notes, AI teacher, quizzes, flashcards)
- **Production**: https://niknote.online
- **Stack**: Vite + React 18 + TypeScript + Tailwind + shadcn/ui (Radix) + Supabase + Framer Motion
- **Entry**: `src/App.tsx` (routes) → `src/pages/Index.tsx` (main editor app, stays EAGER — no lazy waterfall on `/`)
- **Build**: `npm run build` (vite). `npx tsc -p tsconfig.app.json --noEmit` must pass with **0 errors** — vite does NOT typecheck, so run tsc yourself.
- **Install quirk**: `PUPPETEER_SKIP_DOWNLOAD=true npm install` (puppeteer's Chrome download is blocked in sandboxes)

## Known Pitfalls (from past bugs — check these first)

1. **Stale type definitions cause live crashes.** `Zap is not defined` shipped because tsc wasn't run. Always run `npx tsc -p tsconfig.app.json --noEmit` before finishing.
2. **Heavy libs must stay lazy.** jspdf/html2canvas (`vendor-pdf`), recharts (`vendor-charts`), fabric (`vendor-canvas`) must never be statically imported by the home-page graph. Use `await import('...')` inside the function that needs them. After `npm run build`, verify the entry chunk's static imports don't include those vendor chunks.
3. **Sitemap ↔ robots consistency.** `public/sitemap.xml` must never contain URLs that `public/robots.txt` disallows (`/auth`, `/payment`, `/admin*`, `/login`, `/signup`), nor blog slugs that don't exist in `src/pages/Blog.tsx`.
4. **HandwritingDNA fields are split**: core fields (`pressure`, `strokeWidth`, `spacing`...) are required; v2 fields (`penPressure`, `strokeThickness`, `baselineDrift`, `letterSpacing`, `wordSpacing`, `closestFont`, `confidence`) are optional — always `?? fallback` when reading.
5. **Toast system**: use `@/components/NikNoteToast` (`toast.success/error/copied/saved`) — there is no `./Toast` module.
6. **ErrorBoundary auto-recovery** exists for stale-SW cache crashes. Don't weaken it; if you change `public/sw.js`, bump its cache version.

## Behavior Rules (Karpathy guidelines)

**Tradeoff:** These bias toward caution over speed. For trivial tasks, use judgment.

### 1. Think Before Coding
**Don't assume. Don't hide confusion. Surface tradeoffs.**
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them — don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

### 2. Simplicity First
**Minimum code that solves the problem. Nothing speculative.**
- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

### 3. Surgical Changes
**Touch only what you must. Clean up only your own mess.**
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it — don't delete it.
- Remove imports/variables/functions that YOUR changes made unused.

The test: Every changed line should trace directly to the user's request.

### 4. Goal-Driven Execution
**Define success criteria. Loop until verified.**
- "Add validation" → write tests for invalid inputs, then make them pass
- "Fix the bug" → write a test that reproduces it, then make it pass
- "Refactor X" → ensure checks pass before and after

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
```

## Definition of Done (every change)

1. `npx tsc -p tsconfig.app.json --noEmit` → 0 errors
2. `npm run build` → succeeds; if perf-sensitive, compare chunk sizes
3. Changed lines trace to the request (surgical diffs)
4. No new static imports of jspdf / html2canvas / recharts / fabric in the home-page graph

---

*These guidelines are working if: fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.*
