/**
 * @license
 * SPDX-License-Identifier: MIT
 */

export interface SelectedPublication {
  id: string;
  journal: string;
  year: number;
  title: string;
  abstract: string;
  doi: string;
  pdfUrl?: string;
  githubUrl?: string;
}

export interface ResearchFocusItem {
  id: string;
  title: string;
  description: string;
  iconName: "network" | "flask" | "grid" | "microscope" | "dna" | "orbit" | "circuit-board";
}

export interface BlogPost {
  id: string;
  category: string;
  date: string;
  title: string;
  abstract: string;
  tags: string[];
  yamlHeader?: string;
  contentMarkdown?: string;
  imageUrl?: string;
  caption?: string;
  detailedCodeBlock?: string;
  quote?: string;
  quoteAuthor?: string;
  language?: string;
  author?: string;
}

export interface BookChapter {
  id: string;
  bookId: string;
  parentId?: string;
  title: string;
  order: number;
  contents: string;
  code?: string;
  output?: string;
  subsections?: BookChapter[];
  section?: string;
  published?: boolean;
}

export interface BookMetadata {
  id: string;
  title: string;
  description: string;
  iconName: "biotech" | "insights" | "terminal" | "scatter_plot" | "account_tree" | "bug_report";
  category?: "projects" | "resources" | "technical-notes" | string;
  language?: string;
  typeLabel?: string;
  tags?: string[];
  published?: boolean;
}

export interface BookItem extends BookMetadata {
  chapters: BookChapter[];
}

export interface NewsItem {
  id: string;
  date: string;
  content: string;
  createdAt?: string;
}

export interface NotesPost {
  id: string;
  authorName: string;
  createdAt: string; // ISO format: e.g. "2026-07-29T10:00:00Z"
  content: string;
  tags?: string[];
  imageUrl?: string;
  paperPreview?: string; // URL to an academic paper (for paper counting & preview)
  linkPreview?: {
    url: string;
    title: string;
    description: string;
    siteName?: string;
    imageUrl?: string;
  };
  likes?: number;
  commentsCount?: number;
  repostsCount?: number;
}
