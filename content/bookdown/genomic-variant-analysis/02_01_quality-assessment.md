---
id: "quality-assessment"
bookId: "genomic-variant-analysis"
parentId: "quality-control-adapter-trimming"
title: "2.1. Đánh giá chất lượng bằng FastQC"
order: "2.1"
---

Trước khi tiến hành phân tích sâu, ta cần chạy FastQC để kiểm tra chất lượng các đầu đọc thô. FastQC cung cấp báo cáo chi tiết về chất lượng base theo từng vị trí (Per base sequence quality), tỷ lệ hàm lượng GC, mức độ nhân bản đoạn trình tự, và sự xuất hiện của các đoạn adapter chưa được cắt lọc.

```bash
# Chạy công cụ kiểm tra chất lượng FastQC
fastqc mock_community_R1.fastq.gz
```
