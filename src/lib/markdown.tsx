/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import React, { useState } from "react";
import { Check, Copy } from "lucide-react";

export interface MarkdownBlock {
  type: "heading" | "paragraph" | "code" | "quote" | "image" | "list" | "details" | "hr" | "table";
  level?: number;
  text?: string;
  items?: string[];
  ordered?: boolean;
  start?: number;
  language?: string;
  code?: string;
  src?: string;
  alt?: string;
  caption?: string;
  note?: string;
  noteOffset?: number;
  headers?: string[];
  rows?: string[][];
  aligns?: ("left" | "center" | "right")[];
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove Vietnamese accents
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .trim();
}

function extractNote(text: string): { cleanText: string; note?: string; offset?: number } {
  const noteMarker = "[^note:";
  const startIndex = text.indexOf(noteMarker);
  if (startIndex === -1) {
    return { cleanText: text };
  }

  // Find the matching closing bracket for the note by counting nested brackets
  let bracketCount = 1;
  let i = startIndex + noteMarker.length;
  while (i < text.length && bracketCount > 0) {
    if (text[i] === "[") {
      bracketCount++;
    } else if (text[i] === "]") {
      bracketCount--;
    }
    i++;
  }

  if (bracketCount === 0) {
    const noteFullText = text.substring(startIndex + noteMarker.length, i - 1);
    
    // Parse offset if present, e.g. "note content | 10"
    // We look for the last "|" that is NOT inside nested brackets
    let pipeIndex = -1;
    let nestedLevel = 0;
    for (let j = noteFullText.length - 1; j >= 0; j--) {
      if (noteFullText[j] === "]") nestedLevel++;
      else if (noteFullText[j] === "[") nestedLevel--;
      else if (noteFullText[j] === "|" && nestedLevel === 0) {
        pipeIndex = j;
        break;
      }
    }

    let note = noteFullText.trim();
    let offset = 0;
    if (pipeIndex !== -1) {
      const offsetStr = noteFullText.substring(pipeIndex + 1).trim();
      if (/^-?\d+$/.test(offsetStr)) {
        note = noteFullText.substring(0, pipeIndex).trim();
        offset = parseInt(offsetStr, 10);
      }
    }

    const cleanText = (text.substring(0, startIndex) + text.substring(i)).trim();
    return { cleanText, note, offset };
  }

  return { cleanText: text };
}

function extractNoteFromCode(code: string): { cleanCode: string; note?: string; offset?: number } {
  const lines = code.split("\n");
  let note: string | undefined;
  let offset: number | undefined;
  const cleanLines = lines.filter(line => {
    const res = extractNote(line);
    if (res.note !== undefined) {
      note = res.note;
      offset = res.offset;
      return false; // exclude this line from code block display
    }
    return true;
  });
  return { cleanCode: cleanLines.join("\n"), note, offset };
}

