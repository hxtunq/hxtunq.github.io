---
id: "halophile-alpha-diversity"
parentId: "halophile-s5-diversity"
bookId: "halophilic-microbiota-vietnam"
title: "5.1. Ước lượng đa dạng Alpha"
order: 1
---

Đa dạng Alpha (Alpha Diversity) phản ánh độ phong phú và độ đồng đều của các loài vi sinh vật bên trong từng mẫu cụ thể.

## Các chỉ số đa dạng Alpha phổ biến
Chúng ta sẽ tính toán các chỉ số đa dạng thông dụng bao gồm:
- **Observed ASVs**: Số lượng loài (ASV) thực tế quan sát được.
- **Chao1**: Ước lượng số lượng loài ẩn (species richness) dựa trên các loài hiếm (singletons/doubletons).
- **Shannon**: Đánh giá cả độ phong phú loài và tính đồng đều (evenness).
- **Simpson**: Đo lường mức độ tập trung hoặc tính ưu thế của một vài loài.

## Tính toán và vẽ biểu đồ đa dạng Alpha trong R

Sử dụng gói `phyloseq` và `ggplot2` để trực quan hóa:

```R
library(phyloseq)
library(ggplot2)

# Đọc đối tượng phyloseq đã được làm sạch
vietnam2024 <- readRDS("results/diversity/vietnam2024_phyloseq.rds")

# Tính toán các chỉ số
alpha_meas <- estimate_richness(vietnam2024, measures=c("Observed", "Chao1", "Shannon", "Simpson"))

# Vẽ biểu đồ boxplot so sánh đa dạng Alpha giữa các nhóm mẫu (ví dụ theo Location hoặc Salinity)
p_alpha <- plot_richness(vietnam2024, x="Location", color="Location", measures=c("Shannon", "Simpson")) + 
  geom_boxplot() + 
  theme_bw() +
  labs(title="Đa dạng Alpha của hệ vi sinh vật ưa mặn")
p_alpha

ggsave("results/figures/alpha_diversity.png", plot=p_alpha, width=8, height=6)
```

## Kiểm định thống kê
Để kiểm tra xem sự khác biệt về đa dạng Alpha giữa các nhóm mẫu có ý nghĩa thống kê hay không, ta có thể áp dụng các bài test phi tham số như Wilcoxon (cho 2 nhóm) hoặc Kruskal-Wallis (cho >2 nhóm):

```R
# Thử nghiệm Kruskal-Wallis cho chỉ số Shannon theo địa điểm
kruskal.test(Shannon ~ Location, data=data.frame(alpha_meas, sample_data(vietnam2024)))
```
Kết quả kiểm định giúp chúng ta khẳng định sự biến động sinh thái giữa các vùng sinh thái đặc trưng.
