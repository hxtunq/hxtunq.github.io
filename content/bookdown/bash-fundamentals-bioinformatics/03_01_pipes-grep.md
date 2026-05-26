---
id: "pipes-grep"
bookId: "bash-fundamentals-bioinformatics"
parentId: "pipelines-redirections"
title: "3.1. Ống dẫn (pipe) và lệnh grep"
order: "3.1"
code: |
  # Đếm số lượng trình tự trong tệp tin FASTA
  grep -c "^>" raw_data/sample.fasta
  
  # Kết hợp đường dẫn để đếm tổng số tệp tin
  ls -la raw_data | wc -l
---

Sức mạnh của Unix nằm ở toán tử đường dẫn (pipe `|`). Nó cho phép kết quả đầu ra của một công cụ trở thành đầu vào cho một công cụ khác. Kết hợp với các bộ lọc như `grep` để tìm kiếm mẫu và `wc` để đếm dòng, bạn có thể thực hiện các truy vấn phức tạp trực tiếp trên tệp tin trình tự.