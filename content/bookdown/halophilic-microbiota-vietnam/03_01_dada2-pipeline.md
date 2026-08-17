---
id: "halophile-dada2-pipeline"
parentId: "halophile-s3-dada2"
bookId: "halophilic-microbiota-vietnam"
title: "3.1. Phân loại ASV bằng DADA2"
order: 1
---

Sau khi đã lọc chất lượng, chúng ta đi vào quy trình cốt lõi của DADA2: học mô hình sai số, suy luận chuỗi ASV chính xác, ghép cặp đọc và loại bỏ chimera.

## Học mô hình sai số (learnErrors)

DADA2 sử dụng thuật toán máy học tự giám sát để ước lượng tần suất sai số giải trình tự từ chính dữ liệu thực tế:

```R
errF <- learnErrors(filtFs, multithread=TRUE, randomize=TRUE)
errR <- learnErrors(filtRs, multithread=TRUE, randomize=TRUE)

# Vẽ biểu đồ sai số để thẩm định mô hình
plotErrors(errF, nominalQ=TRUE)
```

## Giải mã & Suy luận mẫu (Sample Inference)

Áp dụng thuật toán DADA2 cốt lõi để loại bỏ nhiễu và tìm ra các biến thể chuỗi sinh học thực tế:

```R
derepFs <- derepFastq(filtFs, verbose=TRUE)
derepRs <- derepFastq(filtRs, verbose=TRUE)

names(derepFs) <- sample.names
names(derepRs) <- sample.names

dadaFs <- dada(derepFs, err=errF, pool="pseudo", multithread=TRUE)
dadaRs <- dada(derepRs, err=errR, pool="pseudo", multithread=TRUE)
```

## Ghép cặp đọc xuôi/ngược (mergePairs)

Ghép các cặp đọc xuôi và ngược lại với nhau để tái tạo vùng amplicon hoàn chỉnh:

```R
mergers <- mergePairs(dadaFs, derepFs, dadaRs, derepRs, verbose=TRUE)
head(mergers[[1]])
```

## Tạo bảng ASV (Sequence Table)

Xây dựng bảng tần suất xuất hiện của các ASV trên từng mẫu (tương đương bảng OTU trước đây):

```R
seqtab <- makeSequenceTable(mergers)
dim(seqtab)

# Kiểm tra phân bố độ dài của các ASV
table(nchar(getSequences(seqtab)))
```

## Loại bỏ chimeras (removeBimeraDenovo)

Chimera là các chuỗi nhân tạo được tạo ra do sự lai ghép ngẫu nhiên trong PCR. Chúng ta cần loại bỏ chúng ra khỏi dữ liệu:

```R
seqtab.nochim <- removeBimeraDenovo(seqtab, method="consensus", multithread=TRUE, verbose=TRUE)
dim(seqtab.nochim)

# Tính tỷ lệ reads sạch giữ lại được
sum(seqtab.nochim)/sum(seqtab)
```

## Theo dõi số lượng reads qua các bước (Track Reads)

Để đánh giá hiệu suất của pipeline, chúng ta tổng hợp số lượng reads được giữ lại sau mỗi bước xử lý:

```R
getN <- function(x) sum(getUniques(x))
track <- cbind(out, sapply(dadaFs, getN), sapply(dadaRs, getN), sapply(mergers, getN), rowSums(seqtab.nochim))
colnames(track) <- c("input", "filtered", "denoisedF", "denoisedR", "merged", "nonchim")
rownames(track) <- sample.names
head(track)

write.csv(track, "results/dada2/summary_track_reads.csv")
```

```output
#           input		filtered	denoisedF	denoisedR	merged		nonchim
#H1	        31218		31202		30327		30476		20968		14139
#H10	    55941		55917		54348		54858		46377		34852
```
