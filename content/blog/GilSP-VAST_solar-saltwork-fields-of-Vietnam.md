---
id: "solar-saltwork-fields"
title: "Tái tạo nghiên cứu: Phân tích hệ vi sinh vật học từ cánh đồng muối Việt Nam (I)"
category: "SCRIPT ANALYSIS"
date: "2026-05-25"
dateDisplay: "MAY 25, 2026" 
author: "Xuan Tung Hoang"
tags: ["Metagenomics", "Extremophiles", "Phylogeny", "R"]
abstract:
status: "Published" 
language: "Vietnamese"
---

## Giới thiệu

Ở bài viết này, mình sẽ tiến hành diễn giải các đoạn mã R mà nhóm tác giả của bài báo "Unique Features of Extremely Halophilic Microbiota Inhabiting Solar Saltworks Fields of Vietnam" đến từ VAST và ISP-CNR đã sử dụng để phân tích hệ vi sinh vật học từ cánh đồng muối tại Việt Nam vào năm 2024.

```R
library(dada2)
library(microbiome) # data analysis and visualisation
library(phyloseq) # also the basis of data object. Data analysis and visualisation
library(RColorBrewer) # nice color options
library(dplyr) # data handling
library(network) # networks
library(intergraph) # networks
library(ggnet)  # network plotting with ggplot
library(igraph) # networks
library(phyloseq) # ASV ecological analysis package
library(ggplot2) # plotting library
library(gridExtra) # gridding plots
library(ape) # importing and handling phylogenetic trees
library(ggthemes) # additional themes fro ggplot2
library(magrittr)
library(rioja) # plotting poackages for tabular bubbleplots
library(ggpubr)
library(ggtern)
library(plyr)
library(coda.base)
library(vegan)
library(propr)
library(msa)
library(phangorn)

path <- "//your path/" # directory containing the fastq files after unzipping.
list.files(path)
```

## Code

Forward and reverse fastq filenames have format: SAMPLENAME_R1_001.fastq and SAMPLENAME_R2_001.fastq

```R
fnFs <- sort(list.files(path, pattern="_R1_trimmed.fastq", full.names = TRUE))
fnRs <- sort(list.files(path, pattern="_R2_trimmed.fastq", full.names = TRUE))
```