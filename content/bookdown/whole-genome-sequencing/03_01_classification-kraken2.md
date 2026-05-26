---
id: "classification-kraken2"
bookId: "whole-genome-sequencing"
parentId: "taxonomic-profiling-protocols"
title: "3.1. Phân loại taxon bằng Kraken2"
order: "3.1"
---

Xác định cấu trúc cộng đồng vi sinh vật giúp trả lời câu hỏi "những loài nào" đang hiện diện trong mẫu sinh học. Chúng ta vận hành Kraken2 dựa trên một cơ sở dữ liệu tiêu chuẩn được nén, đối chiếu trực tiếp các mảnh đọc k-mer với cây phân loại sinh học. Kết quả phân tích sẽ được ghi nhận chi tiết dưới dạng bảng báo cáo.

```bash
# Chạy phân loại taxon bằng cơ sở dữ liệu Kraken2 chuẩn hóa
kraken2 --db /databases/standard_kraken2 \
  --paired paired_R1_clean.fq paired_R2_clean.fq \
  --output sample_kraken.out \
  --report sample_report.txt
```