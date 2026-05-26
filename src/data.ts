/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
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

export const selectedPublications: SelectedPublication[] = [
  {
    id: "pub-1",
    journal: "Nature Physics",
    year: 2024,
    title: "Emergent topological properties in constrained random networks",
    abstract: "A framework for understanding how localized constraints enforce global topological invariants in complex systems.",
    doi: "10.1038/s41567-024",
    pdfUrl: "#",
    githubUrl: "#"
  },
];

export const bookMetadataList: BookMetadata[] = [
  {
    id: "genomic-variant-analysis",
    title: "Genomic Variant Analysis",
    description: "Hướng dẫn thực hành phân tích dữ liệu giải trình tự thế hệ mới (NGS), tập trung vào quy trình WGS/WXS phát hiện và phân tích biến thể di truyền ở người.",
    iconName: "biotech",
    language: "Vietnamese",
    typeLabel: "Case Study & Hands-on Guide",
  },
  {
    id: "bash-fundamentals-bioinformatics",
    title: "Bash cho Tin Sinh học",
    description: "Hướng dẫn sử dụng và áp dụng các câu lệnh Bash/Shell script nền tảng trong phân tích tin sinh học.",
    iconName: "terminal",
    language: "Vietnamese",
    typeLabel: "Introductory Book",
  }
];
