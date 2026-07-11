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
import { BlogPost } from "../types";
import { slugify, parseMarkdown, renderInlineStyles, RenderMarkdown } from "../lib/markdown";

interface BlogViewProps {
  currentPath: string;
  navigate: (path: string) => void;
  onContactClick: () => void;
  onLinkHighlight?: () => void;
}

export default function BlogView({ currentPath, navigate, onContactClick, onLinkHighlight }: BlogViewProps) {
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



  // Pagination bounds (simulate 4 items per page)
  const postsPerPage = 3;
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage) || 1;
  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * postsPerPage;
    return filteredPosts.slice(start, start + postsPerPage);
  }, [filteredPosts, currentPage]);



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
                    className="font-mono text-[10px] font-bold tracking-widest uppercase text-brand-accent border border-brand-accent hover:bg-brand-accent hover:text-brand-accent-ink transition-all py-2.5 w-full text-center block"
                  >
                    Reset Active Filters
                  </button>
                )}
              </aside>

              {/* Right Column: Listing Items (Reading Width: 720px) */}
              <section className="flex-1 max-w-reading-width space-y-8">
                {/* Highlighted info box */}
                <div className="border border-amber-100 bg-amber-500/5 p-4 flex items-center md:items-start gap-3">
                  <span className="font-mono text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 shrink-0 select-none">
                    NOTICE
                  </span>
                  <p className="font-sans text-xs text-amber-950">
                    This website is currently under construction. Some details may be incomplete or inaccurate. Thank you for your patience!
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
                      onClick={() => navigate(`/post/${post.id}`)}
                      className="group border border-brand-surface-highest p-6 md:p-8 bg-brand-surface-lowest hover:bg-brand-surface-low/30 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between"
                    >
                      {/* Interactive slide-in Accent */}
                      <div className="absolute top-0 left-0 h-full w-1.25 bg-brand-accent transform -translate-x-full group-hover:translate-x-0 transition-transform duration-200"></div>

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
                        <h2 className="font-sans text-xl sm:text-2xl text-brand-primary font-bold tracking-tight mb-3 group-hover:underline underline-offset-4 decoration-1 decoration-brand-secondary/40 transition-all">
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
                <div className="space-y-3 pt-6 border-t border-brand-surface-highest">
                  <button
                    onClick={onContactClick}
                    className="w-full font-sans font-bold text-[9px] tracking-widest uppercase border border-brand-accent text-brand-accent py-2 px-3 hover:bg-brand-accent hover:text-brand-accent-ink transition-colors"
                  >
                    Download PDF
                  </button>
                  <button
                    onClick={() => navigate("/blog")}
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
                    onClick={() => navigate("/blog")}
                    className="flex items-center gap-1.5 font-sans font-bold text-xs tracking-wider uppercase text-brand-secondary hover:text-brand-primary"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Return to Blog</span>
                  </button>
                </div>

                {/* ARTICLE HEADER CONTAINER */}
                <header className="mb-12">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-mono text-brand-on-surface-variant/70 mb-4 uppercase tracking-wider">
                    <span className="font-bold text-brand-secondary">{selectedPost.category}</span>
                    <span>•</span>
                    <span>{selectedPost.date}</span>
                  </div>
                  <h1 className="font-sans text-3xl sm:text-4.5xl leading-[1.1] text-brand-primary font-bold tracking-tight mb-6">
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
                  <RenderMarkdown markdown={selectedPost.contentMarkdown} />
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
