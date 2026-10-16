# CLAUDE.md

Project guidance for Claude Code — full content lives in [AGENTS.md](./AGENTS.md) (shared by all coding agents).

@AGENTS.md

## Quick reminders
- Run `npx tsc -p tsconfig.app.json --noEmit` before finishing any change (vite build does not typecheck).
- Keep jspdf/html2canvas/recharts/fabric out of the home-page static import graph.
- Specialist personas: `.claude/agents/` (frontend-developer, code-reviewer, seo-specialist, performance-engineer, qa-reality-checker, ux-finish-gate).
- Behavioral rules in this file follow [multica-ai/andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills) (MIT): think before coding, simplicity first, surgical changes, goal-driven execution.
