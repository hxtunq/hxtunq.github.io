---
id: "halophile-beta-diversity"
parentId: "halophile-s5-diversity"
bookId: "halophilic-microbiota-vietnam"
title: "5.2. Phân tích đa dạng Beta"
order: 2
---

Đa dạng Beta (Beta Diversity) đo lường mức độ tương đồng hoặc khác biệt về mặt cấu trúc cộng đồng vi sinh vật giữa các mẫu hoặc các nhóm mẫu khác nhau.

## Lựa chọn khoảng cách đo lường (Distance Metrics)
- **Bray-Curtis distance**: Chỉ đo lường tần suất hiện diện của các ASV mà không quan tâm đến mối quan hệ di truyền tiến hóa giữa chúng.
- **Weighted/Unweighted UniFrac**: Khoảng cách có sử dụng cây phát sinh loài để đánh giá sự khác biệt dựa trên mức độ tiến hóa di truyền.

## Phân tích Tọa độ (Ordination) bằng PCoA / NMDS

Sử dụng `phyloseq` và `vegan` để thực hiện phân tích PCoA/NMDS:

```R
library(phyloseq)
library(ggplot2)
library(vegan)

# Đọc đối tượng phyloseq
vietnam2024 <- readRDS("results/diversity/vietnam2024_phyloseq.rds")

# Tính toán khoảng cách Bray-Curtis và chạy PCoA
bray_dist <- distance(vietnam2024, method="bray")
pcoa_res <- ordinate(vietnam2024, method="PCoA", distance=bray_dist)

# Trực quan hóa bản đồ tọa độ
p_beta <- plot_ordination(vietnam2024, pcoa_res, color="Location", shape="Type") +
  geom_point(size=4) +
  theme_minimal() +
  labs(title="Phân tích PCoA dựa trên khoảng cách Bray-Curtis")
p_beta

ggsave("results/figures/beta_diversity_pcoa.png", plot=p_beta, width=8, height=6)
```

## Kiểm định PERMANOVA (Adonis)
Để kiểm tra xem cấu trúc quần xã vi sinh vật có sự khác biệt thực sự mang ý nghĩa thống kê giữa các nhóm nhân tố môi trường hay không, chúng ta thực hiện phép thử PERMANOVA:

```R
# Chuyển đổi dữ liệu sang định dạng của vegan
otu_tab <- as(otu_table(vietnam2024), "matrix")
metadata <- data.frame(sample_data(vietnam2024))

# Chạy Adonis kiểm định yếu tố vị trí địa lý (Location)
adonis2(bray_dist ~ Location, data=metadata, permutations=999)
```
Kết quả của giá trị $p$ (p-value < 0.05) sẽ cho chúng ta biết độ tin cậy của sự phân cụm quan sát được trên biểu đồ PCoA.
