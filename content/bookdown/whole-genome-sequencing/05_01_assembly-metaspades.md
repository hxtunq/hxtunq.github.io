---
id: "assembly-metaspades"
bookId: "whole-genome-sequencing"
parentId: "assembly-genome-binning"
title: "5.1. Lắp ráp metagenome với metaSPAdes"
order: "5.1"
code: |
  # Vận hành tự động hóa đường dẫn lắp ráp và phân nhóm (binning)
  python -m whole_genome_sequencing_pipeline \
    --chapter_idx 4 \
    --mode production \
    --export_pdf
---

Lắp ráp (Assembly) và phân nhóm bộ gen từ metagenome (Genome Binning) là bước quan trọng để tái tạo hệ gen của các sinh vật chưa thể nuôi cấy. Chúng ta sử dụng metaSPAdes để nối các đoạn đọc ngắn thành các contig dài dựa trên đồ thị De Bruijn, sau đó phân nhóm bằng MetaBAT2 dựa trên hàm lượng GC và độ bao phủ.