export function parseMarkdown(md: string): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = [];
  const lines = md.split("\n");
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i++;
      continue;
    }

    // Details block
    if (line.trim().startsWith("<details>")) {
      let summaryText = "";
      const summaryMatch = line.match(/<summary>(.*?)<\/summary>/);
      if (summaryMatch) {
        summaryText = summaryMatch[1];
      }
      
      let detailsContent = "";
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("</details>")) {
        const currentLine = lines[i];
        const innerSummary = currentLine.match(/<summary>(.*?)<\/summary>/);
        if (innerSummary) {
          summaryText = innerSummary[1];
        } else {
          detailsContent += currentLine + "\n";
        }
        i++;
      }
      
      blocks.push({
        type: "details",
        text: summaryText,
        code: detailsContent,
      });
      i++; // skip </details>
      continue;
    }

    // Code blocks
    if (line.trim().startsWith("```")) {
      const lang = line.trim().slice(3).trim();
      let code = "";
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        code += lines[i] + "\n";
        i++;
      }
      blocks.push({ type: "code", language: lang || "text", code: code.trim() });
      i++; // skip closing ```
      continue;
    }

    // Blockquotes
    if (line.trim().startsWith(">")) {
      let quoteText = "";
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        quoteText += lines[i].trim().replace(/^>\s*/, "") + " ";
        i++;
      }
      blocks.push({ type: "quote", text: quoteText.trim() });
      continue;
    }

    // Headings
    if (line.trim().startsWith("#")) {
      const match = line.trim().match(/^(#{1,6})\s+(.*)/);
      if (match) {
        blocks.push({
          type: "heading",
          level: match[1].length,
          text: match[2].trim(),
        });
      } else {
        const hashes = line.trim().match(/^(#{1,6})/);
        blocks.push({
          type: "heading",
          level: hashes ? hashes[1].length : 1,
          text: "",
        });
      }
      i++;
      continue;
    }

    // Horizontal rules (---, ***, ___)
    if (/^(---|___|\*\*\*)$/.test(line.trim())) {
      blocks.push({ type: "hr" });
      i++;
      continue;
    }

    // Ordered (numbered) lists (1. , 2. , etc.)
    if (/^\d+\.\s+/.test(line.trim())) {
      const items: string[] = [];
      const startMatch = line.trim().match(/^(\d+)\.\s+/);
      const start = startMatch ? parseInt(startMatch[1], 10) : 1;
      while (i < lines.length) {
        const currentTrim = lines[i].trim();
        const itemMatch = currentTrim.match(/^\d+\.\s+(.*)/);
        if (itemMatch) {
          items.push(itemMatch[1].trim());
          i++;
        } else if (
          items.length > 0 &&
          (lines[i].startsWith("  ") || lines[i].startsWith("\t")) &&
          currentTrim
        ) {
          items[items.length - 1] += "\n" + currentTrim;
          i++;
        } else {
          break;
        }
      }
      blocks.push({ type: "list", items, ordered: true, start });
      continue;
    }

    // Bullet lists
    if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
      const items: string[] = [];
      while (i < lines.length) {
        const currentTrim = lines[i].trim();
        if (currentTrim.startsWith("- ") || currentTrim.startsWith("* ")) {
          items.push(currentTrim.slice(2).trim());
          i++;
        } else if (
          items.length > 0 &&
          (lines[i].startsWith("  ") || lines[i].startsWith("\t")) &&
          currentTrim
        ) {
          items[items.length - 1] += "\n" + currentTrim;
          i++;
        } else {
          break;
        }
      }
      blocks.push({ type: "list", items, ordered: false });
      continue;
    }

    // Images
    if (line.trim().startsWith("![") && line.trim().includes("](")) {
      const match = line.trim().match(/^!\[(.*?)\]\((.*?)(?:\s+"(.*?)"\s*)?\)$/);
      if (match) {
        blocks.push({
          type: "image",
          alt: match[1],
          src: match[2],
          caption: match[3] || "",
        });
        i++;
        continue;
      }
    }

    // Markdown Tables (| Col1 | Col2 | ... |)
    if (
      line.trim().includes("|") &&
      i + 1 < lines.length &&
      /^\|?(\s*:?-+:?\s*\|)+\s*:?-+:?\s*\|?$/.test(lines[i + 1].trim())
    ) {
      const headerLine = lines[i].trim();
      const delimiterLine = lines[i + 1].trim();

      const parseCells = (row: string) => {
        let trimmed = row.trim();
        if (trimmed.startsWith("|")) trimmed = trimmed.slice(1);
        if (trimmed.endsWith("|")) trimmed = trimmed.slice(0, -1);
        return trimmed.split("|").map(cell => cell.trim());
      };

      const headers = parseCells(headerLine);
      const delimiterCells = parseCells(delimiterLine);

      const aligns: ("left" | "center" | "right")[] = delimiterCells.map(cell => {
        const left = cell.startsWith(":");
        const right = cell.endsWith(":");
        if (left && right) return "center";
        if (right) return "right";
        return "left";
      });

      const rows: string[][] = [];
      i += 2; // skip header and delimiter

      while (i < lines.length && lines[i].trim() && lines[i].trim().includes("|")) {
        const rowCells = parseCells(lines[i].trim());
        while (rowCells.length < headers.length) {
          rowCells.push("");
        }
        rows.push(rowCells.slice(0, headers.length));
        i++;
      }

      blocks.push({
        type: "table",
        headers,
        rows,
        aligns,
      });
      continue;
    }

    // Paragraph
    let pText = "";
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().startsWith("#") &&
      !lines[i].trim().startsWith("```") &&
      !lines[i].trim().startsWith(">") &&
      !lines[i].trim().startsWith("- ") &&
      !lines[i].trim().startsWith("* ") &&
      !/^\d+\.\s+/.test(lines[i].trim()) &&
      !/^(---|___|\*\*\*)$/.test(lines[i].trim()) &&
      !lines[i].trim().startsWith("<details>") &&
      !(lines[i].trim().startsWith("![") && lines[i].trim().includes("](")) &&
      !(
        lines[i].trim().includes("|") &&
        i + 1 < lines.length &&
        /^\|?(\s*:?-+:?\s*\|)+\s*:?-+:?\s*\|?$/.test(lines[i + 1].trim())
      )
    ) {
      pText += (pText ? " " : "") + lines[i].trim();
      i++;
    }
    if (pText.trim()) {
      blocks.push({ type: "paragraph", text: pText.trim() });
    }
  }

  // Post-process to extract notes from blocks
  return blocks.map(block => {
    if (block.type === "paragraph" || block.type === "heading" || block.type === "quote") {
      if (block.text) {
        const { cleanText, note, offset } = extractNote(block.text);
        return {
          ...block,
          text: cleanText,
          note,
          noteOffset: offset
        };
      }
    } else if (block.type === "code") {
      if (block.code) {
        const { cleanCode, note, offset } = extractNoteFromCode(block.code);
        return {
          ...block,
          code: cleanCode,
          note,
          noteOffset: offset
        };
      }
    } else if (block.type === "image") {
      if (block.caption) {
        const { cleanText, note, offset } = extractNote(block.caption);
        return {
          ...block,
          caption: cleanText,
          note,
          noteOffset: offset
        };
      }
    } else if (block.type === "list" && block.items) {
      let listNote: string | undefined;
      let listOffset: number | undefined;
      const cleanItems = block.items.map(item => {
        const { cleanText, note, offset } = extractNote(item);
        if (note) {
          listNote = note;
          listOffset = offset;
        }
        return cleanText;
      });
      return {
        ...block,
        items: cleanItems,
        note: listNote,
        noteOffset: listOffset
      };
    }
    return block;
  });
}

