/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import { NotesPost } from "../types";

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

  return { meta, body };
}

// Auto-discover all markdown files in /content/notes/ at build/compile time
const markdownModules = import.meta.glob("/content/notes/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
});

const posts: NotesPost[] = [];

for (const [path, raw] of Object.entries(markdownModules)) {
  const { meta, body } = parseFrontmatter(raw as string);

  // Extract ID from filename
  const filename = path.split("/").pop() || "";
  const id = filename.replace(/\.md$/, "");

  const rawTags = meta.tags || meta.topics;
  const tags: string[] = Array.isArray(rawTags)
    ? (rawTags as string[]).map((t) => String(t).trim()).filter(Boolean)
    : typeof rawTags === "string"
    ? rawTags.split(",").map((t) => t.trim().replace(/^["']|["']$/g, "")).filter(Boolean)
    : [];

  const hasLinkPreview = !!(meta.linkPreviewUrl || meta.linkPreviewTitle || meta.linkPreviewDescription || meta.linkPreviewImageUrl);

  const post: NotesPost = {
    id: id,
    authorName: (meta.authorName as string) || "Xuan Tung Hoang",
    createdAt: (meta.createdAt as string) || new Date().toISOString(),
    content: body,
    tags: tags.length > 0 ? tags : undefined,
    imageUrl: (meta.imageUrl as string) || undefined,
    paperPreview: (meta.paperPreview as string) || undefined,
    urlPreview: (meta.urlPreview as string) || (meta.previewUrl as string) || undefined,
    linkPreview: hasLinkPreview
      ? {
          url: (meta.linkPreviewUrl as string) || (meta.urlPreview as string) || "",
          title: (meta.linkPreviewTitle as string) || "",
          description: (meta.linkPreviewDescription as string) || "",
          siteName: (meta.linkPreviewSiteName as string) || undefined,
          imageUrl: (meta.linkPreviewImageUrl as string) || undefined,
        }
      : undefined,
  };

  posts.push(post);
}

// Sort by date descending (newest first)
posts.sort((a, b) => {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
});

export const notesPosts: NotesPost[] = posts;
