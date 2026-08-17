/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import { NewsItem } from "../types";

/**
 * Parses YAML frontmatter from a raw markdown string.
 */
function parseFrontmatter(raw: string): { meta: Record<string, unknown>; body: string } {
  const trimmed = raw.trim();
  if (!trimmed.startsWith("---")) {
    return { meta: {}, body: trimmed };
  }

  const endIndex = trimmed.indexOf("---", 3);
  if (endIndex === -1) {
    return { meta: {}, body: trimmed };
  }

  const yamlBlock = trimmed.slice(3, endIndex).trim();
  const body = trimmed.slice(endIndex + 3).trim();
  const meta: Record<string, unknown> = {};

  const lines = yamlBlock.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/^([a-zA-Z_][\w]*)\s*:\s*(.*)/);
    if (!match) continue;

    const key = match[1];
    let value = match[2].trim();

    // Strip surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    meta[key] = value;
  }

  return { meta, body };
}

// Auto-discover all markdown files in /content/news/ at build/compile time
const markdownModules = import.meta.glob("/content/news/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
});

const items: (NewsItem & { createdAt: string })[] = [];

for (const [path, raw] of Object.entries(markdownModules)) {
  const { meta, body } = parseFrontmatter(raw as string);

  // Extract ID from filename
  const filename = path.split("/").pop() || "";
  const id = filename.replace(/\.md$/, "");

  items.push({
    id: id,
    date: (meta.date as string) || "Recent",
    content: body,
    createdAt: (meta.createdAt as string) || new Date().toISOString(),
  });
}

// Sort by createdAt descending (newest first)
items.sort((a, b) => {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
});

// Set to display maximum of 5 of the newest items
export const newsItems: NewsItem[] = items.slice(0, 5);