export function renderInlineStyles(text: string): React.JSX.Element {
  // Protect inline code from other replacements
  const codeSnippets: string[] = [];
  let processed = text.replace(/`([^`]+)`/g, (_, code) => {
    const placeholder = `___INLINE_CODE_${codeSnippets.length}___`;
    codeSnippets.push(
      `<code class='font-mono text-[0.88em] px-1.5 py-0.5 rounded-xs bg-brand-surface-high/30 text-brand-secondary font-medium'>${code
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")}</code>`
    );
    return placeholder;
  });

  let html = processed
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/\\n/g, "\n")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    // Markdown links: [text](url)
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
      "<a href='$2' target='_blank' rel='noopener noreferrer' class='text-blue-600 hover:text-blue-800 underline underline-offset-2 decoration-blue-400/50 transition-colors'>$1</a>"
    )
    // Bare URLs: (https://...) or https://... standalone
    .replace(
      /\((https?:\/\/[^\s)]+)\)/g,
      "(<a href='$1' target='_blank' rel='noopener noreferrer' class='text-blue-600 hover:text-blue-800 underline underline-offset-2 decoration-blue-400/50 transition-colors'>$1</a>)"
    )
    // Custom inline coloring: [text]{style}
    .replace(
      /\[([^\]]+)\]\{([^}]+)\}/g,
      (match, content, style) => {
        const trimmedStyle = style.trim();
        const isColor = /^(#[0-9a-fA-F]{3,8}|[a-zA-Z]+)$/.test(trimmedStyle);
        const hasColon = trimmedStyle.includes(":");
        if (isColor) {
          const colorMap: Record<string, string> = {
            red: "#e11d48",      // Soft, professional rose-red (rose-600)
            green: "#10b981",    // Soft emerald-500
            blue: "#2563eb",     // Soft blue-600
            yellow: "#d97706",   // Soft amber-600
            orange: "#ea580c",   // Soft orange-600
            purple: "#7c3aed",   // Soft violet-600
            gray: "#4b5563",     // Soft gray-600
          };
          const colorValue = colorMap[trimmedStyle.toLowerCase()] || trimmedStyle;
          return `<span style="color: ${colorValue}">${content}</span>`;
        } else if (hasColon) {
          return `<span style="${trimmedStyle}">${content}</span>`;
        }
        return match;
      }
    )
    .replace(/\n/g, "<br class='my-0.5' />");

  codeSnippets.forEach((snippet, idx) => {
    html = html.replace(`___INLINE_CODE_${idx}___`, snippet);
  });

  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}


