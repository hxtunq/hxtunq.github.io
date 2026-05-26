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
    id: "whole-genome-sequencing",
    title: "Whole Genome Sequencing",
    description: "Hướng dẫn toàn diện về quy trình phân tích tin sinh học để xử lý dữ liệu giải trình tự thô và giải mã cấu trúc hệ vi sinh vật phức tạp bằng các công cụ R và Python hiện đại.",
    iconName: "biotech",
    language: "Vietnamese",
  },
  {
    id: "bash-fundamentals-bioinformatics",
    title: "Bash cho Tin Sinh học",
    description: "Các công cụ dòng lệnh thiết yếu, kỹ thuật lập trình shell script và chiến lược quản lý gói dành riêng cho xử lý dữ liệu sinh học và đường dẫn phân tích tin sinh học.",
    iconName: "terminal",
    language: "Vietnamese",
  }
];
