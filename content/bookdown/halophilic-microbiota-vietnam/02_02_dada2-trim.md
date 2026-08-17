---
id: "halophile-dada2-trim"
parentId: "halophile-s2-qc"
bookId: "halophilic-microbiota-vietnam"
title: "2.2. Lọc và cắt chất lượng"
order: 2
---

Bước đầu tiên trong xử lý ASV (Amplicon Sequence Variant) bằng DADA2 là lọc bỏ các đoạn đọc chất lượng kém và cắt bỏ các vùng base đầu/cuối có điểm chất lượng thấp.

## Thư viện & Đường dẫn làm việc

Chúng ta tải các thư viện R cần thiết và khai báo đường dẫn chứa các file FASTQ:

```R
library(dada2)
library(dplyr)
library(ggplot2)

path <- "raw/fastq" # Thư mục chứa các file fastq.gz đã giải nén
list.files(path)
```

## Đọc danh sách file & Kiểm tra chất lượng

Tách riêng tệp đọc xuôi (forward) và đọc ngược (reverse):

```R
fnFs <- sort(list.files(path, pattern="_1.fastq.gz", full.names = TRUE))
fnRs <- sort(list.files(path, pattern="_2.fastq.gz", full.names = TRUE))

# Trích xuất tên mẫu
sample.names <- sapply(strsplit(basename(fnFs), "_"), `[`, 1) 
```

Vẽ biểu đồ phân bố điểm chất lượng (Quality Profile) để đưa ra quyết định cắt:

```R
plotQualityProfile(fnFs[1:2])
plotQualityProfile(fnRs[1:2])
```

## Thực thi lọc và cắt chất lượng (filterAndTrim)

Khai báo đường dẫn cho các tệp sau khi lọc:

```R
filtFs <- file.path(path, "filtered", paste0(sample.names, "_F_filt.fastq.gz"))
filtRs <- file.path(path, "filtered", paste0(sample.names, "_R_filt.fastq.gz"))
names(filtFs) <- sample.names
names(filtRs) <- sample.names

out <- filterAndTrim(fnFs, filtFs, fnRs, filtRs, 
                 truncLen=c(155, 145), # Cắt độ dài dựa trên biểu đồ chất lượng
                 maxN=0, 
                 maxEE=c(2, 5),
                 truncQ=2, 
                 rm.phix=TRUE,
                 compress=TRUE, 
                 multithread=TRUE)
head(out)
```

```output
#                         reads.in	reads.out
# H1_R1_trimmed.fastq	  31218		31202
# H10_R1_trimmed.fastq	  55941		55917
# H11_R1_trimmed.fastq	  54938		54907
# H14_R1_trimmed.fastq	  44480		44447
# H15_R1_trimmed.fastq	  50093		50066
# H16_R1_trimmed.fastq	  147518	146693
```
