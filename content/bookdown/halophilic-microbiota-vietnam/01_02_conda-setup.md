---
id: "halophile-conda-setup"
parentId: "halophile-s1-prep"
bookId: "halophilic-microbiota-vietnam"
title: "1.2. Khởi tạo môi trường Conda"
order: 2
---

Để thực hiện bước tải và chuyển đổi dữ liệu từ NCBI, chúng ta sẽ khởi tạo một môi trường Conda độc lập chứa các công cụ cần thiết như `sra-tools` và `entrez-direct`.

```bash
conda create -n sra_dl -c conda-forge -c bioconda sra-tools entrez-direct pigz -y
conda activate sra_dl
```

**Chi tiết các công cụ được cài đặt:**
- `sra-tools`: Bộ công cụ chính thức của NCBI để tương tác và tải dữ liệu SRA.
- `entrez-direct` (EDirect): Cho phép truy vấn cơ sở dữ liệu NCBI trực tiếp từ command line.
- `pigz`: Công cụ hỗ trợ nén song song (parallel gzip) giúp tăng tốc độ nén dữ liệu FASTQ lên nhiều lần.
