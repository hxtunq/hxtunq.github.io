---
id: "applied-bioinformatics-single-cell-rnaseq"
bookId: "applied-bioinformatics"
title: "2.2. Single-cell RNA-seq"
order: 4
---

Single-cell RNA sequencing (scRNA-seq) measures gene expression in individual cells, unveiling cellular heterogeneity, rare subpopulations, and developmental trajectories.

### Core Stages
1. **Preprocessing & Alignment:** Cell Ranger, STARsolo, Alevin (demultiplexing, UMI counting).
2. **Quality Control & Filtering:** Mitochondrial read percentage, number of detected genes (nFeature_RNA), total counts (nCount_RNA).
3. **Normalization & Dimensionality Reduction:** SCTransform, LogNormalize, PCA, UMAP, t-SNE.
4. **Clustering & Marker Identification:** Seurat, Scanpy, SingleR for automated cell annotation.
5. **Trajectory & Pseudotime Analysis:** Monocle3, Slingshot, CellRank.
