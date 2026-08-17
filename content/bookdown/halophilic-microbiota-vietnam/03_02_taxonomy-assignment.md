---
id: "halophile-taxonomy-assignment"
parentId: "halophile-s3-dada2"
bookId: "halophilic-microbiota-vietnam"
title: "3.2. Định danh phân loại học"
order: 2
---

Sau khi thu được bảng ASV không có chimera, bước tiếp theo là xác định danh tính phân loại (phân nhóm phân loại học từ Giới đến Loài) cho từng trình tự ASV bằng cách so khớp với cơ sở dữ liệu tham chiếu (ví dụ: SILVA v138).

## Gán tên phân loại (assignTaxonomy)

Chúng ta sử dụng thuật toán phân loại RDP Classifier được tích hợp sẵn trong DADA2 cùng bộ dữ liệu tham chiếu SILVA:

```R
taxa <- assignTaxonomy(seqtab.nochim, "tax/silva_nr99_v138.1_train_set.fa.gz", multithread=TRUE)
taxa <- addSpecies(taxa, "tax/silva_species_assignment_v138.1.fa.gz")
```

## Kiểm tra kết quả định danh

Loại bỏ trình tự nucleotide dài ở tên dòng để dễ hiển thị và in thử kết quả:

```R
taxa.print <- taxa
rownames(taxa.print) <- NULL
head(taxa.print)
```

## Xuất bảng kết quả ra file

Chúng ta lưu các kết quả đã xử lý ra các định dạng chuẩn để dễ dàng chia sẻ hoặc phân tích ở phần sau:

```R
# Xuất bảng ASV
write.table(t(seqtab.nochim), "results/dada2/seqtab-nochim.txt", sep="\t", row.names=TRUE, col.names=NA, quote=FALSE)

# Xuất file FASTA chứa các đại diện trình tự ASV
uniquesToFasta(seqtab.nochim, fout='results/dada2/rep-seqs.fna', ids=colnames(seqtab.nochim))

# Xuất bảng phân loại học
write.csv(taxa.print, "results/dada2/taxa_table.csv")

save.image("results/dada2/dada2_final.RData")
```
Now chúng ta đã có bảng phân loại học hoàn chỉnh làm cơ sở cho các phân tích sinh thái học tiếp theo.
