/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import { NewsItem } from "../types";

/**
 * Parses markdown news lines from a single unified news.md file.
 * Supports:
 * - **2026-08-25**: Updated website interface.
 * - [2026-08-25]: Updated website interface.
 * - 2026-08-25: Updated website interface.
 */
function parseNewsMarkdownLines(raw: string): NewsItem[] {
  const list: NewsItem[] = [];
  const lines = raw.split("\n");

  let currentItem: Partial<NewsItem> | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith("#")) continue;

    // Pattern: - **2026-08-25**: Content OR - [2026-08-25] Content OR - 2026-08-25: Content
    const bulletMatch = line.match(/^[-*]\s*(?:\*\*(.*?)\*\*|\[(.*?)\]|(\d{4}[-/.]\d{2}[-/.]\d{2}))\s*[:|-]?\s*(.*)$/);
    if (bulletMatch) {
      if (currentItem && currentItem.id && currentItem.content) {
        list.push(currentItem as NewsItem);
      }

      const rawDate = bulletMatch[1] || bulletMatch[2] || bulletMatch[3];
      const content = bulletMatch[4]?.trim() || "";

      // Extract ISO date
      const isoMatch = rawDate.match(/(\d{4})[-/.](\d{2})[-/.](\d{2})/);
      const isoDate = isoMatch ? `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}` : rawDate;

      // Format display date (e.g. Aug 2026 or Aug 25, 2026)
      const d = new Date(isoDate);
      const displayDate = !isNaN(d.getTime())
        ? d.toLocaleString("en-US", { month: "short", year: "numeric" })
        : rawDate;

      currentItem = {
        id: `news-${isoDate}-${list.length + 1}`,
        date: displayDate,
        createdAt: isoDate,
        content: content,
      };
    } else if (currentItem) {
      // Append multi-line content
      currentItem.content = (currentItem.content ? `${currentItem.content} ` : "") + line;
    }
  }

  if (currentItem && currentItem.id && currentItem.content) {
    list.push(currentItem as NewsItem);
  }

  return list;
}

// Auto-discover single content/news.md or any files in /content/news/*.md
const unifiedNewsModules = import.meta.glob("/content/news.md", {
  eager: true,
  query: "?raw",
  import: "default",
});

const legacyNewsModules = import.meta.glob("/content/news/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
});

const items: NewsItem[] = [];

// 1. Process unified content/news.md
for (const [, raw] of Object.entries(unifiedNewsModules)) {
  const parsed = parseNewsMarkdownLines(raw as string);
  items.push(...parsed);
}

// 2. Process legacy separate files if any exist
for (const [, raw] of Object.entries(legacyNewsModules)) {
  const parsed = parseNewsMarkdownLines(raw as string);
  if (parsed.length > 0) {
    items.push(...parsed);
  }
}

// Sort by createdAt descending (newest first)
items.sort((a, b) => {
  const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
  const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
  return timeB - timeA;
});

// Export newsItems
export const newsItems: NewsItem[] = items;
