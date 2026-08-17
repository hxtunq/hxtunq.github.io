---
id: "halophile-directory-structure"
parentId: "halophile-s1-prep"
bookId: "halophilic-microbiota-vietnam"
title: "1.1. Thiết lập cấu trúc thư mục"
order: 1
---

Hãy mở terminal của bạn lên và khởi tạo cấu trúc thư mục dự án gọn gàng bằng lệnh dưới đây:

```bash
mkdir -p halophile_vietnam/{raw/sra,raw/fastq,metadata,tax,results/{qc,dada2,diversity,figures,trees},code,logs}
cd halophile_vietnam
```

Cấu trúc thư mục được tổ chức như sau:
- `raw/`: Chứa dữ liệu giải trình tự thô (định dạng `.sra` và `.fastq.gz`).
- `metadata/`: Lưu trữ thông tin mẫu sinh học và môi trường.
- `results/`: Lưu trữ kết quả đầu ra của từng phân đoạn (kiểm tra chất lượng `qc`, xử lý ASV `dada2`, v.v.).
- `code/` và `logs/`: Nơi lưu trữ các script tự động và file nhật ký khi chạy lệnh.
