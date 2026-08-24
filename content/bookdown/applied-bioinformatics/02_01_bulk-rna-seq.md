---
id: "applied-bioinformatics-bulk-rnaseq"
bookId: "applied-bioinformatics"
title: "2.1. Bulk RNA-seq"
section: "Transcriptomics"
order: 3
---

Bulk RNA Sequencing enables quantitative measurement of average RNA abundance across cell populations in response to experimental conditions or disease states.

### Standard Pipeline
1. **Quality Control:** FastQC, FastQ Screen.
2. **Alignment / Pseudoalignment:** 
   - Splice-aware alignment: STAR, HISAT2.
   - Transcript-level quantification: Salmon, Kallisto.
3. **Count Matrix Generation:** featureCounts, tximport.
4. **Differential Expression Analysis:** DESeq2, edgeR, limma-voom.
5. **Functional Enrichment:** ClusterProfiler, GSEA, GO, KEGG pathways.