function highlightBashLine(line: string): string {
  const commentIndex = line.indexOf("#");
  let codePart = line;
  let commentPart = "";
  if (commentIndex !== -1) {
    if (commentIndex === 0 || /\s/.test(line[commentIndex - 1])) {
      codePart = line.slice(0, commentIndex);
      commentPart = `<span class="text-slate-500 font-mono">${line.slice(commentIndex)}</span>`;
    }
  }

  let escapedCode = codePart
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const strings: string[] = [];
  const stringRegex = /"([^"\\]|\\.)*"|'([^'\\]|\\.)*'/g;
  escapedCode = escapedCode.replace(stringRegex, (match) => {
    const placeholder = `___STR_PLACEHOLDER_${strings.length}___`;
    strings.push(`<span class="text-emerald-400">${match}</span>`);
    return placeholder;
  });

  const keywords = [
    "echo", "cd", "ls", "pwd", "mkdir", "rm", "cp", "mv", "grep", "cat", "conda", 
    "mamba", "python", "pip", "git", "export", "chmod", "for", "while", "in", 
    "do", "done", "if", "then", "else", "fi", "source", "activate", "sudo", "apt", "nano"
  ];
  keywords.forEach((keyword) => {
    const regex = new RegExp(`\\b(${keyword})\\b`, "g");
    escapedCode = escapedCode.replace(regex, '<span class="text-cyan-400 font-semibold">$1</span>');
  });

  escapedCode = escapedCode.replace(/(\$[\w]+)/g, '<span class="text-amber-400 font-mono">$1</span>');
  escapedCode = escapedCode.replace(/(\$\{[\w]+\})/g, '<span class="text-amber-400 font-mono">$1</span>');
  escapedCode = escapedCode.replace(/(\s)(-\w+|\-\-[\w\-]+)/g, '$1<span class="text-fuchsia-400">$2</span>');

  strings.forEach((strHtml, index) => {
    escapedCode = escapedCode.replace(`___STR_PLACEHOLDER_${index}___`, strHtml);
  });

  return escapedCode + commentPart;
}

export function highlightBashCode(code: string): string {
  const cleanCode = code.replace(/\r/g, "");
  const lines = cleanCode.split("\n");
  return lines.map(highlightBashLine).join("\n");
}

function highlightRLine(line: string): string {
  const commentIndex = line.indexOf("#");
  let codePart = line;
  let commentPart = "";
  if (commentIndex !== -1) {
    codePart = line.slice(0, commentIndex);
    commentPart = `<span class="text-[#75715e] font-mono italic">${line.slice(commentIndex)}</span>`;
  }

  let escapedCode = codePart
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const strings: string[] = [];
  const stringRegex = /"([^"\\]|\\.)*"|'([^'\\]|\\.)*'/g;
  escapedCode = escapedCode.replace(stringRegex, (match) => {
    const placeholder = `___STR_PLACEHOLDER_${strings.length}___`;
    strings.push(`<span class="text-[#e6db74]">${match}</span>`);
    return placeholder;
  });

  // Highlight Named Arguments (e.g. pattern =, full.names =)
  escapedCode = escapedCode.replace(/\b([a-zA-Z0-9_\.]+)\s*=(?!=)/g, '<span class="text-[#fd971f] italic">$1</span> =');

  // Highlight Functions: word followed by optional space and '('
  escapedCode = escapedCode.replace(/\b([a-zA-Z0-9_\.]+)(?=\s*\()/g, '<span class="text-[#66d9ef]">$1</span>');

  // Highlight R Constants
  const rConstants = ["TRUE", "FALSE", "NULL", "NA", "NaN", "Inf"];
  rConstants.forEach((constant) => {
    const regex = new RegExp(`\\b(${constant})\\b`, "g");
    escapedCode = escapedCode.replace(regex, '<span class="text-[#ae81ff]">$1</span>');
  });

  // Highlight R Keywords
  const rKeywords = [
    "if", "else", "repeat", "while", "function", "for", "in", "next", "break"
  ];
  rKeywords.forEach((keyword) => {
    const regex = new RegExp(`\\b(${keyword})\\b`, "g");
    escapedCode = escapedCode.replace(regex, '<span class="text-[#f92672] font-semibold">$1</span>');
  });

  // Highlight Assignment Operator and other common operators
  escapedCode = escapedCode.replace(/(&lt;-|&lt;&lt;-|-&gt;)/g, '<span class="text-[#f92672]">$1</span>');
  escapedCode = escapedCode.replace(/(\s)(==|!=|&gt;=|&lt;=)(\s)/g, '$1<span class="text-[#f92672]">$2</span>$3');
  
  // Highlight Numbers
  escapedCode = escapedCode.replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="text-[#ae81ff]">$1</span>');

  strings.forEach((strHtml, index) => {
    escapedCode = escapedCode.replace(`___STR_PLACEHOLDER_${index}___`, strHtml);
  });

  return escapedCode + commentPart;
}

