---
id: "halophile-mantel-test"
parentId: "halophile-s6-mantel"
bookId: "halophilic-microbiota-vietnam"
title: "6.1. Kiểm tra Mantel"
order: 1
---

Kiểm tra Mantel (Mantel's Test) là một phương pháp thống kê dùng để kiểm định mức độ tương quan giữa hai ma trận khoảng cách: cụ thể ở đây là mối tương quan giữa ma trận khác biệt cộng đồng vi sinh vật (sinh học) và ma trận khoảng cách các chỉ số hóa lý môi trường (vật lý/hóa học).

## Mục tiêu phân tích
Chúng ta muốn xác minh xem liệu có phải sự thay đổi về thành phần quần xã vi sinh vật ưa mặn bị chi phối chính bởi các nhân tố hóa lý môi trường (như độ mặn - salinity, pH, nhiệt độ - temperature) hay không.

## Thực thi Mantel's Test trong R

Chúng ta sử dụng hàm `mantel` trong gói `vegan` để đánh giá:

```R
library(phyloseq)
library(vegan)

# Đọc đối tượng phyloseq
vietnam2024 <- readRDS("results/diversity/vietnam2024_phyloseq.rds")

# 1. Tính toán ma trận khoảng cách sinh học (Bray-Curtis)
bio_dist <- distance(vietnam2024, method="bray")

# 2. Chuẩn bị ma trận khoảng cách môi trường (ví dụ lấy cột Salinity và pH)
env_data <- data.frame(sample_data(vietnam2024))
env_selected <- env_data[, c("Salinity", "pH")]

# Chuẩn hóa dữ liệu môi trường (scale) trước khi tính khoảng cách Euclidean
env_scaled <- scale(env_selected)
env_dist <- dist(env_scaled, method="euclidean")

# 3. Thực hiện phép thử Mantel
mantel_res <- mantel(bio_dist, env_dist, method="spearman", permutations=999)
mantel_res
```

## Giải thích kết quả
- **Mantel statistic r**: Giá trị dao động từ -1 đến 1. Giá trị gần 1 chỉ ra mối tương quan thuận mạnh mẽ giữa khoảng cách sinh học và khoảng cách môi trường (tức là môi trường càng khác nhau thì vi sinh vật càng khác nhau).
- **Significance (p-value)**: Nếu p-value < 0.05, ta bác bỏ giả thuyết không và kết luận rằng các yếu tố hóa lý có ảnh hưởng cực kỳ đáng kể lên sự phân bố và cấu trúc quần xã vi sinh vật ưa mặn tại các cánh đồng muối Việt Nam.
