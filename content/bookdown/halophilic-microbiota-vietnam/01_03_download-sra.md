---
id: "halophile-download-sra"
parentId: "halophile-s1-prep"
bookId: "halophilic-microbiota-vietnam"
title: "1.3. Tải và chuyển đổi dữ liệu"
order: 3
---

Dữ liệu giải trình tự 16S rRNA gene (Illumina MiSeq) được tải xuống từ SRA-NCBI với mã hiệu truy cập [PRJNA1142429](https://www.ebi.ac.uk/ena/browser/view/PRJNA1142429). Tổng cộng có 19 mẫu ứng với 19 tệp `.sra` cần được tải xuống.

Đầu tiên, sử dụng `esearch` để lấy thông tin toàn bộ các run thuộc project.

```bash 
esearch -db sra -query PRJNA1142429 | efetch -format runinfo > metadata/SraRunInfo.csv

head metadata/SraRunInfo.csv
```
```toggle-output
Run,ReleaseDate,LoadDate,spots,bases,spots_with_mates,avgLength,size_MB,AssemblyName,download_path,Experiment,LibraryName,LibraryStrategy,LibrarySelection,LibrarySource,LibraryLayout,InsertSize,InsertDev,Platform,Model,SRAStudy,BioProject,Study_Pubmed_id,ProjectID,Sample,BioSample,SampleType,TaxID,ScientificName,SampleName,g1k_pop_code,source,g1k_analysis_group,Subject_ID,Sex,Disease,Tumor,Affection_Status,Analyte_Type,Histological_Type,Body_Site,CenterName,Submission,dbgap_study_accession,Consent,RunHash,ReadHash
SRR30093239,2024-08-01 18:19:10,2024-08-01 18:03:39,110471,59763194,110471,540,33,,https://sra-downloadb.be-md.ncbi.nlm.nih.gov/sos6/sra-pub-zq-40/SRR030/30093/SRR30093239/SRR30093239.lite.1,SRX25566630,VS1,AMPLICON,PCR,METAGENOMIC,PAIRED,0,0,ILLUMINA,Illumina MiSeq,SRP523689,PRJNA1142429,,1142429,SRS22218652,SAMN42940649,simple,496920,saltern metagenome,VS1,,,,,,,no,,,,,CNR-NATIONAL COUNCIL OF RESEARCH,SRA1937995,,public,4BE43CC2A3A46194C5ED565BDC762F9B,01CB0B95DDA4909343FA6C586E66DABF
SRR30093238,2024-08-01 18:19:10,2024-08-01 18:03:43,132730,72524301,132730,546,40,,https://sra-downloadb.be-md.ncbi.nlm.nih.gov/sos6/sra-pub-zq-40/SRR030/30093/SRR30093238/SRR30093238.lite.1,SRX25566631,VS2,AMPLICON,PCR,METAGENOMIC,PAIRED,0,0,ILLUMINA,Illumina MiSeq,SRP523689,PRJNA1142429,,1142429,SRS22218653,SAMN42940650,simple,496920,saltern metagenome,VS2,,,,,,,no,,,,,CNR-NATIONAL COUNCIL OF RESEARCH,SRA1937995,,public,CDA2DA99E02A8C0268D3AC15B3475FCE,868DEA294E5B7CB557AF711CB81D4BA8
```

Sau đó, sử dụng `cut` và `grep` để lọc ra chỉ cột và các dòng chứa mã hiệu SRA từ file trên. 

[^note: Khi chạy đoạn code này, lỗi [ERROR: curl command failed with: 56]{red} có thể xuất hiện. Lỗi này là do edirect/curl bị rớt SSL giữa chừng khi gọi NCBI, tuy nhiên các tệp vẫn có thể được tải xuống.]

```bash
cut -d',' -f1 metadata/SraRunInfo.csv | grep -E '^[SED]RR' > metadata/SraAccList.txt
```

Để kiểm tra lại xem tệp `metadata/SraAccList.txt` đã được tạo hay chưa:

```bash
wc -l metadata/SraAccList.txt
head metadata/SraAccList.txt
```

Nếu tệp đã được tải xuống, kết quả kỳ vọng sẽ trả về 19 dòng, với mỗi dòng là một mã hiệu SRA.  

```output
19 metadata/SraAccList.txt
SRR30093239
SRR30093238
SRR30093237
SRR30093236
SRR30093235
SRR30093234
SRR30093233
SRR30093231
SRR30093232
SRR30093230
```

Tiếp theo, ta dùng lệnh `prefetch` để tải toàn bộ tệp SRA đượt liệt kê tên ở danh sách này về máy:

[^note: Quá trình tải 19 tệp trên diễn ra trong khoảng 1 giờ 10 phút, dung lượng tải về khoảng 4GB.]

```bash
prefetch --option-file metadata/SraAccList.txt --output-directory raw/sra
```

```toggle-output
2026-06-02T06:58:57 prefetch.3.4.1: 1) Resolving 'SRR30093239'...
2026-06-02T06:59:00 prefetch.3.4.1: Current preference is set to retrieve SRA Normalized Format files with full base quality scores
2026-06-02T06:59:01 prefetch.3.4.1: 1) Downloading 'SRR30093239'...
2026-06-02T06:59:01 prefetch.3.4.1:  SRA Normalized Format file is being retrieved
2026-06-02T06:59:01 prefetch.3.4.1:  Downloading via HTTPS...
2026-06-02T07:01:31 prefetch.3.4.1:  HTTPS download succeed
2026-06-02T07:01:31 prefetch.3.4.1:  'SRR30093239' is valid: 34924591 bytes were streamed from 34919941
2026-06-02T07:01:31 prefetch.3.4.1: 1) 'SRR30093239' was downloaded successfully
...
```

Để đưa về đầu vào chuẩn của đa số các quy trình xử lý dữ liệu giải trình tự thế hệ mới, cần chuyển tệp `.sra` sang định dạng `.fastq` dùng `fasterq-dump` và sau đó nén FASTQ thành các tệp `.gz` bằng công cụ nén song song `pigz`.

```bash
while read acc; do
  echo "Converting $acc"
  fasterq-dump raw/sra/${acc}/${acc}.sra \
    --split-files \
    --threads 8 \
    --outdir raw/fastq
  pigz -p 8 raw/fastq/${acc}_*.fastq
done < metadata/SraAccList.txt
```

```toggle-output
Converting SRR30093239
spots read      : 110,471
reads read      : 220,942
reads written   : 220,942
Converting SRR30093238
spots read      : 132,730
reads read      : 265,460
reads written   : 265,460
Converting SRR30093237
spots read      : 178,481
reads read      : 356,962
reads written   : 356,962
Converting SRR30093236
spots read      : 160,781
reads read      : 321,562
reads written   : 321,562
Converting SRR30093235
spots read      : 208,201
reads read      : 416,402
reads written   : 416,402
Converting SRR30093234
spots read      : 148,679
reads read      : 297,358
reads written   : 297,358
Converting SRR30093233
spots read      : 127,052
reads read      : 254,104
reads written   : 254,104
Converting SRR30093231
spots read      : 140,432
reads read      : 280,864
reads written   : 280,864
Converting SRR30093232
spots read      : 158,593
reads read      : 317,186
reads written   : 317,186
Converting SRR30093230
spots read      : 158,277
reads read      : 316,554
reads written   : 316,554
Converting SRR30093229
spots read      : 165,861
reads read      : 331,722
reads written   : 331,722
Converting SRR30093228
spots read      : 166,010
reads read      : 332,020
reads written   : 332,020
Converting SRR30093227
spots read      : 161,189
reads read      : 322,378
reads written   : 322,378
Converting SRR30093226
spots read      : 187,271
reads read      : 374,542
reads written   : 374,542
Converting SRR30093225
spots read      : 155,564
reads read      : 311,128
reads written   : 311,128
Converting SRR30093224
spots read      : 150,324
reads read      : 300,648
reads written   : 300,648
Converting SRR30093223
spots read      : 158,192
reads read      : 316,384
reads written   : 316,384
Converting SRR30093222
spots read      : 185,222
reads read      : 370,444
reads written   : 370,444
Converting SRR30093221
spots read      : 322,495
reads read      : 644,990
reads written   : 644,990
```

<details>
<summary>Ý nghĩa của dòng lệnh `while read acc`, `--split-files` và `pigz`?</summary>

`while read acc` thực thi việc đọc từng dòng trong file `metadata/SraAccList.txt`, mỗi dòng gán vào biến `acc`, rồi chạy các lệnh bên trong vòng lặp cho `acc`ession (mã hiệu truy cập) đó. Ví dụ file `metadata/SraAccList.txt` có: SRR30093239, SRR30093238, SRR30093237 thì vòng lặp sẽ chạy lần lượt acc=SRR30093239, acc=SRR30093238, acc=SRR30093237.

Sử dụng `fasterq-dump --help`, ta có thể thấy tuỳ chọn `--split-files` cho phép người dùng viết lại dữ liệu đầu vào thành các file khác nhau. Cụ thể, dữ liệu đầu vào của pipeline là các file định dạng `.sra` (do SRA Tools cung cấp) chứa các đoạn đọc dual-end (read 1 và read 2), và tuỳ chọn này đảm bảo rằng các đoạn đọc này được tách biệt rõ ràng thành các file `.fastq` (read 1) và `.fastq` (read 2).

Còn `pigz`, về cơ bản là phiên bản nén được song song của `gzip`, tức là giống `gzip` nhưng dùng nhiều CPU threads hơn, do đó sẽ nén FASTQ nhanh hơn rất nhiều. `-p 8` nghĩa là dùng 8 threads.

</details>

Xác nhận số lượng file đã nén thành công (mỗi chiều đọc 1 và 2 phải đủ 19 tệp):

```bash
ls raw/fastq/*_1.fastq.gz | wc -l
ls raw/fastq/*_2.fastq.gz | wc -l
```

```output
19
19
```

