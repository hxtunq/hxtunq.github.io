/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SelectedPublication, ResearchFocusItem, BookItem } from "./types";

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

export const bookItems: BookItem[] = [
  {
    id: "book-1",
    title: "Metagenomics Guide",
    description: "A comprehensive guide to computational pipelines for processing raw sequence data and deciphering complex microbial communities using modern R and Python toolchains.",
    iconName: "biotech",
    chapters: [
      "1. Introduction to Shotgun Sequencing",
      "2. Quality Control & Adapter Trimming",
      "3. Taxonomic Profiling Protocols",
      "4. Functional Annotation Pipelines",
      "5. Assembly & Genome Binning"
    ]
  },
  {
    id: "book-2",
    title: "Statistical Inference in R",
    description: "Foundational concepts and practical applications of statistical inference, focusing on experimental design and robust data analysis for biological sciences.",
    iconName: "insights",
    chapters: [
      "1. Probability Theory Foundations",
      "2. Hypothesis Testing Paradigms",
      "3. Linear & Logistic Regression",
      "4. Multiple Testing Corrections",
      "5. Bayesian Inference in R"
    ]
  },
  {
    id: "book-3",
    title: "Python for Bioinformatics",
    description: "An introduction to Python programming tailored specifically for life scientists, covering data parsing, automation, and algorithmic problem solving.",
    iconName: "terminal",
    chapters: [
      "1. Python Syntax & Core Structures",
      "2. Handling Sequence Data with BioPython",
      "3. Parsing GenBank & FASTA Formats",
      "4. Exploratory Data Analysis with Pandas",
      "5. Building Automation Tools"
    ]
  },
  {
    id: "book-4",
    title: "Single-Cell RNA-Seq",
    description: "Workflows and best practices for analyzing single-cell transcriptomics data, from initial quality control and normalization to clustering and trajectory inference.",
    iconName: "scatter_plot",
    chapters: [
      "1. Introduction to Single-Cell Chemistry",
      "2. Alignment & Count Matrix Construction",
      "3. Dimensionality Reduction (PCA, UMAP)",
      "4. Cell Type Identification Markers",
      "5. Trajectory & Pseudotime Inference"
    ]
  },
  {
    id: "book-5",
    title: "Phylogenetics",
    description: "Theory and applied practice of evolutionary tree construction, multiple sequence alignment techniques, and molecular clock dating methodologies.",
    iconName: "account_tree",
    chapters: [
      "1. Evolutionary Trees & Lineages",
      "2. Multiple Alignment (Clustal, Muscle)",
      "3. Distance Matrix & Neighbor-Joining",
      "4. Maximum Likelihood Estimations",
      "5. Bayesian Molecular Dating"
    ]
  },
  {
    id: "book-6",
    title: "Microbiome Data Science",
    description: "Advanced analytical approaches for amplicon sequencing data, focusing on alpha/beta diversity metrics, multivariate statistics, and differential abundance testing.",
    iconName: "bug_report",
    chapters: [
      "1. 16S Amplicon Sequence Variants (ASVs)",
      "2. Alpha & Beta Diversity Indices",
      "3. Ordination Layouts (PCoA, NMDS)",
      "4. Differential Abundance Testing (ANCOM-BC)",
      "5. Predictive Metagenomics with PICRUSt2"
    ]
  }
];
