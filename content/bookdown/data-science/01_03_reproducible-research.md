---
id: "data-science-reproducibility"
bookId: "data-science"
title: "1.2 Quản lý phiên bản và Tái lập nghiên cứu"
section: "Kỹ năng liên quan"
order: 2
---

Cuộc khủng hoảng tái lập trong khoa học bắt nguồn từ việc thất lạc mã nguồn, xung đột phiên bản thư viện hoặc sử dụng các thao tác thủ công không được ghi lại. Việc kết hợp Git để theo dõi lịch sử code, Conda/Docker để đóng gói môi trường và Quarto/Jupyter để tích hợp mã phân tích trực tiếp vào văn bản báo cáo là bộ kỹ năng bắt buộc giúp nghiên cứu có thể chạy lại chính xác trên bất kỳ máy tính hoặc nền tảng nào.

### Tài liệu tham khảo
- **[Happy Git and GitHub for the useR](https://happygitwithr.com/)** — *Jenny Bryan, the STAT 545 TAs, Jim Hester*  
  Cẩm nang chi tiết nhất giúp người làm khoa học làm quen với Git & GitHub, cấu hình SSH keys, giải quyết xung đột mã nguồn (merge conflicts) và quy trình làm việc nhóm.
- **[Pro Git (2e)](https://git-scm.com/book/en/v2)** — *Scott Chacon, Ben Straub*  
  Sách hướng dẫn chính thức và miễn phí về toàn bộ cơ chế phân nhánh (branching), commit và kiến trúc bên dưới của Git.
- **[The Turing Way](https://book.the-turing-way.org/)** — *The Turing Way Community*  
  Sổ tay hướng dẫn mở toàn diện về khoa học dữ liệu tái lập (reproducible), nghiên cứu có đạo đức và hợp tác hiệu quả.

### Quản lý môi trường và Đóng gói
- **Conda & Mamba / Pixi:** Tạo môi trường ảo cách ly các phiên bản thư viện Python/R/C++ và các công cụ tin sinh học độc lập.
- **Docker & Singularity / Apptainer:** Đóng gói toàn bộ hệ điều hành, mã nguồn và dependencies vào một container khép kín, đảm bảo tính nhất quán trên mọi máy tính và cụm HPC.

### Báo cáo và Xuất bản khoa học
- **[Quarto Documentation](https://quarto.org/)** — Hệ thống xuất bản khoa học kỹ thuật thế hệ mới hỗ trợ đồng thời R, Python, Julia và Observable. Xuất báo cáo đa định dạng (HTML, PDF, Word, Slide và Website).
- **Jupyter Notebook & JupyterLab:** Môi trường ghi chép và thử nghiệm mã nguồn tương tác phổ biến nhất trong cộng đồng Data Science.
