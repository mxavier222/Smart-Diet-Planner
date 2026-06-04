---
name: conventions
description: Coding conventions for this project — component patterns, styling, state management boundaries, formatting. Read before writing any code.
---

# Conventions

## Components

- Functional components only, no class components
- Named exports for components, default exports for route files
- Tests co-located: `Component.test.tsx` next to `Component.tsx`

## Styling

- Tailwind utility classes only — no custom CSS, no inline styles
- Shadcn semantic colors (`bg-primary`, `text-muted-foreground`) — never raw colors like `bg-blue-500`
- Shadcn/ui components live in `src/components/ui/`. Add more with `pnpm dlx shadcn@latest add <name>`

## State Management

- Server data → TanStack Query. Client-only state → Zustand. Never mix.
- Never duplicate server data into Zustand stores
- One Zustand store per domain in `src/stores/`
- Never `useEffect` + `fetch` — always `useQuery`
- Invalidate related queries after mutations, don't manually update cache

## Formatting

- Biome: tab indentation, double quotes
- Run `pnpm check` before committing
