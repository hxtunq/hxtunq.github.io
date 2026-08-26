---
id: "wsl-disk-full-ext4-vhdx-guide"
title: "Why your storage drive suddenly fills up with WSL?"
category: "Technical Note"
date: "2026-04-28"
dateDisplay: "Apr 28, 2026"
abstract: "Explaining why your storage drive suddenly runs out of disk space when using WSL, why ext4.vhdx doesn't shrink automatically after deleting files, and step-by-step instructions to clean up and compact virtual disks."
author: "Xuan Tung Hoang"
language: "English"
status: "Published"
tags: ["WSL", "Windows", "Troubleshooting"]
---

I use WSL on Windows for my bioinformatics work. Recently, I ran into a frustrating issue where my storage drive suddenly ran out of space, dropping from over 100 GB free down to just 8 GB. This made no sense at the time because I had not downloaded any new datasets, installed new tools, or run any heavy pipelines.

I started by checking the storage distribution inside Ubuntu using commands like `du -sh ~/* | sort -h`. Then I checked Windows using Windows Settings, which indicated that Installed apps was taking up hundreds of GB, but clicking into the list only showed regular applications that I had installed months ago.

I tried the common fixes recommended on Google, such as clearing temporary files with `%temp%`, cleaning system caches, and uninstalling unused Windows programs. When that did nothing, I even went back into Ubuntu and deleted several large project files and datasets with `rm -rf`. Still, my Windows drive remained completely full. None of the active files seemed to explain where the 92 GB had gone.

After looking deeper into how WSL works, I found the explanation.

WSL 2 does not store Linux files as normal individual files on your Windows NTFS partition. Instead, the entire Linux filesystem is packaged inside a single virtual hard disk file named `ext4.vhdx`, located inside your Windows AppData folder.

The VHDX format is designed as a dynamically expanding virtual disk. When you install packages, extract archives, or process sequencing data in Linux, Windows automatically allocates more physical disk blocks to the `ext4.vhdx` file so Linux has room to write.

The catch is that dynamic virtual disks only expand automatically; they do not shrink automatically when you delete files. When you run `rm` inside Linux, the ext4 filesystem only marks those sectors as free internally for future Linux writes. The physical `ext4.vhdx` file on Windows stays at its historical peak size. Virtual disk formats are designed this way intentionally to avoid constant disk fragmentation and performance overhead from shrinking the file on every small deletion.

To reclaim the lost space, we need to clean up inside Linux first and then manually compact the virtual disk from Windows. Here is the exact workflow.

## 1. Clean up inside WSL (optional)

Open your WSL terminal and run the following commands to remove leftover caches:

```bash
conda clean --all
rm -rf ~/.cache/pip
sudo apt clean
sudo apt autoremove -y
```

You can also check for obsolete project files or checkpoints with `du -sh ~/* | sort -h` and delete what you no longer need.

## 2. Locate the ext4.vhdx file

1. Press Windows + R on your keyboard to open the Run dialog.
2. Paste `%LOCALAPPDATA%` and press Enter.
3. Open the folder for your Linux distribution (for example `wsl`).
4. Open the subfolder (for example `{dbc973c-g9c2-123d-fb8225c0caac}`).
5. Right-click the `ext4.vhdx` file and select Copy as path.

## 3. Compact the virtual disk

Open Command Prompt as Administrator on Windows and run these commands in order:

1. Shut down WSL completely
```cmd
wsl --shutdown
```

2. Open the Diskpart tool
```cmd
diskpart
```

3. Select your virtual disk file
```diskpart
select vdisk file="PASTE_YOUR_COPIED_PATH_TO_ext4_HERE"
```
(e.g. `select vdisk file="C:\Users\PC\AppData\Local\wsl\{dbed843c-a9b2-...}\ext4.vhdx"`)

4. Run the compaction command
```diskpart
attach vdisk readonly
compact vdisk
```
Wait for the progress to reach 100%.

5. Detach and exit
```diskpart
detach vdisk
exit
```

After running these commands, you immediately got your free space back.