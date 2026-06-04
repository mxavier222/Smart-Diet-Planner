---
name: add-documentation
description: Follow this skill when creating, updating, or reorganizing any documentation under /docs. Ensures docs stay DRY, correctly categorized, agent-optimized, and indexed.
---

# Add or Update Documentation

Follow these steps whenever you create new documentation or modify existing docs.

## Step 1 — Determine if documentation is needed

Before creating a new file:

1. **Search existing docs.** Does a file already cover this topic? Update it instead.
2. **Is this project-specific?** Don't document generic knowledge. Only document what an agent couldn't know: project conventions, non-obvious decisions, custom tooling. For framework APIs, point to llms.txt instead.
3. **Is this actionable?** Skip "nice to know" content that wouldn't change agent behavior.

## Step 2 — Create the file

All docs live directly in `docs/` — no subfolders. Skills live separately in `.agents/skills/`.

### File naming

- Lowercase, hyphen-separated: `error-handling.md`
- Noun-first: `conventions.md`, `domain.md`, `deployment.md`
- No generic names: never `guide.md`, `notes.md`, `misc.md`, `readme.md`
- Max 4 words. If you need more, the scope is too broad — split the doc.

### Frontmatter

Every markdown file under `docs/` must start with YAML frontmatter:

```yaml
---
name: short-kebab-name
description: One sentence. What this covers and when an agent should read it.
---
```

- `name`: Must match the filename without `.md`. Lowercase, hyphens only, max 64 chars.
- `description`: Max 1024 chars. Must answer: (1) what does this cover, and (2) when should an agent read it.

### Content guidelines

- Lead with the most important information.
- No filler. Cut "In this document, we will...", "It's important to note that...".
- Keep it under 300 lines. If longer, split into multiple focused docs.
- **DRY.** Before writing, confirm the information doesn't already exist in another doc, in a skill, or in AGENTS.md. If it does, reference it: `→ See docs/conventions.md`

## Step 3 — Validate

- [ ] File is directly in `docs/`, not in a subfolder
- [ ] Frontmatter `name` matches filename
- [ ] Description answers "what" and "when to read"
- [ ] Content is project-specific, not generic framework knowledge

## Step 4 — DRY check

After any doc change, verify no duplication was introduced:

1. **Search for overlap.** Grep key phrases from your new/updated content across `/docs` and `AGENTS.md`. If the same information appears in multiple places, consolidate.
2. **Reference, don't repeat.** If you find duplication, keep the content in one canonical location and replace other occurrences with a pointer: `→ See docs/path/to/file.md`
