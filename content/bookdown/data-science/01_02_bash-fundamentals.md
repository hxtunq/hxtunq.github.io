---
id: "data-science-bash"
bookId: "data-science"
title: "1.1 Giao diện dòng lệnh và Bash"
section: "Kỹ năng liên quan"
order: 1
---

[^note: GUI: Graphic User Interface\nCLI: Command Line Interface]

Trong tin sinh học, một bộ dữ liệu giải trình tự có thể chứa đến hàng tỷ bản ghi và chiếm hàng chục hoặc hàng trăm gigabyte dung lượng. Đặc điểm này khiến các phần mềm giao diện đồ hoạ người dùng (GUI) như Excel hoặc Word trở nên rất hạn chế trong việc lưu trữ và dễ quá tải khi thao tác phức tạp. Để khắc phục nhược điểm này, các nhà tin sinh học thường làm việc thông qua giao diện dòng lệnh (CLI). Thay vì phải nạp toàn bộ tệp vào một cửa sổ, các công cụ dòng lệnh có thể đọc dữ liệu tuần tự, xử lý từng bản ghi và truyền kết quả trực tiếp cho công cụ tiếp theo. Cách làm này đặc biệt hiệu quả với dữ liệu dạng văn bản, các tệp nén và những tác vụ lặp lại. Nó cũng giúp ghi lại chính xác các bước phân tích, từ đó làm cho quy trình dễ kiểm tra và tái lập hơn. CLI còn là phương thức phổ biến để đăng nhập vào máy chủ từ xa, truyền dữ liệu và gửi tác vụ lên hệ thống quản lý của cụm máy tính hiệu năng cao (HPC). 

[^note: Terminal là ứng dụng dùng để nhập lệnh và hiển thị kết quả. Bên trong terminal thường chạy một shell, chẳng hạn Bash hoặc Zsh; người dùng tương tác với shell và các chương trình khác thông qua giao diện dòng lệnh (CLI).]

Trên Linux và macOS, người học có thể bắt đầu từ ứng dụng terminal có sẵn. Trên Windows, Windows Subsystem for Linux (WSL) thường là môi trường thuận tiện để học và chạy các công cụ Linux dùng trong tin sinh học. Bạn có thể [cài đặt WSL](https://youtu.be/mbFA7zjD2ps?si=-dDqeOZm6GclxQk5) và sau đó sử dụng trực tiếp trên terminal Windows, hoặc có thể [cài đặt máy chủ ảo](https://youtu.be/Hva8lsV2nTk?si=f7rNg4RM2SfwOgML) sử dụng hệ điều hành Linux chạy song song với Window.

Để bắt đầu với Shell và Bash, thông thường ta chỉ cần làm quen với một số câu lệnh cơ bản có sẵn, bao gồm các câu lệnh điều hướng hệ thống như `pwd`, `ls`, `cd` và `mkdir`; các câu lệnh thao tác với tệp như `touch`, `cp`, `mv`, `rm`, `cat`, `head` và `tail`; và các câu lệnh xử lý dữ liệu như `grep`, `sort`, `wc`, `awk` và `comm`. Tổ hợp các câu lệnh cơ bản này có thể tạo thành một dòng lệnh phức tạp, thứ có thể giúp ta trả lời vô số các câu hỏi sinh học mà trước đây vốn rất khó khăn để giải quyết.

Khoá học **[JHU: Command Line Tools for Genomic Data Science](https://www.coursera.org/learn/genomic-tools)** trên nền tảng Coursera là một nguồn nhập môn rất phù hợp và chi tiết khi nội dung của nó bao phủ cả các lệnh Unix cơ bản lẫn các câu lệnh của SAMtools, BEDtools, Bowtie/BWA, VCF và một số công cụ trong transcriptomics.

Kho lưu trữ tài liệu **[Github](https://github.com/luuloi/Cancer_Epigenetics)** của lớp **[Cancer Epigenetics](https://youtube.com/playlist?list=PLXtgXP89Tyn9AvPFJWi7znv_bCJHiSvqG&si=mIBuqodWd5Z8sQWH)** (được dạy bởi TS. Lưu Phúc Lợi) cũng là một nguồn tài liệu rất đáng tham khảo khi ta có thể quan sát được cách mà CLI ứng dụng để giải quyết các vấn đề sinh học hiện đại cụ thể, ví dụ như di truyền học biểu sinh ung thư.

Ngoài phạm vi tin sinh học, CLI cũng đóng vai trò vô cùng quan trọng trong khoa học dữ liệu nói chung. Một số ưu điểm không ngờ tới của các công cụ này có thể giúp bạn thay đổi hoàn toàn thói quen sử dụng máy tính, hoặc thậm chí có thể giúp giảm thiểu đáng kể các tác vụ thủ công nhàm chán bạn hay phải làm. Đọc thêm về các lý do nên dùng chúng tại: **[50 reasons to learn the shell for doing data science](https://conferences.oreilly.com/strata/strata-eu-2018/cdn.oreillystatic.com/en/assets/1/event/267/50%20reasons%20to%20learn%20the%20shell%20for%20doing%20data%20science%20Presentation.pdf)**.

### Nguồn tham khảo bổ sung
- **[Data Science at the Command Line (2e)](https://datascienceatthecommandline.com/)** — *Jeroen Janssens* 
- **[ExplainShell](https://explainshell.com/)** — Trang tra cứu và giải thích chi tiết các tham số, cờ lệnh trong các câu lệnh Linux.