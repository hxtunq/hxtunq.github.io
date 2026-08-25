/**
 * @license
 * SPDX-License-Identifier: MIT
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
import { slugify, parseMarkdown, renderInlineStyles, RenderMarkdown } from "../lib/markdown";
import CommentSection from "./CommentSection";

interface BlogViewProps {
  currentPath: string;
  navigate: (path: string) => void;
  onContactClick: () => void;
  onLinkHighlight?: () => void;
}

export default function BlogView({
  currentPath,
  navigate,
  onContactClick,
  onLinkHighlight
}: BlogViewProps) {
  // State managers
  const selectedPost = useMemo(() => {
    const cleanPath = currentPath.replace(/^\/+|\/+$/g, "");
    if (cleanPath.startsWith("post/")) {
      const postId = cleanPath.substring("post/".length);
      return blogPosts.find((p) => p.id === postId) || null;
    }
    return null;
  }, [currentPath]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [activeLanguage, setActiveLanguage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  // copyCodeSuccess state is now handled internally in RenderMarkdown

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

  // Smooth scroll to a specific heading section
  const scrollToSection = (id: string) => {
    setActiveTOCSection(id);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -90; // offset for fixed header
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  // Auto-scroll to top when active post shifts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (tocItems.length > 0) {
      setActiveTOCSection(tocItems[0].id);
    }
  }, [selectedPost, tocItems]);

  // Handle active heading detection based on scroll position in detail view
  useEffect(() => {
    if (!selectedPost || tocItems.length === 0) return;

    const handleScroll = () => {
      const headerThreshold = 140; // pixel offset from viewport top
      let currentSection = tocItems[0].id;

      for (const item of tocItems) {
        const el = document.getElementById(item.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= headerThreshold) {
            currentSection = item.id;
          }
        }
      }
      setActiveTOCSection(currentSection);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    const timer = setTimeout(handleScroll, 60);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timer);
    };
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



  // Pagination bounds (6 items per page)
  const postsPerPage = 6;
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage) || 1;
  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * postsPerPage;
    return filteredPosts.slice(start, start + postsPerPage);
  }, [filteredPosts, currentPage]);





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
            <div className="flex flex-col md:flex-row gap-6 lg:gap-8 relative">
              {/* Left Column: Sidebar Filters (Flushed to left, compact width: 240px) */}
              <aside className="w-full md:w-[240px] shrink-0 space-y-6 md:sticky md:top-24 h-fit">


                {/* Live Search Form */}
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-on-surface-variant/50 w-4 h-4" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search posts..."
                    className="w-full bg-brand-surface-low border border-brand-surface-highest focus:border-brand-primary outline-none py-2.5 pl-9 pr-4 text-xs font-sans tracking-wide text-brand-on-surface transition-all placeholder:text-brand-on-surface-variant/40"
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
                <div className="space-y-3">
                  <h3 className="font-sans text-[10.5px] font-bold text-brand-secondary tracking-widest uppercase border-b border-brand-surface-highest pb-1.5">
                    CATEGORIES
                  </h3>
                  <div className="flex flex-col gap-1.5">
                    {/* All Categories Option */}
                    <button
                      onClick={() => {
                        setActiveCategory(null);
                        setCurrentPage(1);
                      }}
                      className={`flex justify-between items-center text-left text-xs tracking-wide py-0.5 group transition-all cursor-pointer ${activeCategory === null
                        ? "font-bold text-brand-primary"
                        : "text-brand-on-surface-variant hover:text-brand-primary"
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
                          className={`flex justify-between items-center text-left text-xs tracking-wide py-0.5 group transition-all cursor-pointer ${isActive
                            ? "font-bold text-brand-primary"
                            : "text-brand-on-surface-variant hover:text-brand-primary"
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
                <div className="space-y-3">
                  <h3 className="font-sans text-[10.5px] font-bold text-brand-secondary tracking-widest uppercase border-b border-brand-surface-highest pb-1.5">
                    KEYWORDS
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {keywordsList.map((tag) => {
                      const isActive = activeTag?.toLowerCase() === tag.toLowerCase();
                      return (
                        <button
                          key={tag}
                          onClick={() => {
                            setActiveTag(isActive ? null : tag);
                            setCurrentPage(1);
                          }}
                          className={`px-2.5 py-1 border font-mono text-[9.5px] uppercase transition-all tracking-wider cursor-pointer ${isActive
                            ? "border-brand-accent bg-brand-accent text-brand-accent-ink font-bold"
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
                {Object.keys(languagesList).length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-sans text-[10.5px] font-bold text-brand-secondary tracking-widest uppercase border-b border-brand-surface-highest pb-1.5">
                      LANGUAGE
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(languagesList).map(([langName, count]) => {
                        const isActive = activeLanguage?.toLowerCase() === langName.toLowerCase();
                        return (
                          <button
                            key={langName}
                            onClick={() => {
                              setActiveLanguage(isActive ? null : langName);
                              setCurrentPage(1);
                            }}
                            className={`px-2.5 py-1 border font-mono text-[9.5px] uppercase transition-all tracking-wider cursor-pointer ${isActive
                              ? "border-brand-accent bg-brand-accent text-brand-accent-ink font-bold"
                              : "border-brand-surface-highest hover:border-brand-primary text-brand-on-surface hover:text-brand-primary bg-brand-surface-lowest"
                              }`}
                          >
                            {langName} ({count})
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

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
                    className="font-mono text-[10px] font-bold tracking-widest uppercase text-brand-accent border border-brand-accent hover:bg-brand-accent hover:text-brand-accent-ink transition-all py-2 w-full text-center block cursor-pointer"
                  >
                    Reset Active Filters
                  </button>
                )}
              </aside>

              {/* Right Column: Listing Items */}
              <section className="flex-1 min-w-0 space-y-3.5">
                {/* Highlighted info box */}
                <div className="border border-amber-200 dark:border-amber-900/40 bg-amber-500/5 dark:bg-amber-500/10 p-3 flex items-center md:items-start gap-2.5 rounded-[0.25rem]">
                  <span className="font-mono text-[10px] font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-1.5 py-0.5 shrink-0 select-none">
                    NOTICE
                  </span>
                  <p className="font-sans text-xs text-amber-950 dark:text-amber-200">
                    This website is currently under construction. Some details may be incomplete. Thank you for your patience!
                  </p>
                </div>

                {paginatedPosts.length === 0 ? (
                  <div className="p-10 text-center border border-brand-surface-highest rounded-[0.25rem] bg-brand-surface-low">
                    <BookOpen className="w-7 h-7 mx-auto text-brand-on-surface-variant/40 mb-3" />
                    <p className="font-sans font-bold text-brand-primary text-base">No Publications Discovered</p>
                    <p className="font-sans text-xs text-brand-on-surface-variant mt-1">Adjust search parameters or keyword filters to browse deeper records.</p>
                  </div>
                ) : (
                  paginatedPosts.map((post) => (
                    <article
                      key={post.id}
                      onClick={() => navigate(`/post/${post.id}`)}
                      className="group border border-brand-surface-highest p-4 sm:p-5 bg-brand-surface-lowest hover:bg-brand-surface-low/30 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between gap-2 rounded-[0.25rem] shadow-xs"
                    >
                      {/* Interactive slide-in Accent */}
                      <div className="absolute top-0 left-0 h-full w-1 bg-brand-accent transform -translate-x-full group-hover:translate-x-0 transition-transform duration-200" />

                      <div>
                        {/* Header Row: Category & Date (Left) + Clean Borderless Tags (Right) */}
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2 text-[10.5px] font-mono text-brand-on-surface-variant/70">
                            <span className="font-sans font-bold text-brand-secondary tracking-wider uppercase">
                              {post.category}
                            </span>
                            <span>•</span>
                            <span>{post.date}</span>
                          </div>

                          {/* Top-Right Borderless Clean Tags */}
                          {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap items-center gap-2">
                              {post.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="font-mono text-[10px] sm:text-[10.5px] text-brand-secondary/80 group-hover:text-brand-secondary transition-colors"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Title of Post */}
                        <h2 className="font-sans text-[15.5px] sm:text-[17px] text-brand-primary font-bold tracking-tight mb-1.5 group-hover:text-brand-accent transition-colors leading-snug">
                          {post.title}
                        </h2>

                        {/* Excerpt Text */}
                        {post.abstract && (
                          <p className="font-sans text-brand-on-surface-variant text-[12.5px] sm:text-[13px] leading-relaxed line-clamp-2">
                            {post.abstract}
                          </p>
                        )}
                      </div>
                    </article>
                  ))
                )}

                {/* PAGINATION MATRIX CONTROLLER */}
                <div className="flex items-center justify-between border-t border-brand-surface-highest pt-6 mt-8 font-sans text-xs">
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
              <aside className="hidden md:flex flex-col bg-brand-surface-low/40 border border-brand-surface-highest w-full md:w-[280px] shrink-0 p-6 md:sticky md:top-24 h-fit max-h-[70vh] rounded-[0.25rem] gap-6 overflow-y-auto scrollbar-subtle">
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
                <div className="pt-6 border-t border-brand-surface-highest">
                  <button
                    onClick={() => navigate("/blog")}
                    className="w-full font-sans text-[10px] text-brand-on-surface-variant hover:text-brand-primary flex items-center justify-center gap-1.5 transition-colors py-1.5 cursor-pointer"
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
                      onClick={() => navigate("/blog")}
                      className="flex items-center gap-1.5 font-sans font-bold text-xs tracking-wider uppercase text-brand-secondary hover:text-brand-primary"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Return to Blog</span>
                    </button>
                  </div>

                  {/* ARTICLE HEADER CONTAINER */}
                  <header className="mb-6">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-brand-on-surface-variant/70 mb-6 tracking-wider">
                      <div className="flex items-center gap-2">
                        <span className="font-sans font-bold text-brand-secondary uppercase">{selectedPost.category}</span>
                        <span>•</span>
                        <span>{selectedPost.date}</span>
                      </div>

                      {/* Top-Right Borderless Clean Tags (Matching Card Style) */}
                      {selectedPost.tags && selectedPost.tags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2">
                          {selectedPost.tags.map((tag) => (
                            <span
                              key={tag}
                              className="font-mono text-[10.5px] sm:text-[11px] text-brand-secondary/80"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <h1 className="font-sans text-xl sm:text-2xl leading-snug text-brand-primary font-bold tracking-tight mb-3.5">
                      {selectedPost.title}
                    </h1>
                    <p className="font-sans text-brand-on-surface-variant text-sm leading-relaxed font-light">
                      {selectedPost.abstract}
                    </p>
                  </header>

                  {/* FEATURED DIAGRAM CONTAINER (Active if featured, fallback styling otherwise) */}
                  {selectedPost.id === "featured-ai" ? (
                    <figure className="mb-6">
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
                      <figcaption className="mt-3 font-mono text-[10px] text-brand-on-surface-variant tracking-wider uppercase text-center">
                        {selectedPost.caption}
                      </figcaption>
                    </figure>
                  ) : (
                    <div className="h-[1.5px] bg-brand-surface-highest mb-6"></div>
                  )}

                  {/* DETAILED CONTENT SECTIONS */}
                  {selectedPost.contentMarkdown ? (
                    <RenderMarkdown markdown={selectedPost.contentMarkdown} />
                  ) : (
                    <div className="prose prose-slate max-w-none text-sm leading-relaxed text-brand-on-surface font-sans">
                      <p>No content available.</p>
                    </div>
                  )}

                  {/* SUPABASE DISCUSSION & COMMENTS */}
                  <CommentSection
                    postId={selectedPost.id}
                    postTitle={selectedPost.title}
                  />

                </article>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
