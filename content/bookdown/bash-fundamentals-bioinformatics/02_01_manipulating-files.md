---
id: "manipulating-files"
bookId: "bash-fundamentals-bioinformatics"
parentId: "file-management"
title: "2.1. Quản lý thư mục và tệp tin"
order: "2.1"
code: |
  # Tạo thư mục mới để chứa dữ liệu thô
  mkdir -p raw_data
  
  # Tạo và xem nội dung tệp tin FASTA giả lập
  echo -e ">seq1\nATGCGTACGT" > raw_data/sample.fasta
  cat raw_data/sample.fasta
---

Nhà phân tích tin sinh học thường phải xử lý các tệp tin dữ liệu dung lượng lớn như FASTQ, FASTA, và SAM/BAM. Hãy tìm hiểu cách tạo thư mục (`mkdir`), sao chép (`cp`), di chuyển (`mv`), và xem tệp tin an toàn bằng các công cụ luồng tiêu chuẩn mà không làm quá tải bộ nhớ RAM.