# Web App Dev Starter

This is a starter template for building web apps. It comes with everything set up so you can jump straight into writing features instead of spending hours configuring tools.

To create your own project from this template, click **Use this template** on GitHub.


## How To

- **Add a new page** — Create a file in `src/routes/`. The file name becomes the URL path (e.g. `src/routes/about.tsx` → `/about`). See `src/routes/index.tsx` for a working example.
- **Add a UI component** — Run `pnpm dlx shadcn@latest add button` (swap `button` for any component name). It gets copied into `src/components/ui/`. Browse all components at [ui.shadcn.com](https://ui.shadcn.com/docs/components).
- **Fetch data from an API** — Use TanStack Query's `useQuery` hook. See `src/lib/api.ts` for an example.
- **Share state between components** — Use a Zustand store. See `src/stores/example.ts` for the pattern.
- **Use environment variables** — Copy `.env.example` to `.env`. Variables must start with `VITE_` to be available in your app.

## Scripts

| Command          | What it does                           |
| ---------------- | -------------------------------------- |
| `pnpm dev`       | Start the development server           |
| `pnpm build`     | Build the app for production           |
| `pnpm preview`   | Preview the production build locally   |
| `pnpm check`     | Run the linter and formatter (Biome)   |
| `pnpm typecheck` | Check for TypeScript errors            |


## What's Inside

Here's every major tool in this project and what it does.

### React

React is a JavaScript library for building user interfaces. Instead of writing raw HTML that updates the whole page, you write small, reusable **components** (like a button, a form, or a card) and React efficiently updates only the parts of the page that change.

Docs: [react.dev](https://react.dev/learn)

### TypeScript

TypeScript is JavaScript with **types**. Types tell your editor (and your teammates) what kind of data a variable holds — is it a string? A number? An array of objects? This catches bugs before you even run your code. Every `.tsx` and `.ts` file in this project uses TypeScript.

Docs: [typescriptlang.org](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html)

### Vite

Vite (pronounced "veet") is the **build tool** that runs your app during development and bundles it for production. When you run `pnpm dev`, Vite starts a local server and instantly refreshes the browser whenever you save a file. It's extremely fast.

Docs: [vite.dev](https://vite.dev/guide/)

### Tailwind CSS

Tailwind is a **CSS framework** that lets you style elements using short utility classes directly in your HTML/JSX. Instead of writing a separate CSS file with `.card { padding: 16px; border-radius: 8px; }`, you write `<div className="p-4 rounded-lg">`. It keeps your styles right next to the elements they apply to.

Docs: [tailwindcss.com](https://tailwindcss.com/docs)

### shadcn/ui

shadcn is a **component library** — a collection of pre-built UI pieces like buttons, dialogs, dropdowns, and more. Unlike most component libraries, shadcn copies the component source code into your project (into `src/components/ui/`), so you own it and can customize it however you want.

Docs: [ui.shadcn.com](https://ui.shadcn.com/docs)

### TanStack Router

TanStack Router handles **navigation** between pages. It uses **file-based routing**, which means every file you create in the `src/routes/` folder automatically becomes a page in your app. For example, `src/routes/about.tsx` becomes the `/about` page. No manual route configuration needed.

Docs: [tanstack.com/router](https://tanstack.com/router/latest/docs/framework/react/overview)

### TanStack Query

TanStack Query (also called React Query) manages **data fetching**. It handles loading states, error states, caching, and background refetching for you. Instead of writing `useState` + `useEffect` + error handling every time you fetch data, you call `useQuery` and it takes care of everything.

Docs: [tanstack.com/query](https://tanstack.com/query/latest/docs/framework/react/overview)

### Zustand

Zustand (German for "state") is a **state management** library. When multiple components need to share the same data (like a logged-in user or a shopping cart), you put that data in a Zustand store. Any component can read from or write to the store, and they'll all stay in sync.

Docs: [zustand.docs.pmnd.rs](https://zustand.docs.pmnd.rs/getting-started/introduction)

### Biome

Biome is a **linter and formatter**. A linter checks your code for common mistakes and bad patterns. A formatter makes your code look consistent (indentation, spacing, semicolons, etc.). Biome does both, and it runs automatically every time you save a file in VS Code and every time you commit code.

Docs: [biomejs.dev](https://biomejs.dev/guides/getting-started/)

### Husky + lint-staged

Husky runs **git hooks** — scripts that execute automatically at certain points in your git workflow. In this project, Husky runs Biome on every file you're about to commit (using lint-staged to target only the changed files). This prevents badly formatted or buggy code from getting into the repository.

Docs: [typicode.github.io/husky](https://typicode.github.io/husky/) · [lint-staged](https://github.com/lint-staged/lint-staged)

### pnpm

pnpm is a **package manager**, like npm or yarn, but faster and more disk-efficient. You use it to install libraries (`pnpm install`), add new ones (`pnpm add some-library`), and run scripts (`pnpm dev`).

Docs: [pnpm.io](https://pnpm.io/motivation)

### Cloudflare Pages

When you're ready to put your app on the internet, it gets deployed to **Cloudflare Pages**. The `wrangler.jsonc` file contains the deployment configuration. Cloudflare is fast, free for small projects, and handles all the server stuff for you.

Docs: [developers.cloudflare.com/pages](https://developers.cloudflare.com/pages/)

### GitHub Actions

GitHub Actions is a **CI/CD** (continuous integration / continuous deployment) tool. Every time you open a pull request, it automatically runs checks — linting, type checking, and building your app — to make sure nothing is broken before your code gets merged.

Docs: [docs.github.com/actions](https://docs.github.com/en/actions/quickstart)

## Quick Start

```bash
pnpm install
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Project Structure

```
src/
├── components/
│   ├── ui/          # shadcn components (don't edit directly)
│   └── Header.tsx   # Navigation bar
├── data/            # Static data files
├── lib/
│   ├── api.ts       # API helpers
│   └── utils.ts     # Utility functions
├── routes/
│   ├── __root.tsx   # Root layout (wraps all pages)
│   └── index.tsx    # Home page (/)
├── stores/
│   └── example.ts   # Example Zustand store (replace with your own)
├── main.tsx         # App entry point
├── router.tsx       # Router setup
└── index.css        # Global styles and theme
```
