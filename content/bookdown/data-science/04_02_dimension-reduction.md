---
id: "data-science-dimension-reduction"
bookId: "data-science"
title: "4.2 Phân tích đa biến và Giảm chiều dữ liệu"
section: "Thống kê ứng dụng"
order: 8
---

Dữ liệu sinh học hiện đại (hệ gen, hệ phiên mã, vi sinh vật) thường có số lượng biến đo lường (hàng nghìn gen) lớn hơn rất nhiều so với số lượng mẫu thu thập. Vấn đề "lời nguyền của số chiều" làm sai lệch khoảng cách hình học giữa các mẫu. Các thuật toán giảm chiều (PCA, t-SNE, UMAP) giúp nén thông tin xuống không gian 2D hoặc 3D, từ đó bộc lộ rõ cấu trúc phân nhóm tế bào, phát hiện mẫu dị biệt và loại bỏ nhiễu nền.

### Tài liệu tham khảo
- **[A Step-by-Step Explanation of Principal Component Analysis (PCA)](https://builtin.com/data-science/step-step-explanation-principal-component-analysis)** — *Zakaria Jaadi*  
  Bài viết trực quan từng bước giải thích đại số tuyến tính đằng sau PCA: ma trận hiệp phương sai, vector riêng (eigenvectors) và giá trị riêng (eigenvalues).
- **[How to Use t-SNE Effectively](https://distill.pub/2016/misread-tsne/)** — *Martin Wattenberg, Fernanda Viégas, Ian Johnson (Distill.pub)*  
  Bài viết tương tác kinh điển chỉ ra cách hiểu đúng siêu tham số Perplexity và tránh suy diễn sai khi đọc biểu đồ t-SNE.
- **[Understanding UMAP](https://pair-code.github.io/understanding-umap/)** — *Google PAIR*  
  Mô phỏng tương tác giúp nắm bắt cách thuật toán UMAP bảo tồn cấu trúc toàn cục (global) và cục bộ (local) của dữ liệu đa chiều.

### Phương pháp phân tích quan trọng
- **Giảm chiều tuyến tính:** Principal Component Analysis (PCA), Multidimensional Scaling (MDS / PCoA).
- **Giảm chiều phi tuyến:** t-SNE, UMAP.
- **Phân cụm dữ liệu:** K-means, Hierarchical Clustering (Heatmaps kèm dendrogram), DBSCAN.
- **Thống kê đa biến sinh thái / hệ vi sinh:** PERMANOVA (phép thử hoán vị phân tích phương sai đa biến), kiểm định Mantel.
