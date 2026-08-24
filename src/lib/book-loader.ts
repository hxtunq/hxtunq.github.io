/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import { BookMetadata, BookChapter, BookItem } from "../types";
import { bookMetadataList } from "../data";

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

  let currentKey = "";
  let currentValue = "";
  let inMultiLine = false;

  const lines = yamlBlock.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Handle multi-line block scalar (|)
    if (inMultiLine) {
      if (/^[a-zA-Z_][\w]*\s*:/.test(line)) {
        meta[currentKey] = currentValue.trim();
        inMultiLine = false;
      } else {
        currentValue += (currentValue ? "\n" : "") + line.replace(/^  /, "");
        continue;
      }
    }

    // Skip whole-line comments
    if (/^\s*#/.test(line)) continue;

    const match = line.match(/^([a-zA-Z_][\w]*)\s*:\s*(.*)/);
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

    // Parse JSON arrays
    if (value.startsWith("[") && value.includes("]")) {
      const endBracket = value.lastIndexOf("]");
      const arrayPart = value.slice(0, endBracket + 1);
      try {
        meta[key] = JSON.parse(arrayPart);
      } catch {
        meta[key] = arrayPart
          .slice(1, -1)
          .split(",")
          .map((s) => s.trim().replace(/^["']|["']$/g, ""));
      }
      continue;
    }

    // Quoted strings: preserve all characters inside quotes (including #)
    if (value.startsWith('"')) {
      const closingQuote = value.lastIndexOf('"');
      if (closingQuote > 0) {
        meta[key] = value.slice(1, closingQuote);
        continue;
      }
    } else if (value.startsWith("'")) {
      const closingQuote = value.lastIndexOf("'");
      if (closingQuote > 0) {
        meta[key] = value.slice(1, closingQuote);
        continue;
      }
    }

    // Unquoted values: strip inline comments
    value = value.replace(/\s+#.*$/, "").trim();
    meta[key] = value;
  }

  if (inMultiLine && currentKey) {
    meta[currentKey] = currentValue.trim();
  }

  return { meta, body };
}

// Discover all markdown files in /content/bookdown/
const markdownModules = import.meta.glob("/content/bookdown/**/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
});

const chapters: BookChapter[] = [];

for (const [, raw] of Object.entries(markdownModules)) {
  const { meta, body } = parseFrontmatter(raw as string);

  // Skip draft, hidden, unpublished, or empty chapters
  if (
    meta.published === false ||
    meta.published === "false" ||
    meta.draft === true ||
    meta.draft === "true" ||
    meta.hidden === true ||
    meta.hidden === "true" ||
    (meta.status !== undefined && meta.status !== "Published") ||
    !body.trim()
  ) {
    continue;
  }

  const chapter: BookChapter = {
    id: (meta.id as string) || `chapter-${Date.now()}`,
    bookId: (meta.bookId as string) || "",
    parentId: (meta.parentId as string) || undefined,
    title: (meta.title as string) || "Untitled",
    order: Number(meta.order) || 0,
    contents: body,
    code: (meta.code as string) || undefined,
    output: (meta.output as string) || undefined,
    section: (meta.section as string) || undefined,
    published: meta.published !== false,
  };

  chapters.push(chapter);
}

// Only export books that are published and have at least 1 valid chapter
export const bookItems: BookItem[] = bookMetadataList
  .filter((metadata) => metadata.published !== false)
  .map((metadata) => {
    const bookFlat = chapters.filter((c) => c.bookId === metadata.id);

    // Find roots (no parentId)
    const rootChapters: BookChapter[] = bookFlat
      .filter((c) => !c.parentId)
      .map((c) => ({
        ...c,
        subsections: []
      }));

    // Associate children (subsections)
    bookFlat.forEach((c) => {
      if (c.parentId) {
        const parent = rootChapters.find((r) => r.id === c.parentId);
        if (parent) {
          parent.subsections!.push({
            ...c,
            subsections: []
          });
        }
      }
    });

    // Sort roots and their subsections by order
    rootChapters.sort((a, b) => a.order - b.order);
    rootChapters.forEach((r) => {
      r.subsections!.sort((a, b) => a.order - b.order);
    });

    return {
      ...metadata,
      chapters: rootChapters,
    };
  })
  .filter((book) => book.chapters.length > 0);


