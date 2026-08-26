---
id: "bash-daily-quest-1"
title: "[Daily Bash #1] Chuỗi lệnh tìm và đếm số lượng biến thể trùng nhau giữa các file VCF"
category: "Daily Quest"
date: "2026-08-22"
dateDisplay: "Aug 22, 2026"
abstract: ""
author: "Xuan Tung Hoang"
language: "Tiếng Việt"
status: "Published"
tags: ["Bash", "Bioinformatics"]
---

Trong phân tích dữ liệu giải trình tự thế hệ mới, một trong những bài toán phổ biến là so sánh các biến thể di truyền giữa nhiều mẫu khác nhau. Chẳng hạn, bạn có 5 file kết quả gọi biến thể từ 5 mẫu bệnh nhân và muốn biết nhanh rằng là liệu "Có bao nhiêu đột biến xuất hiện ở ít nhất 2 mẫu?".

Thay vì phải viết code Python/R dài hoặc mở từng file để kiểm chứng lại bằng tay một cách thủ công, ta có thể giải quyết bài toán này chỉ với một chuỗi lệnh Bash dùng các đường ống (`|`).

## 1. Cú pháp hoàn chỉnh

```bash
cat *.vcf | grep -v '^#' | awk '{print $1 "\t" $2 "\t" $5}' | sort | uniq -d | wc -l
```

## 2. Cấu trúc của một file VCF

Trước tiên, hãy cùng nhìn nhanh cấu trúc của file **.vcf** - định dạng tiêu chuẩn lưu trữ các đột biến di truyền:

```text
##fileformat=VCFv4.2
##source=Mutect2
#CHROM   POS      ID   REF   ALT   QUAL   FILTER   INFO
chr1     10439    .    A     C     60     PASS     DP=45
chr1     10580    .    G     A     50     PASS     DP=32
chr2     20912    .    T     G     99     PASS     DP=120
```

Có thể thấy rằng, file VCF luôn gồm 2 phần:
1. **Header (các dòng bắt đầu bằng `#`):** Chứa thông tin cấu hình, phiên bản và tên các cột dữ liệu.
2. **Phần dữ liệu chính:** Mỗi dòng đại diện cho một biến thể với 8 cột thông tin chuẩn:

| Cột | Tên trường | Mô tả | Ví dụ |
| :--- | :--- | :--- | :--- |
| `$1` | CHROM | Tên nhiễm sắc thể chứa biến thể | `chr1` |
| `$2` | POS | Tọa độ / vị trí biến thể trên nhiễm sắc thể | `10439` |
| `$3` | ID | Mã định danh biến thể (như mã rsID từ dbSNP) | `rs12345` hoặc `.` |
| `$4` | REF | Alen tham chiếu / nucleotide gốc trên hệ gen chuẩn | `A` |
| `$5` | ALT | Alen đột biến / nucleotide bị thay thế | `C` |
| `$6` | QUAL | Điểm chất lượng gọi biến thể (Phred-score) | `60` |
| `$7` | FILTER | Trạng thái lọc chất lượng | `PASS` |
| `$8` | INFO | Các trường thông tin chú giải bổ sung | `DP=45` |

## 3. Phân tích chi tiết câu lệnh

Chuỗi lệnh trên hoạt động theo nguyên lý đường ống (pipeline): kết quả đầu ra (`stdout`) của lệnh phía trước sẽ trở thành đầu vào (`stdin`) của lệnh tiếp theo thông qua ký tự gạch đứng `|`.

```text
[cat *.vcf] ➔ [grep -v] ➔ [awk print] ➔ [sort] ➔ [uniq -d] ➔ [wc -l]
```

**Bước 1**: `cat *.vcf` — Gom dữ liệu từ tất cả các file.

Lệnh `cat` sẽ đọc và gộp toàn bộ nội dung của tất cả các file `.vcf` trong thư mục hiện tại lại với nhau.

**Bước 2**: `grep -v '^#'` — Lọc bỏ phần header và tiêu đề cột, chỉ giữ lại các dòng chứa dữ liệu biến thể.

