---
id: "adapter-trimming"
bookId: "whole-genome-sequencing"
parentId: "quality-control-adapter-trimming"
title: "2.2. Cắt lọc adapter bằng Trimmomatic"
order: "2.2"
code: |
  # Thực hiện cắt lọc base chất lượng thấp bằng Trimmomatic
  java -jar trimmomatic.jar PE mock_community_R1.fastq.gz mock_community_R2.fastq.gz \
    paired_R1_clean.fq unpaired_R1.fq paired_R2_clean.fq unpaired_R2.fq \
    ILLUMINACLIP:TruSeq3-PE.fa:2:30:10 LEADING:3 TRAILING:3 SLIDINGWINDOW:4:20 MINLEN:36
---

Dữ liệu trình tự thô thường chứa các đoạn nối adapter PCR và các base có chất lượng đọc kém ở cuối. Chúng ta cấu hình bộ lọc Trimmomatic nhằm loại bỏ các base có chỉ số chất lượng dưới Q20 ở các đầu đọc bằng phương pháp cửa sổ trượt (sliding window) kích thước 4 base, đồng thời lọc bỏ các đoạn đọc có độ dài quá ngắn (dưới 36 base).