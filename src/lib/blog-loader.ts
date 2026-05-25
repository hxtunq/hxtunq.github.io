/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BlogPost } from "../types";

/**
 * Parses YAML frontmatter from a raw markdown string.
 * Returns the parsed key-value pairs and the remaining markdown body.
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

  let currentKey = "";
  let currentValue = "";
  let inMultiLine = false;

  const lines = yamlBlock.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Handle multi-line block scalar (|)
    if (inMultiLine) {
      // If this line starts a new key at root level, stop multi-line
      if (/^[a-zA-Z_][\w]*\s*:/.test(line)) {
        meta[currentKey] = currentValue.trim();
        inMultiLine = false;
        // Fall through to process this line as a new key
      } else {
        currentValue += (currentValue ? "\n" : "") + line.replace(/^  /, "");
        continue;
      }
    }

    // Strip inline comments starting with whitespace and # (e.g. "  # comment")
    const cleanLine = line.replace(/\s+#.*$/, "");

    const match = cleanLine.match(/^([a-zA-Z_][\w]*)\s*:\s*(.*)/);
    if (!match) continue;

    const key = match[1];
    let value = match[2].trim();

    // Multi-line block scalar indicator
    if (value === "|") {
      currentKey = key;
      currentValue = "";
      inMultiLine = true;
      continue;
    }

    // Parse JSON-style arrays: ["a", "b", "c"]
    if (value.startsWith("[") && value.endsWith("]")) {
      try {
        meta[key] = JSON.parse(value);
      } catch {
        // Fallback: parse as comma-separated
        meta[key] = value
          .slice(1, -1)
          .split(",")
          .map((s) => s.trim().replace(/^["']|["']$/g, ""));
      }
      continue;
    }

    // Strip surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    meta[key] = value;
  }

  // Flush remaining multi-line value
  if (inMultiLine && currentKey) {
    meta[currentKey] = currentValue.trim();
  }

  return { meta, body };
}

/**
 * Reconstructs the YAML header display string from frontmatter metadata.
 */
function buildYamlHeader(meta: Record<string, unknown>): string {
  const displayKeys = ["title", "date", "author", "tags", "status", "language"];
  const lines = ["---"];

  for (const key of displayKeys) {
    if (meta[key] === undefined) continue;
    const val = meta[key];
    if (Array.isArray(val)) {
      lines.push(`${key}: [${val.join(", ")}]`);
    } else {
      lines.push(`${key}: "${val}"`);
    }
  }

  lines.push("---");
  return lines.join("\n");
}

/**
 * Auto-discover all markdown files in /content/blog/ at build time
 * and convert them to BlogPost objects.
 *
 * To add a new blog post, simply create a new .md file in content/blog/
 * with proper YAML frontmatter. No TypeScript changes needed.
 */
const markdownModules = import.meta.glob("/content/blog/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
});

const posts: BlogPost[] = [];

for (const [, raw] of Object.entries(markdownModules)) {
  const { meta, body } = parseFrontmatter(raw as string);

  const post: BlogPost = {
    id: (meta.id as string) || `post-${Date.now()}`,
    category: (meta.category as BlogPost["category"]) || "METHODOLOGY",
    date: (meta.dateDisplay as string) || (meta.date as string) || "",
    title: (meta.title as string) || "Untitled",
    abstract: (meta.abstract as string) || "",
    tags: Array.isArray(meta.tags)
      ? (meta.tags as string[])
      : typeof meta.tags === "string"
      ? (meta.tags as string).split(",").map((t) => t.trim()).filter(Boolean)
      : [],
    yamlHeader: buildYamlHeader(meta),
    contentMarkdown: body,
    // Optional featured-post fields
    imageUrl: (meta.imageUrl as string) || undefined,
    caption: (meta.caption as string) || undefined,
    quote: (meta.quote as string) || undefined,
    quoteAuthor: (meta.quoteAuthor as string) || undefined,
    detailedCodeBlock: (meta.detailedCodeBlock as string) || undefined,
    language: (meta.language as string) || (meta.lang as string) || "English",
    author: (meta.author as string) || undefined,
  };

  posts.push(post);
}

// Sort by date descending (newest first)
posts.sort((a, b) => {
  const dateA = new Date(extractISODate(a) || 0).getTime();
  const dateB = new Date(extractISODate(b) || 0).getTime();
  return dateB - dateA;
});

function extractISODate(post: BlogPost): string {
  // Try to extract ISO date from yamlHeader
  const match = post.yamlHeader?.match(/date:\s*"([^"]+)"/);
  return match?.[1] || "";
}

export const blogPosts: BlogPost[] = posts;