Ký tự `^` trong biểu thức chính quy (Regex) đại diện cho điểm bắt đầu của dòng. `^#` nghĩa là chỉ những dòng bắt đầu bằng dấu `#`. Dùng cờ `-v` (*invert-match*) để tùy chọn đảo ngược kết quả, chỉ giữ lại những dòng không bắt đầu bằng dấu `#`.

**Bước 3**: `awk '{print $1 "\t" $2 "\t" $5}'` — Trích xuất tọa độ biến thể

Lệnh `awk` mặc định chia từng dòng thành các cột được đánh số `$1, $2, $3...` dựa trên khoảng trắng hoặc tab. Ở đây, ta chỉ cần in ra: Cột 1 (Nhiễm sắc thể), Cột 2 (Vị trí) và Cột 5 (Alen đột biến), ngăn cách nhau bởi ký tự tab `\t`. Sở dĩ ta chỉ cần lấy 3 cột này là vì bộ ba thông tin này đã đủ để định danh duy nhất một biến thể. Việc gạt bỏ các cột khác giúp đơn giản hóa dữ liệu và loại trừ các khác biệt nhiễu (bởi vì lệnh `uniq` quét và so sánh toàn bộ nội dung của cả hàng; nếu ta để nguyên cả dòng, hai biến thể giống hệt nhau nhưng có điểm số QUAL hoặc cột INFO khác nhau sẽ bị `uniq` coi là hai dòng khác biệt và không nhóm lại được), từ đó đảm bảo việc so sánh và đếm các biến thể trùng lặp ở các bước sau diễn ra chính xác tuyệt đối.

**Bước 4**: `sort` — Sắp xếp các dòng

Lệnh `sort` sắp xếp tất cả các dòng theo thứ tự tăng dần của bảng chữ cái và số. Ở đây ta bắt buộc phải dùng lệnh `sort` vì lệnh `uniq` ở bước sau chỉ nhận diện các dòng trùng nhau nếu chúng nằm liền kề nhau. Tức là ta phải sắp xếp để các biến thể giống nhau nằm sát cạnh nhau.

**Bước 5**: `uniq -d` — Lọc các biến thể trùng lặp

Lệnh `uniq` loại bỏ các dòng trùng lặp và giữ lại 1 bản sao duy nhất. Cờ `-d` (*duplicates*) đảo ngược hành vi của lệnh `uniq`, giúp chỉ in ra những dòng xuất hiện từ 2 lần trở lên, với mỗi nhóm trùng lặp sẽ được in ra đúng 1 dòng đại diện.

**Bước 6**: `wc -l` — Đếm số lượng kết quả

Lệnh `wc` (*word count*) với cờ `-l` (*lines*) đếm tổng số dòng còn lại sau khi lọc. Con số trả về chính là tổng số lượng các biến thể chung xuất hiện ở nhiều file.

## 4. Một số lưu ý

- Khi làm việc với tập mẫu lớn (chẳng hạn 50-100 file VCF), ta cần quan tâm cả đến việc biến thể đó lặp lại với tần số bao nhiêu, cao hay thấp, để có thể đưa ra được các tiêu chuẩn đánh giá và sàng lọc phù hợp chứ không phải chỉ cần biết mỗi thông tin là nó có trùng lặp hay không. Lúc này, ta có thể thay `uniq -d | wc -l` bằng `uniq -c | sort -nr` để vừa đếm số lần xuất hiện, vừa sắp xếp các biến thể phổ biến nhất lên đầu.
- Khi file VCF bị nén (`.vcf.gz`) ta dùng `zcat *.vcf.gz` (hoặc `gzcat` trên macOS) thay vì `cat` để giải nén trực tiếp vào luồng pipeline mà không cần tốn dung lượng giải nén ra đĩa cứng.
- Để tránh trường hợp 1 biến thể xuất hiện 2 lần trong cùng một file bị tính nhầm là xuất hiện ở 2 mẫu, ta có thể tiền xử lý từng file bằng `sort -u` trước khi gom chung.
- Đối với tập dữ liệu lớn có hàng trăm mẫu, nên sử dụng các công cụ chuyên dụng như `bcftools isec` để vừa đảm bảo tốc độ cao, vừa xuất được báo cáo chi tiết theo từng cặp mẫu.