---
id: "halophile-phylogeny"
parentId: "halophile-s4-phylogeny"
bookId: "halophilic-microbiota-vietnam"
title: "4.1. Xây dựng cây phát sinh loài"
order: 1
---

Xây dựng cây phát sinh loài (phylogenetic tree) là một bước cần thiết để thực hiện các phân tích đa dạng sinh học có trọng số tiến hóa (ví dụ: tính toán khoảng cách UniFrac).

## Căn chỉnh đa trình tự (Multiple Sequence Alignment)

Chúng ta sử dụng gói `msa` trong R (hoặc liên kết với ClustalW bên ngoài) để căn chỉnh các đại diện trình tự ASV:

```R
library(msa)
library(phangorn)
library(ape)

seqs <- getSequences(seqtab.nochim)
names(seqs) <- seqs # Đặt nhãn tip là chính trình tự để đồng bộ với phyloseq
mult <- msa(seqs, method="ClustalW", type="dna", order="input")
```

## Xây dựng cây Neighbor-Joining (NJ)

Chuyển đổi dữ liệu căn chỉnh về định dạng tiến hóa và xây dựng cây NJ ban đầu:

```R
phang.align <- as.phyDat(mult, type="DNA", names=getSequence(seqtab.nochim))
dm <- dist.ml(phang.align)
treeNJ <- NJ(dm) # Xây dựng cây Neighbor-Joining
```

## Tối ưu hóa cây phát sinh loài bằng Maximum Likelihood (ML)

Sử dụng gói `phangorn` để tìm cấu trúc cây tối ưu nhất dưới mô hình tiến hóa GTR:

```R
fit <- pml(treeNJ, data=phang.align)
fitGTR <- update(fit, k=4, inv=0.2)
fitGTR <- optim.pml(fitGTR, model="GTR", optInv=TRUE, optGamma=TRUE,
                rearrangement = "stochastic", control = pml.control(trace = 0))

# Lưu cây phát sinh loài
write.tree(fitGTR$tree, file="results/trees/phylo_tree.tre")
```
Cây phát sinh loài tối ưu thu được sẽ được tích hợp trực tiếp vào đối tượng `phyloseq` ở chương tiếp theo.
