---
id: "applied-bioinformatics-wgs"
bookId: "applied-bioinformatics"
title: "1.1. Whole Genome Sequencing"
section: "Genomics"
order: 1
---

Whole Genome Sequencing (WGS) provides a comprehensive base-by-base view of an organism's entire genetic code.

### Standard Workflow
1. **Raw Read Quality Assessment:** FastQC, MultiQC.
2. **Read Trimming & Adapter Removal:** fastp, Trimmomatic.
3. **Reference Alignment:** BWA-MEM2, Bowtie2, Minimap2.
4. **Post-Alignment Processing:** SAMtools, Picard (MarkDuplicates), GATK BaseRecalibrator.
5. **Variant Calling:** GATK HaplotypeCaller, DeepVariant, FreeBayes.
6. **Annotation & Filtering:** VCFtools, SnpEff, Ensembl VEP, ANNOVAR.
