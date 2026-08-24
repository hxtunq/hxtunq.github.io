---
id: "bash-daily-quest-1"
title: "Bash Daily Quest from Dr. Ming Tang"
category: "Daily Quest"
date: "2026-08-22"
dateDisplay: "Aug 22, 2026"
abstract: ""
author: "Xuan Tung Hoang"
language: "Vietnamese"
status: "Published"
tags: ["Linux", "Bash", "Bioinformatics"]
---

cat *.vcf | grep -v '^#' | awk '{print $1 "\t" $2 "\t" $5}' | sort | uniq -d | wc -l