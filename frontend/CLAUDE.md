# Signal Monitor Frontend

## Stack
- React + TypeScript
- TanStack Query for data fetching
- Tremor blocks for UI components
- React Router for routing
- Vite dev server at http://localhost:5173

## File structure

src/
  auth/          — reference feature
  dashboard/     — active feature (flat structure)
  main.tsx
  router.ts

### Structure rules
- Stay flat inside each feature folder
- Do not create subfolders until a single concern (components, hooks, queries)
  reaches 3+ files
- Current dashboard structure:
  - ResultCard.tsx
  - FilterBar.tsx
  - StatsBar.tsx
  - ResultSkeleton.tsx
  - EmptyState.tsx
  - useFilters.ts
  - queries.ts
  - dashboard.tsx
  - index.ts

## Rules (always follow)

### Code style
- All API types come from `@signal-monitor/shared` — never define them locally
- Never repeat Tailwind class combinations — extract repeated patterns into named components
- Use Tremor blocks for UI components wherever available
- Reference `src/auth/` for file structure, query patterns, and conventions

### Data fetching
- Use TanStack Query for all API calls — follow the pattern in `src/auth/queries.ts`
- On mutation success, invalidate the relevant query cache — do not use optimistic updates
- Always handle three states: loading skeleton, error with retry, empty state

## Testing Requirements
After any UI change, run `/accessibility` to check semantic HTML and ARIA correctness.

After any UI change, run Playwright tests across three viewports:
- Desktop: 1280×800
- Tablet: devices['iPad Mini']  
- Mobile: devices['iPhone SE'] (smallest common breakpoint)

Flag any layout breaks or console errors per viewport.

### What not to do
- Do not define API response types locally — use @signal-monitor/shared
- Do not use optimistic updates — invalidate and refetch
- Do not install new packages without asking first

## Design
For all visual work, refer to `THEME.md` for the color palette and token definitions.
