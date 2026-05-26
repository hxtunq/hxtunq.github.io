---
id: "preface"
bookId: "bash-fundamentals-bioinformatics"
title: "Lời nói đầu"
order: 0
---

Chào mừng bạn đến với tài liệu hướng dẫn **Bash cho Tin Sinh học**. Cuốn sách này được viết nhằm trang bị cho bạn những kiến thức thực tế từ cơ bản đến nâng cao để tương tác với hệ điều hành Unix/Linux, tự động hóa công việc và tối ưu hóa thời gian xử lý dữ liệu sinh học khổng lồ. Dòng lệnh Bash là kỹ năng cơ bản và tối quan trọng đối với bất kỳ nhà phân tích tin sinh học nào.

Việc phân tích dữ liệu sinh học đòi hỏi khả năng xử lý các tệp dữ liệu có kích thước lên đến hàng gigabyte, từ dữ liệu giải trình tự FASTQ của các nền tảng như Illumina (https://www.illumina.com) đến dữ liệu đa biến từ các cơ sở dữ liệu như NCBI (https://www.ncbi.nlm.nih.gov). Môi trường dòng lệnh cho phép bạn thực thi các pipeline phân tích một cách tự động và có thể tái lập lại.

**Cấu trúc của cuốn sách:** Cuốn sách được cấu trúc thành các bài học chính: giới thiệu CLI và điều hướng hệ thống tệp, thao tác và xem tệp tin an toàn, ứng dụng toán tử đường dẫn (pipe) và bộ lọc dữ liệu, viết kịch bản shell script để tự động hóa, và quản lý gói phần mềm với Conda. Ngoài ra, bạn cũng sẽ học cách sử dụng công cụ quản lý phiên bản [Git](https://git-scm.com) để theo dõi và chia sẻ code phân tích của mình.

**Về môi trường thực hành:** Để thực hành hiệu quả, bạn cần một máy tính cài đặt Linux, macOS, hoặc Windows với [WSL2](https://learn.microsoft.com/en-us/windows/wsl/install). Phần lớn các công cụ được dùng trong tài liệu này có thể cài đặt thông qua `conda`, một trình quản lý gói được phát triển bởi cộng đồng [Anaconda](https://www.anaconda.com).

## Tại sao lại học Bash?

Bash không chỉ là một công cụ — nó là ngôn ngữ chung của toàn bộ hệ sinh thái tin sinh học. Hầu hết các công cụ phân tích nổi tiếng như **GATK**, **BWA**, **SAMtools** và **STAR** đều được vận hành thông qua dòng lệnh. Khả năng viết script và tự động hóa pipeline giúp bạn tái sử dụng công việc, giảm thiểu sai sót thủ công và tăng đáng kể tốc độ xử lý. Nếu bạn muốn tìm hiểu thêm về cộng đồng sinh tin học mã nguồn mở, hãy tham khảo [Bioconductor](https://www.bioconductor.org) và [Galaxy Project](https://galaxyproject.org).
