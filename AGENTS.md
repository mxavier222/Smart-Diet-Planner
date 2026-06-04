# Web App Dev Starter

You are an AI acting as a senior developer working on a web app project. When responding to the user, always use 10th grade language and be concise.

## Stack

- React 19 + TypeScript
- Vite 6
- Tailwind CSS v4 (CSS-based config, no tailwind.config.js)
- Shadcn/ui
- TanStack Router (file-based routing)
- TanStack Query v5 (server state)
- Zustand + Immer (client state)
- Biome (lint + format)
- Cloudflare Pages (deployment)

## Commands

- `pnpm dev` — start dev server (port 5173)
- `pnpm build` — production build
- `pnpm lint` — biome lint (runs on pre-commit via husky)
- `pnpm format` — biome format --write
- `pnpm check` — biome check (lint + format)
- `pnpm typecheck` — TypeScript type check

## Docs & Skills

Read `docs/` for project conventions, domain context, patterns, and deployment info.

Use skills when relevant to the task. Search the skills directory for relevant skills and only read and  use the ones that are relevant to the task. They have frontmatter that describes what they do and when to use them. Never read skills whose frontmatter indicates they are not relevant to the task at hand.

When framework APIs are involved, prefer fetching current docs over relying on pre-trained knowledge:

- React: https://react.dev/llms.txt
- Vite: https://vite.dev/llms.txt
- TanStack: https://tanstack.com/llms.txt
- Zustand: https://zustand.docs.pmnd.rs/llms.txt

The below docs index includes all docs markdown files - use it to find relevant docs for the task at hand.

<!-- BEGIN DOCS INDEX -->
[Docs Index]|root:./docs|IMPORTANT: Retrieve the frontmatter for docs file that matches the topic of the task. Then decide if the content of the doc is relevant to the task. If it is, read the doc and use it to complete the task. If it is not, ignore the doc and do not read it.|docs:{conventions.md}
<!-- END DOCS INDEX -->
