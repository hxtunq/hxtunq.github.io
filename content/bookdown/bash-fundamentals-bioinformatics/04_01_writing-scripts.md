---
id: "writing-scripts"
bookId: "bash-fundamentals-bioinformatics"
parentId: "shell-scripting"
title: "4.1. Tạo kịch bản run_analysis.sh"
order: "4.1"
code: |
  # Tạo tệp wrapper script chạy phân tích cơ bản
  cat << 'EOF' > run_analysis.sh
  #!/bin/bash
  echo "Bắt đầu chạy đường dẫn phân tích..."
  mkdir -p output
  grep -v "^#" raw_data/sample.fasta > output/cleaned.fasta
  echo "Hoàn thành phân tích thành công!"
  EOF
  
  # Chạy script vừa tạo
  bash run_analysis.sh
---

Viết các kịch bản lệnh Bash giúp tự động hóa các tác vụ lặp đi lặp lại và ghi chép lại toàn bộ quy trình phân tích. Bằng cách lưu trữ các dòng lệnh vào tệp tin `.sh` và cấp quyền thực thi, quy trình phân tích của bạn trở nên có khả năng tái lặp, dễ dàng chia sẻ và sẵn sàng chạy trên các cụm tính toán hiệu năng cao (HPC).