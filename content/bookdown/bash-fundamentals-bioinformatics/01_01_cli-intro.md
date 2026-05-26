---
id: "cli-intro"
bookId: "bash-fundamentals-bioinformatics"
parentId: "cli-navigation"
title: "1.1. Lệnh pwd và ls"
order: "1.1"
code: |
  # In đường dẫn thư mục làm việc hiện tại
  pwd
  
  # Liệt kê nội dung thư mục chi tiết
  ls -la
---

Giao diện dòng lệnh (CLI) là môi trường chính để thực thi các đường dẫn phân tích tin sinh học. Việc điều hướng hệ thống tệp tin nhanh chóng và hiểu rõ cấu trúc thư mục là rất cần thiết. Trong chương này, chúng ta sẽ tìm hiểu các lệnh cơ bản để xem thư mục hiện tại (`pwd`), liệt kê danh sách (`ls`), và thay đổi vị trí (`cd`).

Ví dụ, chạy lệnh `pwd` để xem đường dẫn đầy đủ của thư mục làm việc hiện tại:

```bash
# Xem thư mục làm việc hiện tại
pwd
```

```output
/home/tung/academic-portfolio
```

Để liệt kê tất cả các tệp tin và thư mục con trong thư mục hiện tại kèm theo thông tin chi tiết (quyền truy cập, chủ sở hữu, dung lượng, thời gian cập nhật), ta chạy lệnh `ls` với các tham số `-l` và `-a`:

```bash
# Liệt kê nội dung thư mục chi tiết bao gồm cả tệp ẩn
ls -la
```

```output
total 24
drwxr-xr-x  5 tung tung 4096 May 26 19:40 .
drwxr-xr-x 20 tung tung 4096 May 26 19:35 ..
-rw-r--r--  1 tung tung  845 May 26 19:40 package.json
drwxr-xr-x  3 tung tung 4096 May 26 19:35 src
drwxr-xr-x  4 tung tung 4096 May 26 19:35 content
```