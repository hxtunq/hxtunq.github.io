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

// Temporarily empty — project write-ups are still being finished.
// Restore entries here (see git history) once ready to publish.
export const bookMetadataList: BookMetadata[] = [];
