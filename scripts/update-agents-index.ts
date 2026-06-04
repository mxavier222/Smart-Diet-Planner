/**
 * update-agents-index.ts
 *
 * Scans /docs for markdown files, extracts filenames,
 * and injects a compressed index into AGENTS.md between marker comments.
 *
 * Usage:
 *   pnpm exec tsx scripts/update-agents-index.ts
 *   pnpm exec tsx scripts/update-agents-index.ts --agents-file CLAUDE.md
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from "fs";
import { join, resolve, dirname } from "node:path";

// --- Constants ---

const BEGIN_MARKER = "<!-- BEGIN DOCS INDEX -->";
const END_MARKER = "<!-- END DOCS INDEX -->";

// --- Index building ---

function buildIndex(docsDir: string): string {
	const files = readdirSync(docsDir)
		.filter((f) => f.endsWith(".md"))
		.sort();

	const parts: string[] = [
		"[Docs Index]",
		"root:./docs",
		"IMPORTANT: Retrieve the frontmatter for docs file that matches the topic of the task. Then decide if the content of the doc is relevant to the task. If it is, read the doc and use it to complete the task. If it is not, ignore the doc and do not read it.",
		`docs:{${files.join(",")}}`,
	];

	return parts.join("|");
}

// --- Injection into AGENTS.md ---

function injectIntoAgentsMd(agentsFilePath: string, indexContent: string): void {
	const content = readFileSync(agentsFilePath, "utf-8");

	if (!content.includes(BEGIN_MARKER) || !content.includes(END_MARKER)) {
		throw new Error(
			`Could not find ${BEGIN_MARKER} / ${END_MARKER} markers in ${agentsFilePath}`,
		);
	}

	const generatedBlock = `${BEGIN_MARKER}\n${indexContent}\n${END_MARKER}`;

	const beginIdx = content.indexOf(BEGIN_MARKER);
	const endIdx = content.indexOf(END_MARKER) + END_MARKER.length;

	const updated = content.slice(0, beginIdx) + generatedBlock + content.slice(endIdx);

	writeFileSync(agentsFilePath, updated, "utf-8");
}

// --- CLI ---

function main() {
	let agentsFile = "AGENTS.md";

	const args = process.argv.slice(2);
	for (let i = 0; i < args.length; i++) {
		if (args[i] === "--agents-file" && args[i + 1]) {
			agentsFile = args[++i];
		}
	}

	const projectRoot = resolve(dirname(new URL(import.meta.url).pathname), "..");
	const docsDir = join(projectRoot, "docs");
	const agentsFilePath = resolve(projectRoot, agentsFile);

	if (!existsSync(docsDir)) {
		console.error(`Error: docs/ directory not found at ${docsDir}`);
		process.exit(1);
	}

	if (!existsSync(agentsFilePath)) {
		console.error(`Error: ${agentsFile} not found at ${agentsFilePath}`);
		process.exit(1);
	}

	const indexContent = buildIndex(docsDir);
	injectIntoAgentsMd(agentsFilePath, indexContent);

	const files = readdirSync(docsDir).filter((f) => f.endsWith(".md"));
	console.log(`Updated docs index in ${agentsFile} (${files.length} docs)`);
}

main();
