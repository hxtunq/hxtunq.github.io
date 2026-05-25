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

export default function BlogView({ onContactClick, onLinkHighlight }: BlogViewProps) {
  // State managers
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [copyCodeSuccess, setCopyCodeSuccess] = useState(false);
  
  // Bookdown TOC active section tracking
  const [activeTOCSection, setActiveTOCSection] = useState("introduction");

  // Element reference pointers for scrolling simulation in detail view
  const introRef = useRef<HTMLDivElement>(null);
  const methodRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to top when active post shifts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [selectedPost]);

  // Handle active post detection based on scroll position in detail view
  useEffect(() => {
    if (!selectedPost) return;

    const handleScroll = () => {
      const scrollPos = window.scrollY + 200;
      
      if (resultsRef.current && scrollPos >= resultsRef.current.offsetTop) {
        setActiveTOCSection("results");
      } else if (methodRef.current && scrollPos >= methodRef.current.offsetTop) {
        setActiveTOCSection("methodology");
      } else {
        setActiveTOCSection("introduction");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [selectedPost]);

  // Compute stats dynamically
  const categoriesList = useMemo(() => {
    const stats: Record<string, number> = {
      "Methodology": 24,
      "Data Visualization": 18,
      "Machine Learning": 12,
      "Theory & Ethics": 9
    };
    return stats;
  }, []);

  const keywordsList = ["R", "Python", "ggplot2", "Bayesian", "Causal Inference", "Networks"];

  // Perform client-side querying over blog dataset
  const filteredPosts = useMemo(() => {
    return blogPosts.filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.abstract.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.contentMarkdown?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = activeCategory
        ? post.category.toLowerCase() === activeCategory.toLowerCase()
        : true;

      const matchesTag = activeTag
        ? post.tags.some((tag) => tag.toLowerCase() === activeTag.toLowerCase())
        : true;

      return matchesSearch && matchesCategory && matchesTag;
    });
  }, [searchQuery, activeCategory, activeTag]);

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

  const scrollToSection = (section: string) => {
    setActiveTOCSection(section);
    let targetRef;
    if (section === "introduction") targetRef = introRef;
    if (section === "methodology") targetRef = methodRef;
    if (section === "results") targetRef = resultsRef;

    if (targetRef?.current) {
      targetRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
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
                    Exploring methodology, data analysis, and peer-reviewed insights.
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
                    placeholder="Search publications..."
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
                      className={`flex justify-between items-center text-left text-xs tracking-wide py-1 border-b border-transparent hover:border-brand-surface-highest group transition-all ${
                        activeCategory === null
                          ? "font-bold text-brand-primary border-brand-primary"
                          : "text-brand-on-surface-variant"
                      }`}
                    >
                      <span className="group-hover:translate-x-0.5 transition-transform">All Academic Papers</span>
                      <span className="font-mono text-[10px] bg-brand-surface-low px-1.5 py-0.5 text-brand-secondary">
                        {blogPosts.length}
                      </span>
                    </button>

                    {Object.entries(categoriesList).map(([catName, fallbackCount]) => {
                      // Dynamically count posts belonging to category
                      const count = blogPosts.filter(
                        (p) => p.category.toLowerCase() === catName.toLowerCase()
                      ).length;

                      const isActive = activeCategory?.toLowerCase() === catName.toLowerCase();

                      return (
                        <button
                          key={catName}
                          onClick={() => {
                            setActiveCategory(catName);
                            setCurrentPage(1);
                          }}
                          className={`flex justify-between items-center text-left text-xs tracking-wide py-1 border-b border-transparent hover:border-brand-surface-highest group transition-all cursor-pointer ${
                            isActive
                              ? "font-bold text-brand-primary border-brand-primary"
                              : "text-brand-on-surface-variant"
                          }`}
                        >
                          <span className="group-hover:translate-x-0.5 transition-transform">{catName}</span>
                          <span className="font-mono text-[10px] bg-brand-surface-low px-1.5 py-0.5 text-brand-secondary">
                            {count || fallbackCount}
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
                          className={`px-3 py-1.5 border font-mono text-[10px] uppercase transition-all tracking-wider cursor-pointer ${
                            isActive
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

                {/* Helper reset prompt */}
                {(activeCategory || activeTag || searchQuery) && (
                  <button
                    onClick={() => {
                      setActiveCategory(null);
                      setActiveTag(null);
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
                    The latest research preprint <strong>"Generative AI in Academic Research Contexts"</strong> is loaded into the interactive Bookdown detail module. Click on it to inspect mathematical notes, blockquotes, and Figure 1 networks.
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
            className="w-full"
          >
            {/* BOOKDOWN-STYLE NAVIGATION DRAWER ON DESKTOP (Width: 280px) */}
            <aside className="hidden md:flex flex-col bg-brand-surface-low border-r border-brand-surface-highest fixed left-0 top-0 h-screen w-[280px] z-40 pt-[90px] px-6 pb-8 justify-between">
              <div className="space-y-6">
                {/* Meta details */}
                <div className="mb-6">
                  <h2 className="font-serif font-bold text-lg text-brand-primary leading-tight">
                    {selectedPost.id === "featured-ai" ? "Research Publication" : "Archived Section"}
                  </h2>
                  <span className="font-mono text-[9px] tracking-wider text-brand-on-surface-variant inline-block mt-1 uppercase bg-brand-surface-highest/60 px-2 py-0.5">
                    {selectedPost.id === "featured-ai" ? "v1.0.4" : "REV 2026.04"}
                  </span>
                </div>

                {/* Interactive Table of Contents */}
                <nav className="flex flex-col gap-1 w-full">
                  <button
                    onClick={() => scrollToSection("introduction")}
                    className={`flex items-center gap-3 text-left w-full px-3 py-2 text-xs font-sans font-medium transition-all cursor-pointer ${
                      activeTOCSection === "introduction"
                        ? "bg-brand-surface-lowest text-brand-primary font-bold border-l-2 border-brand-primary"
                        : "text-brand-on-surface-variant hover:bg-brand-surface-lowest/50"
                    }`}
                  >
                    <span>Introduction</span>
                  </button>

                  <button
                    onClick={() => scrollToSection("methodology")}
                    className={`flex items-center gap-3 text-left w-full px-3 py-2 text-xs font-sans font-medium transition-all cursor-pointer ${
                      activeTOCSection === "methodology"
                        ? "bg-brand-surface-lowest text-brand-primary font-bold border-l-2 border-brand-primary"
                        : "text-brand-on-surface-variant hover:bg-brand-surface-lowest/50"
                    }`}
                  >
                    <span>Methodology</span>
                  </button>

                  <button
                    onClick={() => scrollToSection("results")}
                    className={`flex items-center gap-3 text-left w-full px-3 py-2 text-xs font-sans font-medium transition-all cursor-pointer ${
                      activeTOCSection === "results"
                        ? "bg-brand-surface-lowest text-brand-primary font-bold border-l-2 border-brand-primary"
                        : "text-brand-on-surface-variant hover:bg-brand-surface-lowest/50"
                    }`}
                  >
                    <span>Results</span>
                  </button>
                </nav>
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
                  <span>Archive View</span>
                </button>
              </div>
            </aside>

            {/* MAIN ARTICLE READING CANVAS */}
            <div className="md:ml-[280px] pt-8 pb-20 px-4 md:px-12 flex flex-col items-center">
              <article className="w-full max-w-reading-width">
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

                {/* Back Link on Desktop (Optional but extremely high workflow value) */}
                <div className="hidden md:block mb-8">
                  <button
                    onClick={() => setSelectedPost(null)}
                    className="group flex items-center gap-2 font-sans font-bold text-[10px] tracking-wider uppercase text-brand-secondary hover:text-brand-primary border-b border-transparent hover:border-brand-primary/40 pb-0.5 transition-all"
                  >
                    <ArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
                    <span>Back to Publication Directory</span>
                  </button>
                </div>

                {/* YAML-STYLE METADATA DISPLAY WINDOW (Image 1 Accent) */}
                <div className="border border-brand-surface-highest bg-brand-surface-low p-6 mb-12 font-mono text-xs text-brand-on-surface-variant overflow-x-auto relative">
                  <div className="absolute top-2 right-4 text-[9px] uppercase tracking-wider text-brand-on-surface-variant/40 font-mono select-none">
                    YAML_HEADER
                  </div>
                  <pre className="whitespace-pre m-0 leading-relaxed font-mono">
                    {selectedPost.yamlHeader || `---
title: "${selectedPost.title}"
date: "${selectedPost.date}"
author: "Dr. E. Sterling"
tags: [${selectedPost.tags.join(", ")}]
status: "Published"
---`}
                  </pre>
                </div>

                {/* ARTICLE HEADER CONTAINER */}
                <header className="mb-12">
                  <h1 className="font-serif text-3xl sm:text-4.5xl leading-[1.1] text-brand-primary font-bold tracking-tight mb-6">
                    {selectedPost.title}
                  </h1>
                  <p className="font-sans text-brand-on-surface-variant text-base sm:text-lg leading-relaxed font-light">
                    {selectedPost.abstract}
                  </p>
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
                <div className="prose prose-slate max-w-none text-sm leading-relaxed text-brand-on-surface font-sans">
                  {/* Dynamic render of content sections simulating Image 1 */}
                  <div ref={introRef} id="introduction" className="mb-12 scroll-mt-20">
                    <h2 className="font-serif text-2xl font-bold text-brand-primary mb-4 pb-2 border-b border-brand-surface-highest">
                      Introduction
                    </h2>
                    <p className="font-sans text-[14px] leading-relaxed mb-6 gap-y-4">
                      The integration of Generative Artificial Intelligence (GenAI) into academic research workflows represents a paradigm shift comparable to the advent of digital databases. While the acceleration of initial literature discovery and data structuring is undeniable, the epistemic reliance on black-box models introduces significant challenges to traditional methodologies.
                    </p>
                    <p className="font-sans text-[14px] leading-relaxed mb-6">
                      In this paper, we establish a theoretical framework for assessing the utility of GenAI tools while strictly bounding their application to prevent the erosion of critical analysis and original thought.
                    </p>
                  </div>

                  {/* METHODOLOGY SECTION (Featuring Blockquote and Custom Code Blocks) */}
                  <div ref={methodRef} id="methodology" className="mb-12 scroll-mt-20">
                    <h2 className="font-serif text-2xl font-bold text-brand-primary mb-4 pb-2 border-b border-brand-surface-highest">
                      Methodology
                    </h2>
                    <p className="font-sans text-[14px] leading-relaxed mb-6">
                      Our approach utilizes a mixed-methods design, surveying 450 active researchers across STEM and Humanities disciplines regarding their current GenAI integration practices. This quantitative data is contextualized through 25 semi-structured interviews focusing on the perceived impact on academic rigor.
                    </p>

                    {/* Styled quotes block exactly matching Image 1 layout */}
                    <blockquote className="border-l-4 border-brand-secondary bg-brand-surface-low p-5 my-8 rounded-r-none relative">
                      <Quote className="absolute top-2 right-4 w-10 h-10 text-brand-secondary/10 pointer-events-none" />
                      <p className="font-serif italic text-base text-brand-secondary leading-relaxed mb-2 font-medium">
                        "{selectedPost.quote || "The tool does not think; it predicts. The danger arises when the researcher conflates the eloquence of the output with the validity of the underlying logic."}"
                      </p>
                      <cite className="block font-mono text-[10px] tracking-widest text-brand-on-surface-variant font-bold uppercase not-italic">
                        — {selectedPost.quoteAuthor || "Interviewee #14"}
                      </cite>
                    </blockquote>

                    <p className="font-sans text-[14px] leading-relaxed mb-6">
                      Data cleaning and preliminary thematic clustering were performed using Python, specifically leveraging the pandas and scikit-learn libraries to handle the qualitative text responses before human-in-the-loop verification.
                    </p>

                    {/* Embedded Code block mockup corresponding to the Python code snippet */}
                    {selectedPost.detailedCodeBlock && (
                      <div ref={codeRef} className="border border-brand-surface-highest bg-[#111827] text-[#f9fafb] rounded-[0.25rem] my-8 overflow-hidden font-mono">
                        {/* Title header bar */}
                        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-[#0b0f19] font-mono text-[10px]">
                          <span className="text-slate-400 font-mono">thematic_extraction.py</span>
                          <button
                            onClick={() => handleCopyCode(selectedPost.detailedCodeBlock!)}
                            className="text-slate-400 hover:text-white flex items-center gap-1 font-mono hover:bg-slate-800/60 px-2 py-1 outline-none transition-all"
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
                        {/* Source code */}
                        <div className="p-4 overflow-x-auto text-xs leading-relaxed max-h-[300px]">
                          <pre className="font-mono text-left whitespace-pre">
                            {selectedPost.detailedCodeBlock}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* RESULTS SECTION */}
                  <div ref={resultsRef} id="results" className="mb-12 scroll-mt-20">
                    <h2 className="font-serif text-2xl font-bold text-brand-primary mb-4 pb-2 border-b border-brand-surface-highest">
                      Results
                    </h2>
                    <p className="font-sans text-[14px] leading-relaxed mb-6">
                      Preliminary findings indicate a stark disciplinary divide. While 72% of computer science researchers report daily use of LLMs for code generation and debugging, only 18% of history researchers utilize them, citing concerns over factual hallucination and narrative homogenization.
                    </p>
                  </div>
                </div>

                {/* Bibliography Citation helpers container */}
                <div className="border border-brand-surface-highest p-6 bg-brand-surface-low rounded-none mt-12 space-y-4">
                  <h4 className="font-serif font-bold text-brand-primary text-sm uppercase tracking-wide">
                    Document Citation
                  </h4>
                  <div className="font-mono text-xs text-brand-on-surface-variant leading-normal select-all bg-brand-surface-lowest border border-brand-surface-highest/60 p-4">
                    Sterling, E. (2024). "Generative AI in Academic Research Contexts: Opportunities and Ethical Boundaries." Journal of Advanced Academic Ethics, 15(2), 104-118. DOI: 10.1038/s41567-024
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        navigator.clipboard.writeText(`@article{sterling2024generative, title={Generative AI in Academic Research Contexts: Opportunities and Ethical Boundaries}, author={Sterling, E.}, journal={Journal of Advanced Academic Ethics}, volume={15}, number={2}, pages={104--118}, year={2024}}`);
                        setCopyCodeSuccess(true);
                        setTimeout(() => setCopyCodeSuccess(false), 2000);
                      }}
                      className="font-sans font-bold text-[10px] tracking-widest text-[#1e293b] border border-brand-surface-highest bg-white hover:border-brand-primary px-4 py-2 transition-colors uppercase"
                    >
                      Export BibTeX
                    </button>
                    <button
                      onClick={onContactClick}
                      className="font-sans font-bold text-[10px] tracking-widest text-brand-primary border border-brand-primary hover:bg-brand-primary hover:text-white px-4 py-2 transition-colors uppercase"
                    >
                      Request Reprint
                    </button>
                  </div>
                </div>
              </article>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
