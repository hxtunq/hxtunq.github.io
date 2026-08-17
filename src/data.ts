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

export const bookMetadataList: BookMetadata[] = [
  {
    id: "genomic-variant-analysis",
    title: "Genomic Variant Analysis",
    description: "Hands-on guide for WGS/WES sequencing data analysis, focusing on short germline variant discovery and annotation in humans.",
    iconName: "biotech",
    language: "Vietnamese",
    typeLabel: "Case Study & Hands-on Guide",
    tags: ["genomics"],
    published: false,
  },
  {
    id: "bash-fundamentals-bioinformatics",
    title: "Bash for Bioinformatics",
    description: "Essential Bash and Shell scripting guide for bioinformatics workflows and large-scale data processing.",
    iconName: "terminal",
    language: "Vietnamese",
    typeLabel: "Introductory Book",
    tags: ["code"],
    published: false,
  },
  {
    id: "halophilic-microbiota-vietnam",
    title: "Halophilic Microbiota of Vietnam",
    description: "A case study on multi-sample metagenomics data analysis from extreme solar saltworks in Vietnam.",
    iconName: "scatter_plot",
    language: "Vietnamese",
    typeLabel: "Case Study & Hands-on Guide",
    tags: ["metagenomics", "r", "bioinformatics"],
    published: false,
  }
];
