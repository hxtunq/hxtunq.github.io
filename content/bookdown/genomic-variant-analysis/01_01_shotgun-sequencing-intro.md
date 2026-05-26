---
id: "shotgun-sequencing-intro"
bookId: "genomic-variant-analysis"
parentId: "introduction-shotgun-sequencing"
title: "1.1. Giới thiệu Metagenomics"
order: "1.1"
---

Giải trình tự Metagenomics Shotgun mở ra một góc nhìn toàn diện và không định hướng vào toàn bộ nội dung gen của một cộng đồng vi sinh vật. Khác với phương pháp định danh khuếch đại 16S rRNA truyền thống, dữ liệu shotgun thu nhận ngẫu nhiên các đoạn trình tự đại diện cho cả vi khuẩn, virus, nấm và sinh vật nhân thực. Do đó, người phân tích cần xử lý khối lượng dữ liệu cực kỳ lớn, đòi hỏi các đường dẫn xử lý tối ưu hóa định dạng FASTQ/BAM.

Để bắt đầu, ta tải các tệp FASTQ mẫu kiểm thử từ kho dữ liệu cộng đồng:

```bash
# Tải tệp tin FASTQ kiểm thử thô từ Microbiome Hub
wget https://data.microbiome-hub.org/samples/mock_community_R1.fastq.gz
wget https://data.microbiome-hub.org/samples/mock_community_R2.fastq.gz
```
