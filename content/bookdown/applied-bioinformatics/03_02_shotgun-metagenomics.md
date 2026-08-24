---
id: "applied-bioinformatics-shotgun"
bookId: "applied-bioinformatics"
title: "3.2. Shotgun Metagenomics"
order: 6
---

Shotgun metagenomic sequencing samples all genomic DNA in a sample without target locus amplification, allowing concurrent taxonomic profiling, functional pathway estimation, and de novo Metagenome-Assembled Genome (MAG) recovery.

### Analysis Branches
1. **Read-based Profiling:**
   - Taxonomy: Kraken2 + Bracken, MetaPhlAn4.
   - Functional pathways: HUMAnN3, eggNOG-mapper.
2. **Assembly-based Profiling:**
   - Assembly: MEGAHIT, metaSPAdes.
   - Contig binning: MetaBAT2, MaxBin2, SemiBin.
   - Bin refinement & QA: DAS Tool, CheckM2.
   - Taxonomic classification: GTDB-Tk.
