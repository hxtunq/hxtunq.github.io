---
id: "data-science-r"
bookId: "data-science"
title: "2.2 Trực quan hoá dữ liệu bằng R"
section: "R cho khoa học dữ liệu"
order: 4
---

Trực quan hóa dữ liệu bằng R và `ggplot2` mang lại lợi thế vượt trội so với các công cụ giao diện như Excel hay Origin nhờ tính tái lập 100% bằng code, triết lý xếp chồng các lớp đồ họa linh hoạt (Grammar of Graphics) và khả năng xuất bản ấn phẩm vector (PDF/SVG) đạt chuẩn các tạp chí khoa học hàng đầu thế giới (Nature, Science, Lancet).

### Tài liệu tham khảo
- **[ggplot2: Elegant Graphics for Data Analysis (3e)](https://ggplot2-book.org/)** — *H. Wickham, D. Navarro, T. Lin Pedersen*  
  Cuốn cẩm nang toàn diện giải thích triết lý phân lớp Grammar of Graphics và cách tư duy trực quan hóa dữ liệu với ggplot2.
- **[R Graphics Cookbook (2e)](https://r-graphics.org/)** — *Winston Chang*  
  Sách dạng công thức thực chiến: cần vẽ dạng biểu đồ nào chỉ việc tra cứu và áp dụng ngay vào dự án.
- **[Fundamentals of Data Visualization](https://clauswilke.com/dataviz/)** — *Claus O. Wilke*  
  Tập trung vào tư duy thẩm mỹ, cách chọn biểu đồ đúng bản chất dữ liệu, phối màu khoa học và cách truyền tải câu chuyện qua biểu đồ.

### Trang tra cứu và Thư viện mẫu
- **[The R Graph Gallery](https://r-graph-gallery.com/)** — Bộ sưu tập hàng trăm dạng biểu đồ R kèm mã nguồn chi tiết từng bước.
- **[from Data to Viz](https://www.data-to-viz.com/)** — Cây quyết định hướng dẫn chọn biểu đồ phù hợp nhất dựa trên kiểu dữ liệu đầu vào.
- **[Cedric Scherer's ggplot2 Tutorials](https://www.cedricscherer.com/)** — Các bài blog chuyên sâu về nâng tầm thẩm mỹ và thiết kế biểu đồ xuất bản chất lượng cao.

### Gói mở rộng đáng dùng
- `patchwork` / `cowplot`: Ghép nhiều biểu đồ thành panel đa khung hoàn chỉnh cho bài báo.
- `ggrepel`: Xử lý tránh đè nhãn chữ tự động thông minh.
- `ggsci`: Bảng màu chuẩn từ các tạp chí khoa học lớn như Nature, Science, NEJM, Lancet, JAMA.
- `gganimate` / `plotly`: Tạo biểu đồ chuyển động và biểu đồ tương tác trực tiếp trên web.
