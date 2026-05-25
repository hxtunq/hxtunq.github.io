/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  BookOpen,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  FileText,
  Copy,
  Check,
  Code2,
  Quote
} from "lucide-react";
import { blogPosts } from "../lib/blog-loader";
import { BlogPost } from "../types";

interface BlogViewProps {
  onContactClick: () => void;
  onLinkHighlight?: () => void;
}

interface MarkdownBlock {
  type: 'heading' | 'paragraph' | 'code' | 'quote' | 'image' | 'list';
  level?: number;
  text?: string;
  items?: string[];
  language?: string;
  code?: string;
  src?: string;
  alt?: string;
  caption?: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove Vietnamese accents
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .trim();
}

function parseMarkdown(md: string): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = [];
  const lines = md.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i++;
      continue;
    }

    // Code blocks
    if (line.trim().startsWith('```')) {
      const lang = line.trim().slice(3).trim();
      let code = '';
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        code += lines[i] + '\n';
        i++;
      }
      blocks.push({ type: 'code', language: lang || 'text', code: code.trim() });
      i++; // skip closing ```
      continue;
    }

    // Blockquotes
    if (line.trim().startsWith('>')) {
      let quoteText = '';
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quoteText += lines[i].trim().replace(/^>\s*/, '') + ' ';
        i++;
      }
      blocks.push({ type: 'quote', text: quoteText.trim() });
      continue;
    }

    // Headings
    if (line.trim().startsWith('#')) {
      const match = line.trim().match(/^(#{1,6})\s+(.*)/);
      if (match) {
        blocks.push({
          type: 'heading',
          level: match[1].length,
          text: match[2].trim()
        });
        i++;
        continue;
      }
    }

    // Bullet lists
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      const items: string[] = [];
      while (i < lines.length && (lines[i].trim().startsWith('- ') || lines[i].trim().startsWith('* '))) {
        items.push(lines[i].trim().slice(2).trim());
        i++;
      }
      blocks.push({ type: 'list', items });
      continue;
    }

    // Images
    if (line.trim().startsWith('![') && line.trim().includes('](')) {
      const match = line.trim().match(/^!\[(.*?)\]\((.*?)(?:\s+"(.*?)"\s*)?\)$/);
      if (match) {
        blocks.push({
          type: 'image',
          alt: match[1],
          src: match[2],
          caption: match[3] || ''
        });
        i++;
        continue;
      }
    }

    // Paragraph
    let pText = '';
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().startsWith('#') &&
      !lines[i].trim().startsWith('```') &&
      !lines[i].trim().startsWith('>') &&
      !lines[i].trim().startsWith('- ') &&
      !lines[i].trim().startsWith('* ') &&
      !(lines[i].trim().startsWith('![') && lines[i].trim().includes(']('))
    ) {
      pText += (pText ? ' ' : '') + lines[i].trim();
      i++;
    }
    if (pText.trim()) {
      blocks.push({ type: 'paragraph', text: pText.trim() });
    }
  }

  return blocks;
}

function renderInlineStyles(text: string) {
  const html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`(.*?)`/g, "<code class='font-mono bg-brand-surface-low px-1.5 py-0.5 rounded text-xs text-brand-secondary'>$1</code>");

  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

