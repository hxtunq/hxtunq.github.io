---
id: "halophile-phyloseq-prep"
parentId: "halophile-s4-phylogeny"
bookId: "halophilic-microbiota-vietnam"
title: "4.2. Khởi tạo đối tượng Phyloseq"
order: 2
---

Gói `phyloseq` là một trong những công cụ mạnh mẽ nhất trong R để quản lý và phân tích dữ liệu sinh thái học vi sinh vật. Ở bước này, chúng ta sẽ tích hợp bảng ASV, bảng phân loại học, metadata mẫu và cây phát sinh loài vào làm một đối tượng duy nhất.

## Nhập dữ liệu và khởi tạo Phyloseq

Chúng ta đọc bảng dữ liệu môi trường (metadata) và tích hợp các dữ liệu thô:

```R
library(phyloseq)

# Đọc metadata mẫu
prok_sample <- read.csv("metadata/dataset_env_2_mod.csv", header=TRUE, sep=",", row.names=1)
summary(prok_sample)

# Khởi tạo đối tượng phyloseq
prok_data <- phyloseq(otu_table(seqtab.nochim, taxa_are_rows = FALSE), 
                  phy_tree(fitGTR$tree), 
                  tax_table(taxa), 
                  sample_data(prok_sample))
prok_data
```

## Loại bỏ các sinh vật ngoại lai & Nhiễm bẩn (Filtering)

Loại bỏ các chi vi khuẩn được xác định là nhiễm bẩn hoặc sinh vật ngoại lai không thuộc hệ sinh thái đặc trưng của cánh đồng muối cực mặn:

```R
# Loại bỏ chi Acidovorax và các chi tương tự nếu có
Viet_no_cont <- subset_taxa(prok_data, (Genus != "Acidovorax") | is.na(Genus))
Viet_no_cont <- subset_taxa(Viet_no_cont, (Genus != "Allorhizobium-Neorhizobium-Pararhizobium-Rhizobium") | is.na(Genus))  
```

## Loại bỏ mẫu không đạt yêu cầu

Nếu có các mẫu dị thường hoặc mẫu kiểm chứng (control) cần loại ra khỏi nghiên cứu chính (ví dụ mẫu ID 38):

```R
# Loại bỏ mẫu ID 38
vietnam2024 <- subset_samples(Viet_no_cont, ID != "38")
vietnam2024

# Lưu đối tượng phyloseq đã làm sạch làm đầu vào cho phân tích sinh thái
saveRDS(vietnam2024, file="results/diversity/vietnam2024_phyloseq.rds")
```
Đối tượng `vietnam2024` này sẽ được sử dụng trực tiếp để ước lượng đa dạng Alpha và Beta trong các chương kế tiếp.
