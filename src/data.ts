/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import { SelectedPublication, ResearchFocusItem, BookMetadata } from "./types";

export const focusItems: ResearchFocusItem[] = [
  {
    id: "focus-1",
    title: "Microbiology",
    description: "",
    iconName: "microscope"
  },
  {
    id: "focus-2",
    title: "Multi-Omics Science",
    description: "",
    iconName: "dna"
  },
  {
    id: "focus-3",
    title: "Astrobiology",
    description: "",
    iconName: "orbit"
  },
  {
    id: "focus-4",
    title: "Biological Circuit Design",
    description: "",
    iconName: "circuit-board"
  }
];

export const selectedPublications: SelectedPublication[] = [];

export const bookMetadataList: BookMetadata[] = [
  // --- PROJECTS ---
  {
    id: "genomic-variant-analysis",
    title: "Genomic Variant Analysis",
    description: "Hands-on guide for WGS/WES sequencing data analysis, focusing on short germline variant discovery and annotation in humans.",
    iconName: "biotech",
    category: "projects",
    language: "Vietnamese",
    typeLabel: "Case Study & Hands-on Guide",
    tags: ["genomics"],
    published: false,
  },
  {
    id: "halophilic-microbiota-vietnam",
    title: "Halophilic Microbiota of Vietnam",
    description: "A case study on multi-sample metagenomics data analysis from extreme solar saltworks in Vietnam.",
    iconName: "scatter_plot",
    category: "projects",
    language: "Vietnamese",
    typeLabel: "Case Study & Hands-on Guide",
    tags: ["metagenomics", "r", "bioinformatics"],
    published: false,
  },

  // --- TECHNICAL NOTES ---
  {
    id: "bash-fundamentals-bioinformatics",
    title: "Bash for Bioinformatics",
    description: "Essential Bash and Shell scripting guide for bioinformatics workflows and large-scale data processing.",
    iconName: "terminal",
    category: "technical-notes",
    language: "Vietnamese",
    typeLabel: "Technical Notes",
    tags: ["code"],
    published: false,
  },

  // --- RESOURCES ---
  {
    id: "research-skills",
    title: "Research Skills",
    description: "Essential methodologies, academic reading strategies, computational toolkits, and best practices for scientific inquiry.",
    iconName: "insights",
    category: "resources",
    language: "English",
    typeLabel: "Resource & Guide",
    tags: ["methodology", "research"],
    published: false,
  },
  {
    id: "applied-bioinformatics",
    title: "Applied Bioinformatics",
    description: "Practical workflows, data analysis protocols, and applied computational methods across genomics, transcriptomics, and microbial sciences.",
    iconName: "biotech",
    category: "resources",
    language: "English",
    typeLabel: "Resource & Protocols",
    tags: ["bioinformatics", "workflows"],
    published: false,
  },
  {
    id: "data-science",
    title: "Khoa học Dữ liệu Sinh học",
    description: "Tổng hợp tài liệu tham khảo về Bash, R, Python và thống kê ứng dụng trong Sinh học.",
    iconName: "terminal",
    category: "resources",
    language: "Vietnamese",
    typeLabel: "Resource & Guide",
    tags: ["data-science", "bash", "r", "python", "statistics"],
    published: true,
  }
];
