/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import React, { useState } from "react";
import { Check, Copy } from "lucide-react";

export interface MarkdownBlock {
  type: "heading" | "paragraph" | "code" | "quote" | "image" | "list";
  level?: number;
  text?: string;
  items?: string[];
  language?: string;
  code?: string;
  src?: string;
  alt?: string;
  caption?: string;
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
        i++;
        continue;
      }
    }

    // Bullet lists
    if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
      const items: string[] = [];
      while (
        i < lines.length &&
        (lines[i].trim().startsWith("- ") || lines[i].trim().startsWith("* "))
      ) {
        items.push(lines[i].trim().slice(2).trim());
        i++;
      }
      blocks.push({ type: "list", items });
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
      !(lines[i].trim().startsWith("![") && lines[i].trim().includes("]("))
    ) {
      pText += (pText ? " " : "") + lines[i].trim();
      i++;
    }
    if (pText.trim()) {
      blocks.push({ type: "paragraph", text: pText.trim() });
    }
  }

  return blocks;
}

export function renderInlineStyles(text: string): React.JSX.Element {
  const html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(
      /`(.*?)`/g,
      "<code class='font-mono bg-brand-surface-low px-1.5 py-0.5 rounded text-xs text-brand-secondary'>$1</code>"
    )
    // Markdown links: [text](url)
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
      "<a href='$2' target='_blank' rel='noopener noreferrer' class='text-blue-600 hover:text-blue-800 underline underline-offset-2 decoration-blue-400/50 transition-colors'>$1</a>"
    )
    // Bare URLs: (https://...) or https://... standalone
    .replace(
      /\((https?:\/\/[^\s)]+)\)/g,
      "(<a href='$1' target='_blank' rel='noopener noreferrer' class='text-blue-600 hover:text-blue-800 underline underline-offset-2 decoration-blue-400/50 transition-colors'>$1</a>)"
    );

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

  escapedCode = escapedCode.replace(/(&quot;)(.*?)(&quot;)/g, '<span class="text-emerald-400">$1$2$3</span>');
  escapedCode = escapedCode.replace(/(')(.*?)(')/g, '<span class="text-emerald-400">$1$2$3</span>');

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

  return escapedCode + commentPart;
}

export function highlightBashCode(code: string): string {
  const lines = code.split("\n");
  return lines.map(highlightBashLine).join("\n");
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

  return (
    <div className="border border-brand-surface-highest bg-[#111827] text-[#f9fafb] rounded-[0.25rem] my-6 overflow-hidden font-mono">
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
      <div className="p-4 overflow-x-auto text-xs leading-relaxed max-h-[400px]">
        {isBash ? (
          <pre
            className="font-mono text-left whitespace-pre"
            dangerouslySetInnerHTML={{ __html: highlightBashCode(code) }}
          />
        ) : (
          <pre className="font-mono text-left whitespace-pre">{code}</pre>
        )}
      </div>
    </div>
  );
}

export function RenderMarkdown({ markdown }: { markdown: string }): React.JSX.Element {
  const blocks = parseMarkdown(markdown);

  return (
    <div className="prose prose-slate max-w-none text-sm leading-relaxed text-brand-on-surface font-sans">
      {blocks.map((block, index) => {
        switch (block.type) {
          case "heading": {
            if (block.level === 2) {
              return (
                <h2
                  key={index}
                  id={slugify(block.text || "")}
                  className="font-sans text-2xl font-medium text-brand-primary mb-4 mt-12 scroll-mt-24"
                >
                  {block.text}
                </h2>
              );
            }
            return (
              <h3
                key={index}
                id={slugify(block.text || "")}
                className="font-sans text-xl font-medium text-brand-primary mb-3 mt-8 scroll-mt-24"
              >
                {block.text}
              </h3>
            );
          }
          case "paragraph":
            return (
              <p key={index} className="font-sans text-[15px] leading-relaxed mb-6">
                {renderInlineStyles(block.text || "")}
              </p>
            );
          case "code": {
            const isOutput = block.language === "output" || block.language === "stdout" || block.language === "bash-output";
            if (isOutput) {
              return (
                <div
                  key={index}
                  className="border border-brand-surface-highest bg-brand-surface-low text-brand-on-surface rounded-[0.25rem] my-6 overflow-hidden font-mono"
                >
                  <div className="bg-brand-surface-high/60 border-b border-brand-surface-highest px-4 py-1.5 font-mono text-[9px] text-brand-secondary select-none">
                    OUTPUT
                  </div>
                  <div className="p-4 overflow-x-auto text-xs leading-relaxed max-h-[300px]">
                    <pre className="font-mono text-left whitespace-pre text-brand-on-surface-variant">{block.code}</pre>
                  </div>
                </div>
              );
            }

            return (
              <CodeBlock
                key={index}
                language={block.language || "text"}
                code={block.code || ""}
              />
            );
          }
          case "quote":
            return (
              <blockquote
                key={index}
                className="my-8 pl-6 pr-6 py-4 border-l-4 border-brand-secondary bg-brand-surface-low/60 rounded-r-md"
              >
                <p className="font-serif italic text-base sm:text-lg text-brand-on-surface leading-relaxed font-medium">
                  {block.text}
                </p>
              </blockquote>
            );
          case "image":
            return (
              <figure key={index} className="my-8">
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
            return (
              <ul key={index} className="list-disc pl-5 my-4 space-y-2 mb-6">
                {block.items?.map((item, idx) => (
                  <li key={idx} className="font-sans text-[14px] leading-relaxed">
                    {renderInlineStyles(item)}
                  </li>
                ))}
              </ul>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
