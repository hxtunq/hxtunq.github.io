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
tags: ["Linux", "Bash", "Bioinformatics"]
---

cat *.vcf | grep -v '^#' | awk '{print $1 "\t" $2 "\t" $5}' | sort | uniq -d | wc -l