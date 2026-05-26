/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
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
}

export interface BookMetadata {
  id: string;
  title: string;
  description: string;
  iconName: "biotech" | "insights" | "terminal" | "scatter_plot" | "account_tree" | "bug_report";
  language?: string;
  typeLabel?: string;
}

export interface BookItem extends BookMetadata {
  chapters: BookChapter[];
}
