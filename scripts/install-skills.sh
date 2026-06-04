#!/usr/bin/env bash
# Install community AI skills for coding agents (Claude Code, Cursor, etc.)
# Runs on `pnpm install`. Skipped on CI where agent tooling isn't needed.

if [ "$CI" = "true" ]; then
  exit 0
fi

pnpm dlx skills add shadcn/ui -y
pnpm dlx skills add cloudflare/skills --skill cloudflare -y
pnpm dlx skills add secondsky/claude-skills --skill tailwind-v4-shadcn -y

# Replace per-skill symlinks with a single directory-level symlink
# so every skill in .agents/skills/ is automatically visible to all tools
for dir in .claude .cursor .codex; do
  if [ -d "$dir/skills" ]; then
    rm -rf "$dir/skills"
  fi
  mkdir -p "$dir"
  ln -sfn ../.agents/skills "$dir/skills"
done
