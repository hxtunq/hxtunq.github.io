---
id: "applied-bioinformatics-16s"
bookId: "applied-bioinformatics"
title: "3.1. 16S Metagenomics"
section: "Metagenomics"
order: 5
---

Targeted 16S rRNA gene amplicon sequencing targets specific hypervariable regions (e.g. V3-V4) of bacterial and archaeal ribosomal genes to profile microbial community structure.

### Typical Workflow
1. **Quality Filtering & Denoising:** DADA2 (producing ASVs), Deblur, or QIIME 2.
2. **Taxonomic Assignment:** SILVA, Greengenes, or GTDB classifiers.
3. **Phylogenetic Tree Construction:** FastTree, MAFFT.
4. **Ecological Metrics:** 
   - Alpha diversity: Shannon, Simpson, Chao1, Faith's PD.
   - Beta diversity: Bray-Curtis, Unweighted & Weighted UniFrac (PCoA/NMDS).
5. **Statistical Testing:** PERMANOVA (Adonis), ANCOM-BC, MaAsLin2.
