/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  Book,
  ChevronRight,
  GitBranch,
  Dna,
  TrendingUp,
  Terminal,
  Bug,
  LayoutGrid,
  BookOpenText,
  Home,
  Github,
  Linkedin
} from "lucide-react";
import { bookItems } from "../lib/book-loader";
import { RenderMarkdown, parseMarkdown, slugify, highlightBashCode } from "../lib/markdown";

interface BookdownViewProps {
  currentPath: string;
  navigate: (path: string) => void;
}

export default function BookdownView({ currentPath, navigate }: BookdownViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeLanguage, setActiveLanguage] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [bookSearchQuery, setBookSearchQuery] = useState("");

  // Derive bookId and chapterId from currentPath
  const pathParts = useMemo(() => {
    const cleanPath = currentPath.replace(/^\/+|\/+$/g, "");
    if (cleanPath.startsWith("bookdown/")) {
      const parts = cleanPath.substring("bookdown/".length).split("/");
      return {
        bookId: parts[0] || null,
        chapterId: parts[1] || null
      };
    }
    return { bookId: null, chapterId: null };
  }, [currentPath]);

  const selectedBook = useMemo(() => {
    if (!pathParts.bookId) return null;
    return bookItems.find((b) => b.id === pathParts.bookId) || null;
  }, [pathParts.bookId]);

  const activePage = useMemo(() => {
    if (!selectedBook) return null;
    if (!pathParts.chapterId) return selectedBook.chapters[0] || null;

    for (const chap of selectedBook.chapters) {
      if (chap.id === pathParts.chapterId) return chap;
      if (chap.subsections) {
        const found = chap.subsections.find((s) => s.id === pathParts.chapterId);
        if (found) return found;
      }
    }
    return selectedBook.chapters[0] || null;
  }, [selectedBook, pathParts.chapterId]);

  const expandedRootId = useMemo(() => {
    if (!activePage) return null;
    return activePage.parentId || activePage.id;
  }, [activePage]);

  const flatPages = useMemo(() => {
    if (!selectedBook) return [];
    const list: any[] = [];
    selectedBook.chapters.forEach((chap) => {
      list.push(chap);
      if (chap.subsections) {
        list.push(...chap.subsections);
      }
    });
    return list;
  }, [selectedBook]);

  const activePageIndex = useMemo(() => {
    if (!activePage || flatPages.length === 0) return 0;
    return flatPages.findIndex((p) => p.id === activePage.id);
  }, [activePage, flatPages]);

  // Filter chapters list based on local book search query
  const filteredChapters = useMemo(() => {
    if (!bookSearchQuery) return selectedBook?.chapters || [];

    const results: any[] = [];
    selectedBook?.chapters.forEach((chap) => {
      const matchRoot = chap.title.toLowerCase().includes(bookSearchQuery.toLowerCase()) ||
                        chap.contents.toLowerCase().includes(bookSearchQuery.toLowerCase());

      const matchedSubs = chap.subsections?.filter((sub) =>
        sub.title.toLowerCase().includes(bookSearchQuery.toLowerCase()) ||
        sub.contents.toLowerCase().includes(bookSearchQuery.toLowerCase())
      ) || [];

      if (matchRoot || matchedSubs.length > 0) {
        results.push({
          ...chap,
          subsections: matchedSubs
        });
      }
    });
    return results;
  }, [selectedBook, bookSearchQuery]);

  const languagesList = useMemo(() => {
    const stats: Record<string, number> = {};
    bookItems.forEach((book) => {
      const lang = book.language || "English";
      stats[lang] = (stats[lang] || 0) + 1;
    });
    return stats;
  }, []);

  const filteredBooks = useMemo(() => {
    return bookItems.filter((book) => {
      const matchesSearch =
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLanguage = activeLanguage
        ? (book.language || "English").toLowerCase() === activeLanguage.toLowerCase()
        : true;
      return matchesSearch && matchesLanguage;
    });
  }, [searchQuery, activeLanguage]);

  const getBookIcon = (iconName: string) => {
    switch (iconName) {
      case "biotech":
        return <Dna className="w-6 h-6 text-emerald-800" />;
      case "insights":
        return <TrendingUp className="w-6 h-6 text-indigo-800" />;
      case "terminal":
        return <Terminal className="w-6 h-6 text-lime-800" />;
      case "scatter_plot":
        return <LayoutGrid className="w-6 h-6 text-pink-800" />;
      case "account_tree":
        return <GitBranch className="w-6 h-6 text-purple-800" />;
      case "bug_report":
        return <Bug className="w-6 h-6 text-amber-800" />;
      default:
        return <Book className="w-6 h-6 text-brand-primary" />;
    }
  };

  const getBookIconColor = (iconName: string) => {
    switch (iconName) {
      case "biotech":
        return "bg-emerald-50 border-emerald-200 text-emerald-800";
      case "insights":
        return "bg-indigo-50 border-indigo-200 text-indigo-800";
      case "terminal":
        return "bg-lime-50 border-lime-200 text-lime-800";
      case "scatter_plot":
        return "bg-pink-50 border-pink-200 text-pink-800";
      case "account_tree":
        return "bg-purple-50 border-purple-200 text-purple-800";
      case "bug_report":
        return "bg-amber-50 border-amber-200 text-amber-800";
      default:
        return "bg-slate-50 border-slate-200 text-brand-primary";
    }
  };



  const currentChapter = activePage;

  return (
    <div className={selectedBook ? "w-full bg-brand-surface-lowest" : "max-w-container-max mx-auto px-4 md:px-6 py-12"}>
      <AnimatePresence mode="wait">
        {!selectedBook ? (
          /* =========================================================
             BOOKDOWN DIRECTORY VIEW
             ========================================================= */
          <motion.div
            key="bookdown-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-12"
          >
            {/* Header Content Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="max-w-2xl">
                <h1 className="font-serif text-3.5xl font-bold tracking-tight text-brand-primary mb-3">
                  Bookdown Gallery
                </h1>
                <p className="font-sans text-brand-on-surface-variant text-sm leading-relaxed">
                  Interactive guidebooks, coding protocols, and statistical tutorials maintained as open-source Bookdown libraries. Optimized for molecular biology, reproducibility, and computational efficiency.
                </p>
              </div>

              {/* Dynamic search input */}
              <div className="relative w-full md:w-[320px] shrink-0">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-on-surface-variant/40 w-4 h-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter online manuals..."
                  className="w-full bg-brand-surface-low border border-brand-surface-highest focus:border-brand-primary outline-none py-3.5 pl-10 pr-4 text-xs font-sans tracking-wide text-brand-on-surface transition-all placeholder:text-brand-on-surface-variant/40"
                />
              </div>
            </div>

            <div className="w-full h-[1px] bg-brand-surface-highest"></div>

            {/* Languages Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setActiveLanguage(null)}
                className={`px-3 py-1.5 border font-mono text-[10px] uppercase transition-all tracking-wider cursor-pointer ${
                  activeLanguage === null
                    ? "border-brand-primary bg-brand-primary text-white font-bold"
                    : "border-brand-surface-highest hover:border-brand-primary text-brand-on-surface hover:text-brand-primary bg-brand-surface-lowest"
                }`}
              >
                All Languages
              </button>
              {Object.entries(languagesList).map(([langName, count]) => {
                const isActive = activeLanguage === langName;
                return (
                  <button
                    key={langName}
                    onClick={() => setActiveLanguage(isActive ? null : langName)}
                    className={`px-3 py-1.5 border font-mono text-[10px] uppercase transition-all tracking-wider cursor-pointer ${
                      isActive
                        ? "border-brand-primary bg-brand-primary text-white font-bold"
                        : "border-brand-surface-highest hover:border-brand-primary text-brand-on-surface hover:text-brand-primary bg-brand-surface-lowest"
                    }`}
                  >
                    {langName} ({count})
                  </button>
                );
              })}
            </div>

            {/* Grid structure of books */}
            {filteredBooks.length === 0 ? (
              <div className="py-16 text-center border border-brand-surface-highest bg-brand-surface-low animate-fade-in">
                <p className="font-serif font-bold text-brand-primary text-lg">No Manuals Found</p>
                <p className="font-sans text-xs text-brand-on-surface-variant mt-1">Try resetting the spelling of your query to browse full lists of computational manuals.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredBooks.map((book) => (
                  <motion.div
                    key={book.id}
                    whileHover={{ y: -3, borderColor: "var(--color-brand-primary)" }}
                    transition={{ duration: 0.2 }}
                    className="bg-brand-surface-lowest border border-brand-surface-highest p-6 relative flex flex-col justify-between"
                  >
                    <div>
                      {/* Book header badge and icon layout */}
                      <div className="flex items-center gap-3 mb-5">
                        <div className={`w-11 h-11 border flex items-center justify-center rounded-[0.125rem] ${getBookIconColor(book.iconName)}`}>
                          {getBookIcon(book.iconName)}
                        </div>
                        <div>
                          <div className="font-mono text-[9px] tracking-widest text-brand-secondary uppercase">
                            BOOKDOWN MANUAL
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            <span className="font-mono text-[9px] bg-brand-surface-low px-1.5 py-0.25 text-brand-on-surface-variant/70">
                              {book.chapters.length} CHAPTERS
                            </span>
                            {book.language && (
                              <span className="font-mono text-[9px] bg-brand-surface-low px-1.5 py-0.25 text-brand-secondary/80 font-bold uppercase">
                                {book.language}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Info title */}
                      <h3 className="font-serif font-bold text-lg text-brand-primary mb-3">
                        {book.title}
                      </h3>

                      {/* Description */}
                      <p className="font-sans text-xs text-brand-on-surface-variant leading-relaxed mb-6">
                        {book.description}
                      </p>
                    </div>

                    {/* Bookdown Link */}
                    <button
                      onClick={() => {
                        const firstChapter = book.chapters[0];
                        navigate(`/bookdown/${book.id}${firstChapter ? `/${firstChapter.id}` : ""}`);
                      }}
                      className="group flex items-center gap-1.5 font-sans font-bold text-[10px] tracking-widest uppercase text-brand-primary outline-none cursor-pointer border-b border-transparent hover:border-brand-primary pb-0.5 w-fit mt-2 transition-all"
                    >
                      <span>Read eBook</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          /* =========================================================
             SIMULATED FULL-SCREEN INTERACTIVE EBOOK READER Layout
             ========================================================= */
          <motion.div
            key="ebook-reader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-brand-surface-lowest flex flex-col h-screen overflow-hidden"
          >
            {/* Top Header Bar */}
            <div className="h-12 border-b border-brand-surface-highest flex items-center justify-between w-full bg-brand-surface-lowest shrink-0 select-none">
              {/* Left Header segment (above sidebar) */}
              <div className="hidden md:flex w-[300px] shrink-0 border-r border-brand-surface-highest h-full items-center px-6 bg-brand-surface-low">
                <button
                  onClick={() => navigate(`/bookdown/${selectedBook.id}/${selectedBook.chapters[0]?.id}`)}
                  className="font-serif font-bold text-[16px] tracking-tight text-black truncate cursor-pointer w-full text-left outline-none hover:text-sky-600 transition-colors"
                >
                  {selectedBook.title}
                </button>
              </div>

              {/* Right Header segment (above content canvas) */}
              <div className="flex-1 flex items-center justify-between px-6 h-full">
                {/* Left Group: Navigation & Search */}
                <div className="flex items-center gap-4">
                  {/* Catalog / Home link */}
                  <button
                    onClick={() => navigate("/bookdown")}
                    title="Books Catalog"
                    className="text-brand-on-surface-variant/40 hover:text-sky-600 transition-colors cursor-pointer outline-none"
                  >
                    <Home className="w-[18px] h-[18px]" />
                  </button>

                  {/* Local search within Bookdown */}
                  <button
                    onClick={() => setShowSearch(!showSearch)}
                    title="Search book..."
                    className="text-brand-on-surface-variant/40 hover:text-sky-600 transition-colors cursor-pointer outline-none"
                  >
                    <Search className="w-[18px] h-[18px]" />
                  </button>

                  {/* Inline search input */}
                  {showSearch && (
                    <input
                      type="text"
                      value={bookSearchQuery}
                      onChange={(e) => setBookSearchQuery(e.target.value)}
                      placeholder="Tìm kiếm trong sách..."
                      autoFocus
                      className="bg-brand-surface-low border border-brand-surface-highest focus:border-sky-500 outline-none text-xs px-2.5 py-1 rounded w-[180px] text-brand-on-surface placeholder:text-brand-on-surface-variant/40 transition-all font-sans"
                    />
                  )}
                </div>

                {/* Right Group: Social Media */}
                <div className="flex items-center gap-4">
                  <a
                    href="https://linkedin.com/in/hxtunq"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="LinkedIn Profile"
                    className="text-brand-on-surface-variant/40 hover:text-sky-600 transition-colors"
                  >
                    <Linkedin className="w-[18px] h-[18px]" />
                  </a>
                  <a
                    href="https://github.com/hxtunq"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="GitHub Profile"
                    className="text-brand-on-surface-variant/40 hover:text-sky-600 transition-colors"
                  >
                    <Github className="w-[18px] h-[18px]" />
                  </a>
                </div>
              </div>
            </div>

            {/* Main content grid split */}
            <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
              {/* Left Hand: Book chapters index listing hierarchy */}
              <div className="w-full md:w-[300px] shrink-0 bg-brand-surface-low border-b md:border-b-0 md:border-r border-brand-surface-highest flex flex-col h-[350px] md:h-full overflow-hidden">
                {/* Scrollable list */}
                <div className="flex-1 p-6 overflow-y-auto scrollbar-subtle">
                  {/* Table of Chapters list */}
                  <div className="space-y-1">
                    <div className="space-y-1.5">
                      {filteredChapters.map((chap) => {
                        const isRootActive = activePage?.id === chap.id;

                        return (
                          <div key={chap.id} className="space-y-0.5">
                            <button
                              onClick={() => navigate(`/bookdown/${selectedBook.id}/${chap.id}`)}
                              className={`w-full text-left font-sans text-[13px] px-2 py-1 transition-colors block cursor-pointer truncate ${
                                isRootActive
                                  ? "text-sky-600 font-semibold"
                                  : "text-brand-on-surface font-normal hover:text-sky-600"
                              }`}
                            >
                              {chap.title}
                            </button>

                            {/* Subsections list (always visible, fully expanded) */}
                            {chap.subsections && chap.subsections.length > 0 && (
                              <div className="space-y-0.5">
                                {chap.subsections.map((sub) => {
                                  const isSubActive = activePage?.id === sub.id;

                                  return (
                                    <button
                                      key={sub.id}
                                      onClick={() => navigate(`/bookdown/${selectedBook.id}/${sub.id}`)}
                                      className={`w-full text-left font-sans text-[13px] pl-6 pr-2 py-0.5 transition-colors block cursor-pointer truncate ${
                                        isSubActive
                                          ? "text-sky-600 font-semibold"
                                          : "text-brand-on-surface font-normal hover:text-sky-600"
                                      }`}
                                    >
                                      {sub.title}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Bottom sidebar footer */}
                <div className="border-t border-brand-surface-highest flex items-center bg-brand-surface-low/30 p-4 shrink-0 w-full">
                  <span className="font-sans text-[10px] text-brand-on-surface-variant/40 uppercase tracking-wider font-medium">
                    © 2026 Xuan Tung Hoang
                  </span>
                </div>
              </div>

            {/* Right Hand: Sub-document scrolling reader canvas */}
            <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
              {/* Scrollable content container */}
              <div className="flex-1 p-6 md:p-10 overflow-y-auto">
                {currentChapter ? (
                  <div className="space-y-6 max-w-3xl w-full mx-auto">


                    <h3 className="font-serif font-bold text-2xl text-brand-primary tracking-tight">
                      {currentChapter.title}
                    </h3>

                    {/* Body text content (Rendered via Markdown helper) */}
                    <div className="prose prose-slate max-w-none text-sm leading-relaxed text-brand-on-surface font-sans">
                      <RenderMarkdown markdown={currentChapter.contents} />
                    </div>

                    {/* Dynamic coding exercises window */}
                    {currentChapter.code && (
                      <div className="border border-brand-surface-highest bg-[#111827] rounded-[0.25rem] overflow-hidden my-6">
                        <div className="bg-[#0b0f19] border-b border-slate-800 px-4 py-2 font-mono text-[9px] text-slate-400 select-none flex items-center gap-1.5">
                          <Terminal className="w-3 h-3 text-cyan-400" />
                          <span>Interactive Bookdown Code Console</span>
                        </div>
                        <div className="p-4 overflow-x-auto">
                          <pre 
                            className="font-mono text-xs text-[#f9fafb] text-left whitespace-pre"
                            dangerouslySetInnerHTML={{ __html: highlightBashCode(currentChapter.code) }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-20 text-brand-on-surface-variant">
                    <BookOpenText className="w-8 h-8 mx-auto opacity-30 mb-2" />
                    <span>Chapter not synchronized.</span>
                  </div>
                )}
              </div>

              {/* Prev / Next controls for chapter index inside ebook reader */}
              <div className="border-t border-brand-surface-highest flex justify-between items-center bg-brand-surface-low/30 p-4 shrink-0 w-full">
                <button
                  disabled={activePageIndex === 0}
                  onClick={() => {
                    const prevPage = flatPages[activePageIndex - 1];
                    if (prevPage) {
                      navigate(`/bookdown/${selectedBook.id}/${prevPage.id}`);
                    }
                  }}
                  className="font-sans font-bold text-[10px] tracking-widest text-brand-secondary hover:text-brand-primary transition-all disabled:opacity-35 cursor-pointer uppercase text-left"
                >
                  &larr; Prev Page
                </button>
                <span className="font-mono text-[10px] text-brand-secondary font-semibold">
                  {activePageIndex + 1} of {flatPages.length}
                </span>
                <button
                  disabled={activePageIndex === flatPages.length - 1}
                  onClick={() => {
                    const nextPage = flatPages[activePageIndex + 1];
                    if (nextPage) {
                      navigate(`/bookdown/${selectedBook.id}/${nextPage.id}`);
                    }
                  }}
                  className="font-sans font-bold text-[10px] tracking-widest text-brand-primary hover:text-brand-secondary transition-all disabled:opacity-35 cursor-pointer uppercase text-right"
                >
                  Next Page &rarr;
                </button>
              </div>
            </div>
          </div>
        </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
