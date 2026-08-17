---
id: "halophile-qc-check"
parentId: "halophile-s2-qc"
bookId: "halophilic-microbiota-vietnam"
title: "2.1. Đánh giá chất lượng đoạn đọc"
order: 1
---

Pipeline này sử dụng hai công cụ kiểm tra chất lượng đoạn đọc phổ biến nhất hiện nay là FastQC và MultiQC để xem độ dài đoạn đọc, đánh giá chất lượng cuối đoạn đọc nhằm xác định sự hiện diện của adapter/primer.

## Cài đặt môi trường kiểm định chất lượng

Chúng ta khởi tạo môi trường Conda riêng cho công việc QC:

```bash
conda create -n qc -c conda-forge -c bioconda fastqc multiqc -y
conda activate qc
```

## Chạy FastQC & MultiQC

Chạy FastQC song song cho các tệp dữ liệu, sau đó sử dụng MultiQC để tổng hợp báo cáo:

```bash
fastqc raw/fastq/*.fastq.gz -o results/qc -t 8
multiqc results/qc -o results/qc
```

## Đánh giá kết quả QC
Nghiên cứu dùng amplicon 16S V3–V4 sequenced bằng Illumina MiSeq; sau sequencing, barcode/primer đã được strip, các đoạn đọc có độ dài <150 bp, các đoạn đọc có base không chắc chắn và các đoạn có vùng lặp nucleotide liên tiếp (homopolymer) >6 bp bị loại.

Dựa trên kết quả trực quan từ MultiQC, ta sẽ tiến hành đưa ra các thông số lọc và cắt (`truncLen`, `maxEE`) phù hợp cho pipeline DADA2 ở chương tiếp theo.


```console
R1:       |--------------> 
Amplicon: |------------------------------------------------| 464 bp
R2:                                      <--------------|
                     gap ở giữa, không có overlap
```
