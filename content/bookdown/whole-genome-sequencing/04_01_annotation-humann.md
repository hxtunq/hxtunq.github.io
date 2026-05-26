---
id: "annotation-humann"
bookId: "whole-genome-sequencing"
parentId: "functional-annotation-pipelines"
title: "4.1. Đường dẫn chú giải HUMAnN"
order: "4.1"
---

Chú giải chức năng của hệ gen (Functional Annotation) giúp xác định các con đường sinh học đang hoạt động trong cộng đồng. Bằng việc xây dựng các điều kiện cấu trúc rõ ràng, chúng ta thiết lập các phương pháp luận có khả năng tái lặp cao, đáp ứng các tiêu chuẩn phản biện khoa học khắt khe.

```bash
# Vận hành tự động hóa đường dẫn chú giải chức năng HUMAnN3
humann --input paired_R1_clean.fq \
  --output humann_output/ \
  --protein-database /databases/uniref \
  --nucleotide-database /databases/chocophlan
```