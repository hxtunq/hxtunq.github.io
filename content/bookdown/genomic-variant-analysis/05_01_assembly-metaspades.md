---
id: "assembly-metaspades"
bookId: "genomic-variant-analysis"
parentId: "assembly-genome-binning"
title: "5.1. Lắp ráp metagenome với metaSPAdes"
order: "5.1"
---

Lắp ráp (Assembly) và phân nhóm bộ gen từ metagenome (Genome Binning) là bước quan trọng để tái tạo hệ gen của các sinh vật chưa thể nuôi cấy. Chúng ta sử dụng metaSPAdes để nối các đoạn đọc ngắn thành các contig dài dựa trên đồ thị De Bruijn, sau đó phân nhóm bằng MetaBAT2 dựa trên hàm lượng GC và độ bao phủ.

```bash
# Lắp ráp metagenome bằng metaSPAdes
metaspades.py \
  -1 paired_R1_clean.fq \
  -2 paired_R2_clean.fq \
  -o metaspades_output/ \
  --threads 16 \
  --memory 64
```