export function highlightRCode(code: string): string {
  const cleanCode = code.replace(/\r/g, "");
  const lines = cleanCode.split("\n");
  return lines.map(highlightRLine).join("\n");
}

interface CodeBlockProps {
  language: string;
  code: string;
  key?: React.Key;
}

function CodeBlock({ language, code }: CodeBlockProps): React.JSX.Element {
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const isBash = language === "bash" || language === "shell" || language === "sh";
  const isR = language.toLowerCase() === "r";

  return (
    <div className="border border-brand-surface-highest bg-[#111827] text-[#f9fafb] rounded-[0.25rem] overflow-hidden font-mono">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-[#0b0f19] font-mono text-[10px]">
        <span className="text-slate-400 font-mono uppercase">{language}</span>
        <button
          onClick={handleCopy}
          className="text-slate-400 hover:text-white flex items-center gap-1 font-mono hover:bg-slate-800/60 px-2 py-1 outline-none transition-all cursor-pointer"
        >
          {copySuccess ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Code</span>
            </>
          )}
        </button>
      </div>
      <div className="p-4 overflow-auto text-xs leading-relaxed max-h-[400px]">
        {isBash ? (
          <pre
            className="font-mono text-left whitespace-pre"
            dangerouslySetInnerHTML={{ __html: highlightBashCode(code) }}
          />
        ) : isR ? (
          <pre
            className="font-mono text-left whitespace-pre"
            dangerouslySetInnerHTML={{ __html: highlightRCode(code) }}
          />
        ) : (
          <pre className="font-mono text-left whitespace-pre">{code}</pre>
        )}
      </div>
    </div>
  );
}

function highlightOutputLine(line: string): string {
  let escaped = line
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  if (escaped.includes("ERROR:")) {
    escaped = escaped.replace(
      /(ERROR:)/g,
      '<span class="bg-[#b91c1c] text-white px-1.5 py-0.5 rounded-sm font-bold mr-1.5">$1</span>'
    );
    return `<span class="text-[#f87171]">${escaped}</span>`;
  }
  return escaped;
}

export function highlightOutputCode(code: string): string {
  const cleanCode = code.replace(/\r/g, "");
  const lines = cleanCode.split("\n");
  return lines.map(highlightOutputLine).join("\n");
}