export default function BlogView({ onContactClick, onLinkHighlight }: BlogViewProps) {
  // State managers
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [activeLanguage, setActiveLanguage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [copyCodeSuccess, setCopyCodeSuccess] = useState(false);

  // Dynamic TOC items based on Markdown content headings (H2)
  const tocItems = useMemo(() => {
    if (!selectedPost || !selectedPost.contentMarkdown) return [];
    const blocks = parseMarkdown(selectedPost.contentMarkdown);
    return blocks
      .filter((b) => b.type === "heading" && b.level === 2)
      .map((b) => ({
        id: slugify(b.text || ""),
        title: b.text || "",
      }));
  }, [selectedPost]);

  const [activeTOCSection, setActiveTOCSection] = useState("");

  // Auto-scroll to top when active post shifts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [selectedPost]);

  // Handle active post detection based on scroll position in detail view
  useEffect(() => {
    if (!selectedPost || tocItems.length === 0) return;

    const handleScroll = () => {
      const scrollPos = window.scrollY + 220; // offset for navbar
      let currentSection = tocItems[0].id;

      for (const item of tocItems) {
        const el = document.getElementById(item.id);
        if (el && scrollPos >= el.offsetTop) {
          currentSection = item.id;
        }
      }
      setActiveTOCSection(currentSection);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // initial check
    return () => window.removeEventListener("scroll", handleScroll);
  }, [selectedPost, tocItems]);

  // Compute stats dynamically
  const categoriesList = useMemo(() => {
    const stats: Record<string, number> = {};
    blogPosts.forEach((post) => {
      const rawCat = post.category || "METHODOLOGY";
      const displayName = rawCat
        .toLowerCase()
        .split(/[\s_]+/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
        .replace(/\bAnd\b/g, "&");
      stats[displayName] = (stats[displayName] || 0) + 1;
    });
    return stats;
  }, []);

  // Compute keywords list dynamically from tags of active blog posts
  const keywordsList = useMemo(() => {
    const tagsSet = new Set<string>();
    blogPosts.forEach((post) => {
      post.tags.forEach((tag) => tagsSet.add(tag));
    });
    return Array.from(tagsSet);
  }, []);

  // Compute languages list dynamically from active blog posts
  const languagesList = useMemo(() => {
    const stats: Record<string, number> = {};
    blogPosts.forEach((post) => {
      const lang = post.language || "English";
      stats[lang] = (stats[lang] || 0) + 1;
    });
    return stats;
  }, []);

  // Perform client-side querying over blog dataset
  const filteredPosts = useMemo(() => {
    return blogPosts.filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.abstract.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.contentMarkdown?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = activeCategory
        ? post.category.toLowerCase().replace(/[\s_]+/g, "") === activeCategory.toLowerCase().replace(/[\s_&]+/g, "")
        : true;

      const matchesTag = activeTag
        ? post.tags.some((tag) => tag.toLowerCase() === activeTag.toLowerCase())
        : true;

      const matchesLanguage = activeLanguage
        ? (post.language || "English").toLowerCase() === activeLanguage.toLowerCase()
        : true;

      return matchesSearch && matchesCategory && matchesTag && matchesLanguage;
    });
  }, [searchQuery, activeCategory, activeTag, activeLanguage]);

  const renderMarkdownContent = (markdown: string) => {
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
                    className="font-serif text-2xl font-bold text-brand-primary mb-4 mt-12 pb-2 border-b border-brand-surface-highest scroll-mt-24"
                  >
                    {block.text}
                  </h2>
                );
              }
              return (
                <h3
                  key={index}
                  id={slugify(block.text || "")}
                  className="font-serif text-xl font-bold text-brand-primary mb-3 mt-8 scroll-mt-24"
                >
                  {block.text}
                </h3>
              );
            }
            case "paragraph":
              return (
                <p key={index} className="font-sans text-[14px] leading-relaxed mb-6">
                  {renderInlineStyles(block.text || "")}
                </p>
              );
            case "code":
              return (
                <div
                  key={index}
                  className="border border-brand-surface-highest bg-[#111827] text-[#f9fafb] rounded-[0.25rem] my-8 overflow-hidden font-mono"
                >
                  <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-[#0b0f19] font-mono text-[10px]">
                    <span className="text-slate-400 font-mono uppercase">{block.language}</span>
                    <button
                      onClick={() => handleCopyCode(block.code || "")}
                      className="text-slate-400 hover:text-white flex items-center gap-1 font-mono hover:bg-slate-800/60 px-2 py-1 outline-none transition-all cursor-pointer"
                    >
                      {copyCodeSuccess ? (
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
                    <pre className="font-mono text-left whitespace-pre">{block.code}</pre>
                  </div>
                </div>
              );
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
  };

  // Pagination bounds (simulate 4 items per page)
  const postsPerPage = 3;
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage) || 1;
  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * postsPerPage;
    return filteredPosts.slice(start, start + postsPerPage);
  }, [filteredPosts, currentPage]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopyCodeSuccess(true);
    setTimeout(() => setCopyCodeSuccess(false), 2000);
  };

  const scrollToSection = (sectionId: string) => {
    setActiveTOCSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {!selectedPost ? (
          /* ==============================================================
             ARCHIVE DIRECTORY VIEW (Image 2 Layout)
             ============================================================== */
          <motion.div
            key="archive-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-container-max mx-auto px-4 md:px-6 py-12"
          >
            <div className="flex flex-col md:flex-row gap-12 relative">
              {/* Left Column: Sidebar Filters & Meta (Width: 280px) */}
              <aside className="w-full md:w-[280px] shrink-0 space-y-8 md:sticky md:top-24 h-fit">
                {/* Visual Accent Title */}
                <div>
                  <h1 className="font-serif text-3.5xl font-bold tracking-tight text-brand-primary mb-3">
                    Archive
                  </h1>
                  <p className="font-sans text-brand-on-surface-variant text-sm leading-relaxed">
                  </p>
                </div>

                {/* Live Search Form */}
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-on-surface-variant/50 w-4.5 h-4.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search posts..."
                    className="w-full bg-brand-surface-low border border-brand-surface-highest focus:border-brand-primary outline-none py-3.5 pl-10 pr-4 text-xs font-sans tracking-wide text-brand-on-surface transition-all placeholder:text-brand-on-surface-variant/40"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-brand-secondary hover:text-brand-primary"
                    >
                      CLEAR
                    </button>
                  )}
                </div>

                {/* Categories filtering links */}
                <div className="space-y-4">
                  <h3 className="font-sans text-[11px] font-bold text-brand-secondary tracking-widest uppercase border-b border-brand-surface-highest pb-2">
                    CATEGORIES
                  </h3>
                  <div className="flex flex-col gap-2">
                    {/* All Categories Option */}
                    <button
                      onClick={() => {
                        setActiveCategory(null);
                        setCurrentPage(1);
                      }}
                      className={`flex justify-between items-center text-left text-xs tracking-wide py-1 border-b border-transparent hover:border-brand-surface-highest group transition-all ${activeCategory === null
                        ? "font-bold text-brand-primary border-brand-primary"
                        : "text-brand-on-surface-variant"
                        }`}
                    >
                      <span className="group-hover:translate-x-0.5 transition-transform">All Posts</span>
                      <span className="font-mono text-[10px] bg-brand-surface-low px-1.5 py-0.5 text-brand-secondary">
                        {blogPosts.length}
                      </span>
                    </button>

                    {Object.entries(categoriesList).map(([catName, count]) => {
                      const isActive = activeCategory?.toLowerCase() === catName.toLowerCase();

                      return (
                        <button
                          key={catName}
                          onClick={() => {
                            setActiveCategory(catName);
                            setCurrentPage(1);
                          }}
                          className={`flex justify-between items-center text-left text-xs tracking-wide py-1 border-b border-transparent hover:border-brand-surface-highest group transition-all cursor-pointer ${isActive
                            ? "font-bold text-brand-primary border-brand-primary"
                            : "text-brand-on-surface-variant"
                            }`}
                        >
                          <span className="group-hover:translate-x-0.5 transition-transform">{catName}</span>
                          <span className="font-mono text-[10px] bg-brand-surface-low px-1.5 py-0.5 text-brand-secondary">
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Keywords Chips */}
                <div className="space-y-4">
                  <h3 className="font-sans text-[11px] font-bold text-brand-secondary tracking-widest uppercase border-b border-brand-surface-highest pb-2">
                    KEYWORDS
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {keywordsList.map((tag) => {
                      const isActive = activeTag?.toLowerCase() === tag.toLowerCase();
                      return (
                        <button
                          key={tag}
                          onClick={() => {
                            setActiveTag(isActive ? null : tag);
                            setCurrentPage(1);
                          }}
                          className={`px-3 py-1.5 border font-mono text-[10px] uppercase transition-all tracking-wider cursor-pointer ${isActive
                            ? "border-brand-primary bg-brand-primary text-white font-bold"
                            : "border-brand-surface-highest hover:border-brand-primary text-brand-on-surface hover:text-brand-primary bg-brand-surface-lowest"
                            }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Language filtering */}
                <div className="space-y-4">
                  <h3 className="font-sans text-[11px] font-bold text-brand-secondary tracking-widest uppercase border-b border-brand-surface-highest pb-2">
                    LANGUAGE
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(languagesList).map(([langName, count]) => {
                      const isActive = activeLanguage?.toLowerCase() === langName.toLowerCase();
                      return (
                        <button
                          key={langName}
                          onClick={() => {
                            setActiveLanguage(isActive ? null : langName);
                            setCurrentPage(1);
                          }}
                          className={`px-3 py-1.5 border font-mono text-[10px] uppercase transition-all tracking-wider cursor-pointer ${isActive
                            ? "border-brand-primary bg-brand-primary text-white font-bold"
                            : "border-brand-surface-highest hover:border-brand-primary text-brand-on-surface hover:text-brand-primary bg-brand-surface-lowest"
                            }`}
                        >
                          {langName} ({count})
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Helper reset prompt */}
                {(activeCategory || activeTag || activeLanguage || searchQuery) && (
                  <button
                    onClick={() => {
                      setActiveCategory(null);
                      setActiveTag(null);
                      setActiveLanguage(null);
                      setSearchQuery("");
                      setCurrentPage(1);
                    }}
                    className="font-mono text-[10px] font-bold tracking-widest uppercase text-brand-primary border border-brand-primary hover:bg-brand-primary hover:text-white transition-all py-2.5 w-full text-center block"
                  >
                    Reset Active Filters
                  </button>
                )}
              </aside>

              {/* Right Column: Listing Items (Reading Width: 720px) */}
              <section className="flex-1 max-w-reading-width space-y-8">
                {/* Highlighted info box */}
                <div className="border border-emerald-100 bg-emerald-500/5 p-4 flex items-center md:items-start gap-3">
                  <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 shrink-0 select-none">
                    FEATURED
                  </span>
                  <p className="font-sans text-xs text-emerald-950">
                    The latest post <strong>"Generative AI in Academic Research Contexts"</strong> is out now. Take a look!
                  </p>
                </div>

                {paginatedPosts.length === 0 ? (
                  <div className="p-12 text-center border border-brand-surface-highest rounded-[0.25rem] bg-brand-surface-low">
                    <BookOpen className="w-8 h-8 mx-auto text-brand-on-surface-variant/40 mb-4" />
                    <p className="font-serif font-bold text-brand-primary text-lg">No Publications Discovered</p>
                    <p className="font-sans text-xs text-brand-on-surface-variant mt-1">Adjust search parameters or keyword filters to browse deeper records.</p>
                  </div>
                ) : (
                  paginatedPosts.map((post) => (
                    <article
                      key={post.id}
                      onClick={() => setSelectedPost(post)}
                      className="group border border-brand-surface-highest p-6 md:p-8 bg-brand-surface-lowest hover:bg-brand-surface-low/30 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between"
                    >
                      {/* Interactive slide-in Accent */}
                      <div className="absolute top-0 left-0 h-full w-1.25 bg-brand-primary transform -translate-x-full group-hover:translate-x-0 transition-transform duration-200"></div>

                      <div>
                        {/* Post Header Row */}
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                          <span className="font-sans text-[10px] font-bold text-brand-secondary tracking-widest uppercase bg-brand-bg md:bg-transparent px-2 md:px-0 py-0.5 md:py-0">
                            {post.category}
                          </span>
                          <span className="font-mono text-[10px] text-brand-on-surface-variant/70">
                            {post.date}
                          </span>
                        </div>

                        {/* Title of Post */}
                        <h2 className="font-serif text-xl sm:text-2xl text-brand-primary font-bold tracking-tight mb-3 group-hover:underline underline-offset-4 decoration-1 decoration-brand-secondary/40 transition-all">
                          {post.title}
                        </h2>

                        {/* Excerpt Text */}
                        <p className="font-sans text-brand-on-surface-variant text-sm leading-relaxed mb-6 line-clamp-3">
                          {post.abstract}
                        </p>
                      </div>

                      {/* Footer tags list */}
                      <div className="flex flex-wrap items-center gap-2 mt-auto">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="font-mono text-[9px] text-brand-on-surface-variant bg-brand-surface-low px-2 py-1"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </article>
                  ))
                )}

                {/* PAGINATION MATRIX CONTROLLER */}
                <div className="flex items-center justify-between border-t border-brand-surface-highest pt-8 mt-12 font-sans text-xs">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="flex items-center gap-2 font-bold tracking-wider uppercase text-brand-secondary hover:text-brand-primary transition-all disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Prev</span>
                  </button>

                  <div className="font-mono text-xs text-brand-on-surface-variant">
                    Page {currentPage} of {totalPages}
                  </div>

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="flex items-center gap-2 font-bold tracking-wider uppercase text-brand-primary hover:opacity-80 transition-all disabled:opacity-40 cursor-pointer"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </section>
            </div>
          </motion.div>
        ) : (
          /* ==============================================================
             DETAILED SCIENTIFIC POST VIEW - BOOKDOWN THEME (Image 1 Layout)
             ============================================================== */
          <motion.div
            key="detail-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-container-max mx-auto px-4 md:px-6 py-12"
          >
            <div className="flex flex-col md:flex-row gap-12 relative">
              {/* BOOKDOWN-STYLE NAVIGATION DRAWER ON DESKTOP (Width: 280px) */}
              <aside className="hidden md:flex flex-col bg-brand-surface-low/40 border border-brand-surface-highest w-full md:w-[280px] shrink-0 p-6 md:sticky md:top-24 h-[calc(100vh-120px)] rounded-[0.25rem] justify-between">
                <div className="space-y-6">
                  {/* Table of Contents Header */}
                  <div className="mb-6 border-b border-brand-surface-highest pb-2">
                    <h2 className="font-sans text-[11px] font-bold text-brand-secondary tracking-widest uppercase">
                      Table of Contents
                    </h2>
                  </div>

                  {/* Interactive Table of Contents */}
                  {tocItems.length > 0 && (
                    <nav className="flex flex-col gap-1 w-full">
                      {tocItems.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => scrollToSection(item.id)}
                          className={`flex items-center gap-3 text-left w-full px-3 py-2 text-xs font-sans font-medium transition-all cursor-pointer ${activeTOCSection === item.id
                              ? "bg-brand-surface-lowest text-brand-primary font-bold border-l-2 border-brand-primary"
                              : "text-brand-on-surface-variant hover:bg-brand-surface-lowest/50"
                            }`}
                        >
                          <span>{item.title}</span>
                        </button>
                      ))}
                    </nav>
                  )}
                </div>

                {/* Sidebar bottom action */}
                <div className="space-y-3 pt-6 border-t border-brand-surface-highest">
                  <button
                    onClick={onContactClick}
                    className="w-full font-sans font-bold text-[9px] tracking-widest uppercase border border-brand-primary py-2 px-3 hover:bg-brand-primary hover:text-white transition-colors"
                  >
                    Download PDF
                  </button>
                  <button
                    onClick={() => setSelectedPost(null)}
                    className="w-full font-sans text-[10px] text-brand-on-surface-variant hover:text-brand-primary flex items-center justify-center gap-1.5 transition-colors py-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    <span>Back to Blog Directory</span>
                  </button>
                </div>
              </aside>

              {/* MAIN ARTICLE READING CANVAS */}
              <div className="flex-1 max-w-reading-width min-w-0">
                <article className="w-full">
                {/* Top Return navigation link on mobile */}
                <div className="md:hidden mb-6">
                  <button
                    onClick={() => setSelectedPost(null)}
                    className="flex items-center gap-1.5 font-sans font-bold text-xs tracking-wider uppercase text-brand-secondary hover:text-brand-primary"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Return to Archive</span>
                  </button>
                </div>

                {/* ARTICLE HEADER CONTAINER */}
                <header className="mb-12">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-mono text-brand-on-surface-variant/70 mb-4 uppercase tracking-wider">
                    <span className="font-bold text-brand-secondary">{selectedPost.category}</span>
                    <span>•</span>
                    <span>{selectedPost.date}</span>
                  </div>
                  <h1 className="font-serif text-3xl sm:text-4.5xl leading-[1.1] text-brand-primary font-bold tracking-tight mb-6">
                    {selectedPost.title}
                  </h1>
                  <p className="font-sans text-brand-on-surface-variant text-base sm:text-lg leading-relaxed font-light mb-6">
                    {selectedPost.abstract}
                  </p>
                  {selectedPost.tags && selectedPost.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedPost.tags.map((tag) => (
                        <span
                          key={tag}
                          className="font-mono text-[10px] text-brand-on-surface-variant/80 bg-brand-surface-low px-2.5 py-1 rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </header>

                {/* FEATURED DIAGRAM CONTAINER (Active if featured, fallback styling otherwise) */}
                {selectedPost.id === "featured-ai" ? (
                  <figure className="mb-12">
                    <div className="w-full aspect-[16/10] sm:h-[400px] bg-[#0c182a] rounded-lg overflow-hidden relative border border-brand-surface-highest">
                      {/* Generates depth overlays */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 to-transparent z-10 pointer-events-none"></div>
                      <img
                        alt="Conceptual visualization of neural network pathways in academic datasets"
                        className="w-full h-full object-cover mix-blend-luminosity opacity-85 hover:scale-101 transition-transform duration-300"
                        src={selectedPost.imageUrl}
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <figcaption className="mt-4 font-mono text-[10px] text-brand-on-surface-variant tracking-wider uppercase text-center">
                      {selectedPost.caption}
                    </figcaption>
                  </figure>
                ) : (
                  <div className="h-[2px] bg-brand-surface-highest mb-12"></div>
                )}

                {/* DETAILED CONTENT SECTIONS */}
                {selectedPost.contentMarkdown ? (
                  renderMarkdownContent(selectedPost.contentMarkdown)
                ) : (
                  <div className="prose prose-slate max-w-none text-sm leading-relaxed text-brand-on-surface font-sans">
                    <p>No content available.</p>
                  </div>
                )}


              </article>
            </div>
          </div>
        </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