export function RenderMarkdown({ markdown }: { markdown: string }): React.JSX.Element {
  const blocks = parseMarkdown(markdown);

  return (
    <div className="w-full">
      {blocks.map((block, index) => {
        const blockElement = (() => {
          switch (block.type) {
            case "heading": {
              if (block.level === 2) {
                return (
                  <h2
                    id={slugify(block.text || "")}
                    className="font-sans text-2xl font-medium text-brand-primary scroll-mt-24"
                  >
                    {block.text}
                  </h2>
                );
              }
              return (
                <h3
                  id={slugify(block.text || "")}
                  className="font-sans text-xl font-medium text-brand-primary scroll-mt-24"
                >
                  {block.text}
                </h3>
              );
            }
            case "paragraph":
              return (
                <p className="font-sans text-[14px] leading-relaxed text-justify">
                  {renderInlineStyles(block.text || "")}
                </p>
              );
            case "code": {
              const lang = (block.language || "").toLowerCase().trim();
              const isOutput = lang === "output" || lang === "stdout" || lang === "bash-output";
              const isSimpleOutput = lang === "console" || lang === "terminal" || lang === "raw" || lang === "plain";
              const isCollapsibleOutput = lang === "hidden-output" || lang === "collapsible-output" || lang === "toggle-output";

              if (isCollapsibleOutput) {
                return (
                  <details
                    className="border border-brand-surface-highest bg-brand-surface-low text-brand-on-surface rounded-[0.25rem] overflow-hidden font-mono group"
                  >
                    <summary className="bg-brand-surface-high/60 border-b border-brand-surface-highest px-4 py-1.5 font-mono text-[9px] text-brand-secondary cursor-pointer outline-none hover:bg-brand-surface-high transition-colors flex items-center gap-1.5 list-none [&::-webkit-details-marker]:hidden">
                      <span className="text-[8px] transform group-open:rotate-90 transition-transform duration-200">▶</span>
                      <span>OUTPUT (CLICK TO EXPAND)</span>
                    </summary>
                    <div className="p-4 overflow-auto text-xs leading-relaxed max-h-[300px] bg-brand-surface-lowest/50 border-t border-brand-surface-highest">
                      <pre
                        className="font-mono text-left whitespace-pre text-brand-on-surface-variant"
                        dangerouslySetInnerHTML={{ __html: highlightOutputCode(block.code || "") }}
                      />
                    </div>
                  </details>
                );
              }
              
              if (isOutput) {
                return (
                  <div
                    className="border border-brand-surface-highest bg-brand-surface-low text-brand-on-surface rounded-[0.25rem] overflow-hidden font-mono"
                  >
                    <div className="bg-brand-surface-high/60 border-b border-brand-surface-highest px-4 py-1.5 font-mono text-[9px] text-brand-secondary">
                      OUTPUT
                    </div>
                    <div className="p-4 overflow-auto text-xs leading-relaxed max-h-[300px]">
                      <pre
                        className="font-mono text-left whitespace-pre text-brand-on-surface-variant"
                        dangerouslySetInnerHTML={{ __html: highlightOutputCode(block.code || "") }}
                      />
                    </div>
                  </div>
                );
              }

              if (isSimpleOutput) {
                return (
                  <div
                    className="border border-brand-surface-highest bg-brand-surface-low text-brand-on-surface rounded-[0.25rem] overflow-hidden font-mono"
                  >
                    <div className="p-4 overflow-auto text-xs leading-relaxed max-h-[300px]">
                      <pre
                        className="font-mono text-left whitespace-pre text-brand-on-surface-variant"
                        dangerouslySetInnerHTML={{ __html: highlightOutputCode(block.code || "") }}
                      />
                    </div>
                  </div>
                );
              }

              return (
                <CodeBlock
                  language={block.language || "text"}
                  code={block.code || ""}
                />
              );
            }
            case "quote":
              return (
                <blockquote
                  className="pl-4 border-l-4 border-brand-surface-highest text-brand-on-surface-variant"
                >
                  <p className="font-sans text-[13px] leading-relaxed text-justify">
                    {renderInlineStyles(block.text || "")}
                  </p>
                </blockquote>
              );
            case "image":
              return (
                <figure className="w-full">
                  <div className="w-full bg-brand-surface-low rounded-lg overflow-hidden border border-brand-surface-highest">
                    <img
                      alt={block.alt || ""}
                      className="w-full h-auto object-cover max-h-[500px]"
                      src={block.src}
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  {block.caption && (
                    <figcaption className="mt-2 font-mono text-[10px] text-brand-on-surface-variant tracking-wider uppercase text-center">
                      {block.caption}
                    </figcaption>
                  )}
                </figure>
              );
            case "list":
              if (block.ordered) {
                return (
                  <ol className="list-decimal pl-6 space-y-2 my-3" start={block.start || 1}>
                    {block.items?.map((item, idx) => (
                      <li key={idx} className="font-sans text-[13.5px] leading-relaxed text-justify text-brand-on-surface pl-1">
                        {renderInlineStyles(item)}
                      </li>
                    ))}
                  </ol>
                );
              }
              return (
                <ul className="list-disc pl-6 space-y-2 my-3">
                  {block.items?.map((item, idx) => (
                    <li key={idx} className="font-sans text-[13.5px] leading-relaxed text-justify text-brand-on-surface pl-1">
                      {renderInlineStyles(item)}
                    </li>
                  ))}
                </ul>
              );
            case "hr":
              return <hr className="w-full my-8 border-0 border-t border-brand-surface-highest" />;
            case "details":
              return (
                <details
                  className="border border-brand-surface-highest rounded-[0.25rem] bg-brand-surface-low/20 overflow-hidden"
                >
                  <summary className="font-sans text-sm font-bold text-brand-primary px-4 py-3 cursor-pointer hover:bg-brand-surface-low/50 outline-none transition-colors">
                    {block.text || "View Answer"}
                  </summary>
                  <div className="px-4 pb-4 pt-2 border-t border-brand-surface-highest bg-brand-surface-lowest/50">
                    <RenderMarkdown markdown={block.code || ""} />
                  </div>
                </details>
              );
            case "table": {
              return (
                <div className="w-full my-4 overflow-x-auto border border-brand-surface-highest rounded-[0.25rem] bg-brand-surface-lowest shadow-xs">
                  <table className="w-full text-left border-collapse text-xs sm:text-[13px] font-sans">
                    {block.headers && block.headers.length > 0 && (
                      <thead className="bg-brand-surface-high/60 border-b border-brand-surface-highest">
                        <tr>
                          {block.headers.map((header, hIdx) => {
                            const align = block.aligns?.[hIdx] || "left";
                            return (
                              <th
                                key={hIdx}
                                className={`py-2.5 px-3.5 font-semibold text-brand-primary tracking-wide ${
                                  align === "center"
                                    ? "text-center"
                                    : align === "right"
                                    ? "text-right"
                                    : "text-left"
                                }`}
                              >
                                {renderInlineStyles(header)}
                              </th>
                            );
                          })}
                        </tr>
                      </thead>
                    )}
                    {block.rows && block.rows.length > 0 && (
                      <tbody className="divide-y divide-brand-surface-highest">
                        {block.rows.map((row, rIdx) => (
                          <tr
                            key={rIdx}
                            className="hover:bg-brand-surface-low/30 transition-colors"
                          >
                            {row.map((cell, cIdx) => {
                              const align = block.aligns?.[cIdx] || "left";
                              return (
                                <td
                                  key={cIdx}
                                  className={`py-2 px-3.5 text-brand-on-surface leading-relaxed ${
                                    align === "center"
                                      ? "text-center"
                                      : align === "right"
                                      ? "text-right"
                                      : "text-left"
                                  }`}
                                >
                                  {renderInlineStyles(cell)}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    )}
                  </table>
                </div>
              );
            }
            default:
              return null;
          }
        })();

        if (!blockElement) return null;

        const hasNote = !!block.note;

        let wrapperMargin = "my-3";
        if (block.type === "paragraph") {
          wrapperMargin = "mb-4";
        } else if (block.type === "heading") {
          wrapperMargin = block.level === 2 ? "mt-8 mb-3" : "mt-6 mb-2";
        } else if (block.type === "code") {
          wrapperMargin = "my-4";
        } else if (block.type === "quote") {
          wrapperMargin = "my-4";
        } else if (block.type === "image") {
          wrapperMargin = "my-5";
        } else if (block.type === "list") {
          wrapperMargin = "my-3";
        } else if (block.type === "hr") {
          wrapperMargin = "my-4";
        } else if (block.type === "details") {
          wrapperMargin = "my-4";
        } else if (block.type === "table") {
          wrapperMargin = "my-4";
        }

        return (
          <div key={index} className={`relative group/block w-full ${wrapperMargin}`}>
            {/* Content & Note Wrapper */}
            <div className="relative w-full xl:max-w-[720px]">
              {blockElement}
 
              {/* Note Column (Positioned absolutely on the right on xl screens, static below content on mobile/tablet) */}
              {hasNote && (
                <div
                  style={{
                    transform: block.noteOffset ? `translateY(${block.noteOffset}px)` : undefined
                  }}
                  className="w-full xl:w-56 mt-4 xl:mt-0 bg-sky-50/50 dark:bg-sky-950/20 border-l-2 border-sky-400/70 p-3.5 rounded-r-md text-xs text-brand-on-surface-variant font-sans transition-all xl:absolute xl:left-[calc(100%+40px)] xl:top-0"
                >
                  <div className="font-mono text-[9px] uppercase tracking-wider text-sky-600 dark:text-sky-400 mb-1 font-bold">
                    Note
                  </div>
                  <div className="leading-relaxed text-justify">{renderInlineStyles(block.note || "")}</div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}




