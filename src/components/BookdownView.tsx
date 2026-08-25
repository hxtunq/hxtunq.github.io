/**
 * @license
 * SPDX-License-Identifier: MIT
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
  Linkedin,
  Menu,
  X,
  Sun,
  Moon,
  Sparkles,
  Flower2,
  Monitor,
  Check,
  Settings,
  Palette
} from "lucide-react";
import { bookItems } from "../lib/book-loader";
import { RenderMarkdown, parseMarkdown, slugify, highlightBashCode } from "../lib/markdown";
import { ThemePreference, ResolvedTheme } from "../lib/theme";

function renderTOCTitle(title: string): React.JSX.Element {
  const match = title.match(/^([\d.]+)\.\s+(.*)$/);
  if (match) {
    const num = match[1];
    const text = match[2];
    return (
      <>
        <span className="font-bold mr-1.5">{num}</span>
        <span>{text}</span>
      </>
    );
  }
  return <span>{title}</span>;
}

interface BookdownViewProps {
  currentPath: string;
  navigate: (path: string) => void;
  themePreference?: ThemePreference;
  resolvedTheme?: ResolvedTheme;
  isDark?: boolean;
  onSetTheme?: (preference: ThemePreference) => void;
}

export default function BookdownView({
  currentPath,
  navigate,
  themePreference = "system",
  resolvedTheme = "light",
  isDark = false,
  onSetTheme
}: BookdownViewProps) {
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const themeMenuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
        setThemeMenuOpen(false);
      }
    };
    if (themeMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [themeMenuOpen]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [bookSearchQuery, setBookSearchQuery] = useState("");
  // Start with the table of contents collapsed on phones so readers land on the
  // chapter content first; keep it open by default on tablets/desktops.
  const [showSidebar, setShowSidebar] = useState(
    () => (typeof window !== "undefined" ? window.innerWidth >= 768 : true)
  );

  // Derive bookId and chapterId from currentPath
  const pathParts = useMemo(() => {
    const cleanPath = currentPath.replace(/^\/+|\/+$/g, "");
    if (cleanPath.startsWith("docs/")) {
      const parts = cleanPath.substring("docs/".length).split("/");
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

  const tagsList = useMemo(() => {
    const stats: Record<string, number> = {};
    bookItems.forEach((book) => {
      if (book.tags) {
        book.tags.forEach((tag) => {
          stats[tag] = (stats[tag] || 0) + 1;
        });
      }
    });
    return stats;
  }, []);

  const filteredBooks = useMemo(() => {
    return bookItems.filter((book) => {
      const matchesSearch =
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [searchQuery]);

  const projectBooks = useMemo(() => {
    return filteredBooks.filter((book) => book.category === "projects" || !book.category);
  }, [filteredBooks]);

  const resourceBooks = useMemo(() => {
    return filteredBooks.filter((book) => book.category === "resources");
  }, [filteredBooks]);

  const technicalNotesBooks = useMemo(() => {
    return filteredBooks.filter((book) => book.category === "technical-notes");
  }, [filteredBooks]);

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
        return "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300";
      case "insights":
        return "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/60 text-indigo-800 dark:text-indigo-300";
      case "terminal":
        return "bg-lime-50 dark:bg-lime-950/40 border-lime-200 dark:border-lime-800/60 text-lime-800 dark:text-lime-300";
      case "scatter_plot":
        return "bg-pink-50 dark:bg-pink-950/40 border-pink-200 dark:border-pink-800/60 text-pink-800 dark:text-pink-300";
      case "account_tree":
        return "bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800/60 text-purple-800 dark:text-purple-300";
      case "bug_report":
        return "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300";
      default:
        return "bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-brand-primary";
    }
  };

  const currentChapter = activePage;

  // Navigate to a chapter and, on phones, auto-collapse the TOC so the reader
  // immediately sees the content instead of the (still-open) chapter list.
  const goToChapter = (chapterId: string) => {
    if (selectedBook) {
      navigate(`/docs/${selectedBook.id}/${chapterId}`);
    }
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setShowSidebar(false);
    }
  };

  const renderBookCard = (book: typeof bookItems[0]) => (
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
              {book.typeLabel || "BOOKDOWN MANUAL"}
            </div>
            <div className="flex flex-wrap gap-1 mt-1">
              <span className="font-mono text-[9px] bg-brand-surface-low px-1.5 py-0.25 text-brand-on-surface-variant/70">
                {book.chapters.length} {book.chapters.length === 1 ? "CHAPTER" : "CHAPTERS"}
              </span>
              {book.language && (
                <span className="font-mono text-[9px] bg-brand-surface-low px-1.5 py-0.25 text-brand-on-surface-variant/70 uppercase">
                  {book.language}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Info title */}
        <h3 className="font-sans font-bold text-lg text-brand-primary mb-3">
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
          navigate(`/docs/${book.id}${firstChapter ? `/${firstChapter.id}` : ""}`);
        }}
        className="group flex items-center gap-1.5 font-sans font-bold text-[10px] tracking-widest uppercase text-brand-primary outline-none cursor-pointer border-b border-transparent hover:border-brand-primary pb-0.5 w-fit mt-2 transition-all"
      >
        <span>Read</span>
        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
      </button>
    </motion.div>
  );

  return (
    <div className="w-full bg-brand-bg">
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
            className="max-w-container-max mx-auto px-4 md:px-6 py-12 space-y-12"
          >
            {/* Header Content Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="max-w-2xl">
                <h1 className="font-sans text-3.5xl font-bold tracking-tight text-brand-primary mb-3">
                  Docs
                </h1>
                <p className="font-sans text-brand-on-surface-variant text-sm leading-relaxed">
                  Projects, reproducible notebooks, research protocols, and hands-on guides I build and maintain.
                </p>
              </div>

              {/* Dynamic search input */}
              <div className="relative w-full md:w-[320px] shrink-0">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-on-surface-variant/40 w-4 h-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter docs & manuals..."
                  className="w-full bg-brand-surface-low border border-brand-surface-highest focus:border-brand-primary outline-none py-3.5 pl-10 pr-4 text-xs font-sans tracking-wide text-brand-on-surface transition-all placeholder:text-brand-on-surface-variant/40"
                />
              </div>
            </div>

            <div className="w-full h-[1px] bg-brand-surface-highest"></div>

            {/* Grid structure of books */}
            {filteredBooks.length === 0 ? (
              <div className="py-16 text-center border border-brand-surface-highest bg-brand-surface-low animate-fade-in">
                <p className="font-serif font-bold text-brand-primary text-lg">No Manuals Found</p>
                <p className="font-sans text-xs text-brand-on-surface-variant mt-1">Try resetting the spelling of your query to browse full lists of computational manuals.</p>
              </div>
            ) : (
              <div className="space-y-12">
                {/* 1. PROJECTS SECTION */}
                <section className="space-y-4">
                  <div>
                    <h2 className="font-sans text-[11.5px] font-bold tracking-widest text-brand-secondary uppercase">
                      Projects
                    </h2>
                  </div>
                  {projectBooks.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                      {projectBooks.map(renderBookCard)}
                    </div>
                  ) : (
                    <p className="font-mono text-xs text-brand-on-surface-variant/50 italic py-1">
                      Coming soon...
                    </p>
                  )}
                </section>

                {/* 2. RESOURCES SECTION */}
                {resourceBooks.length > 0 && (
                  <section className="space-y-4">
                    <div>
                      <h2 className="font-sans text-[11.5px] font-bold tracking-widest text-brand-secondary uppercase">
                        Resources
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                      {resourceBooks.map(renderBookCard)}
                    </div>
                  </section>
                )}

                {/* 3. TECHNICAL NOTES SECTION */}
                <section className="space-y-4">
                  <div>
                    <h2 className="font-sans text-[11.5px] font-bold tracking-widest text-brand-secondary uppercase">
                      Technical Notes
                    </h2>
                  </div>
                  {technicalNotesBooks.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                      {technicalNotesBooks.map(renderBookCard)}
                    </div>
                  ) : (
                    <p className="font-mono text-xs text-brand-on-surface-variant/50 italic py-1">
                      Coming soon...
                    </p>
                  )}
                </section>
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
            className="fixed inset-0 z-30 bg-brand-surface-lowest flex flex-col h-[100dvh] w-full overflow-hidden"
          >
            {/* Top Header Bar */}
            <div className="h-12 border-b border-brand-surface-highest flex items-center justify-between w-full bg-brand-surface-lowest shrink-0 select-none z-20">
              {/* Left Header segment (above sidebar on desktop) */}
              {showSidebar && (
                <div className="hidden md:flex w-[300px] shrink-0 border-r border-brand-surface-highest h-full items-center px-6 bg-brand-surface-low">
                  <button
                    onClick={() => navigate(`/docs/${selectedBook.id}/${selectedBook.chapters[0]?.id}`)}
                    style={{ textAlign: "left" }}
                    className="font-sans font-normal text-[14.5px] text-brand-on-surface truncate cursor-pointer w-full outline-none hover:text-sky-600 transition-colors"
                  >
                    {selectedBook.title}
                  </button>
                </div>
              )}

              {/* Right Header segment (above content canvas) */}
              <div className="flex-1 flex items-center justify-between px-4 sm:px-6 h-full min-w-0">
                {/* Left Group: Navigation & Search */}
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  {/* Toggle Sidebar Button */}
                  <button
                    onClick={() => setShowSidebar(!showSidebar)}
                    title="Toggle Table of Contents"
                    className="text-brand-on-surface-variant/70 hover:text-sky-600 transition-colors cursor-pointer outline-none p-1"
                  >
                    <Menu className="w-[18px] h-[18px]" />
                  </button>

                  {/* Catalog / Home link */}
                  <button
                    onClick={() => navigate("/docs")}
                    title="Docs Catalog"
                    className="text-brand-on-surface-variant/70 hover:text-sky-600 transition-colors cursor-pointer outline-none p-1"
                  >
                    <Home className="w-[18px] h-[18px]" />
                  </button>

                  {/* Book title on mobile header */}
                  <span className="md:hidden font-sans font-medium text-xs text-brand-primary truncate max-w-[140px] sm:max-w-[200px]">
                    {selectedBook.title}
                  </span>

                  {/* Local search within Bookdown */}
                  <button
                    onClick={() => setShowSearch(!showSearch)}
                    title="Search within book..."
                    className="hidden sm:block text-brand-on-surface-variant/70 hover:text-sky-600 transition-colors cursor-pointer outline-none p-1"
                  >
                    <Search className="w-[18px] h-[18px]" />
                  </button>

                  {/* Inline search input */}
                  {showSearch && (
                    <input
                      type="text"
                      value={bookSearchQuery}
                      onChange={(e) => setBookSearchQuery(e.target.value)}
                      placeholder="Search within book..."
                      autoFocus
                      className="bg-brand-surface-low border border-brand-surface-highest focus:border-sky-500 outline-none text-xs px-2.5 py-1 rounded w-[150px] sm:w-[180px] text-brand-on-surface placeholder:text-brand-on-surface-variant/40 transition-all font-sans"
                    />
                  )}
                </div>

                {/* Right Group: Settings Popover & Social Media */}
                <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
                  {onSetTheme && (
                    <div className="relative" ref={themeMenuRef}>
                      <button
                        onClick={() => setThemeMenuOpen(!themeMenuOpen)}
                        aria-label="Theme settings"
                        title="Theme settings"
                        className={`p-1 rounded-full transition-colors cursor-pointer outline-none ${
                          themeMenuOpen
                            ? "bg-brand-surface-high text-brand-primary"
                            : "text-brand-on-surface-variant/70 hover:text-brand-primary hover:bg-brand-surface-high"
                        }`}
                      >
                        <Settings className="w-[18px] h-[18px]" />
                      </button>

                      {/* Dropdown Popover */}
                      <AnimatePresence>
                        {themeMenuOpen && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 6 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 6 }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                            className="absolute right-0 top-9 z-50 w-[325px] p-2 rounded-2xl bg-brand-surface-lowest border border-brand-surface-highest shadow-xl overflow-hidden font-sans space-y-1.5"
                          >
                            <div className="flex items-center gap-1.5 px-1 py-0.5 text-xs text-brand-secondary font-medium">
                              <Palette className="w-3.5 h-3.5" />
                              <span>Theme</span>
                            </div>
                            <div className="grid grid-cols-5 gap-1 p-0.5 bg-brand-surface-low rounded-lg border border-brand-surface-highest/80">
                              {[
                                { key: "light" as ThemePreference, label: "Light", Icon: Sun },
                                { key: "orange" as ThemePreference, label: "Orange", Icon: Sparkles },
                                { key: "sakura" as ThemePreference, label: "Sakura", Icon: Flower2 },
                                { key: "dark" as ThemePreference, label: "Dark", Icon: Moon },
                                { key: "system" as ThemePreference, label: "System", Icon: Monitor },
                              ].map(({ key, label, Icon }) => {
                                const isSelected = themePreference === key;
                                return (
                                  <button
                                    key={key}
                                    onClick={() => onSetTheme(key)}
                                    className={`flex flex-col items-center justify-center gap-0.5 py-1 px-0.5 rounded text-[9.5px] transition-colors cursor-pointer ${
                                      isSelected
                                        ? "bg-brand-surface-lowest text-brand-primary font-bold shadow-xs"
                                        : "text-brand-on-surface-variant hover:text-brand-primary"
                                    }`}
                                  >
                                    <Icon
                                      className={`w-3 h-3 ${
                                        isSelected
                                          ? key === "sakura"
                                            ? "text-[#e85d88]"
                                            : key === "dark"
                                            ? "text-sky-400"
                                            : key === "orange"
                                            ? "text-[#c96442]"
                                            : key === "light"
                                            ? "text-amber-500"
                                            : "text-brand-accent"
                                          : "text-brand-secondary"
                                      }`}
                                    />
                                    <span className="truncate max-w-full">{label}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
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

            {/* Mobile TOC Drawer overlay (when showSidebar is true on mobile) */}
            <AnimatePresence>
              {showSidebar && (
                <div className="md:hidden fixed inset-0 top-12 z-40 flex">
                  {/* Backdrop */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => setShowSidebar(false)}
                    className="fixed inset-0 top-12 bg-black/40 backdrop-blur-xs"
                  />
                  {/* Drawer Panel */}
                  <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "-100%" }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className="relative w-[85%] max-w-[320px] h-full bg-brand-surface-low border-r border-brand-surface-highest flex flex-col shadow-2xl overflow-hidden z-10"
                  >
                    <div className="p-3.5 border-b border-brand-surface-highest flex items-center justify-between bg-brand-surface-lowest">
                      <span className="font-sans font-semibold text-xs text-brand-primary truncate">
                        {selectedBook.title}
                      </span>
                      <button
                        onClick={() => setShowSidebar(false)}
                        aria-label="Close table of contents"
                        className="p-1 text-brand-secondary hover:text-brand-primary rounded cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    {/* Scrollable list */}
                    <div className="flex-1 px-4 py-4 overflow-y-auto scrollbar-subtle">
                      <div className="space-y-1">
                        {filteredChapters.map((chap, idx) => {
                          const isRootActive = activePage?.id === chap.id;
                          const prevChap = idx > 0 ? filteredChapters[idx - 1] : null;
                          const showSectionHeader = chap.section && (!prevChap || prevChap.section !== chap.section);

                          return (
                            <div key={chap.id} className="space-y-0.5">
                              {showSectionHeader && (
                                <div className={`font-sans text-[10.5px] font-bold text-brand-secondary/80 tracking-wider uppercase px-2 select-none ${idx === 0 ? "pt-1 pb-0.5" : "pt-3.5 pb-0.5"}`}>
                                  {chap.section}
                                </div>
                              )}
                              <button
                                onClick={() => goToChapter(chap.id)}
                                style={{ textAlign: "left" }}
                                className={`w-full font-sans text-[13.5px] px-2 py-1 transition-colors block cursor-pointer truncate ${isRootActive
                                  ? "text-sky-600 font-semibold"
                                  : "text-brand-on-surface font-normal hover:text-sky-600"
                                  }`}
                              >
                                {renderTOCTitle(chap.title)}
                              </button>

                              {/* Subsections list (always visible, fully expanded) */}
                              {chap.subsections && chap.subsections.length > 0 && (
                                <div className="space-y-0.5">
                                  {chap.subsections.map((sub) => {
                                    const isSubActive = activePage?.id === sub.id;

                                    return (
                                      <button
                                        key={sub.id}
                                        onClick={() => goToChapter(sub.id)}
                                        style={{ textAlign: "left" }}
                                        className={`w-full font-sans text-[13px] pl-5 pr-2 py-0.5 transition-colors block cursor-pointer truncate ${isSubActive
                                          ? "text-sky-600 font-semibold"
                                          : "text-brand-on-surface font-normal hover:text-sky-600"
                                          }`}
                                      >
                                        {renderTOCTitle(sub.title)}
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
                    {/* Bottom drawer footer */}
                    <div className="border-t border-brand-surface-highest flex items-center bg-brand-surface-low/60 py-2.5 px-4 shrink-0 w-full">
                      <span className="font-sans text-[10px] text-brand-on-surface-variant/40 uppercase tracking-wider font-medium">
                        © 2026 Xuan Tung Hoang
                      </span>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* Main content grid split */}
            <div className="flex flex-1 min-h-0 overflow-hidden relative">
              {/* Left Hand: Desktop Book chapters index listing hierarchy */}
              {showSidebar && (
                <div className="hidden md:flex w-[300px] shrink-0 bg-brand-surface-low border-r border-brand-surface-highest flex-col h-full overflow-hidden">
                  {/* Scrollable list */}
                  <div className="flex-1 px-4 py-5 overflow-y-auto scrollbar-subtle">
                    {/* Table of Chapters list */}
                    <div className="space-y-1">
                      <div className="space-y-1">
                        {filteredChapters.map((chap, idx) => {
                          const isRootActive = activePage?.id === chap.id;
                          const prevChap = idx > 0 ? filteredChapters[idx - 1] : null;
                          const showSectionHeader = chap.section && (!prevChap || prevChap.section !== chap.section);

                          return (
                            <div key={chap.id} className="space-y-0.5">
                              {showSectionHeader && (
                                <div className={`font-sans text-[10.5px] font-bold text-brand-secondary/80 tracking-wider uppercase px-2 select-none ${idx === 0 ? "pt-1 pb-0.5" : "pt-3.5 pb-0.5"}`}>
                                  {chap.section}
                                </div>
                              )}
                              <button
                                onClick={() => goToChapter(chap.id)}
                                style={{ textAlign: "left" }}
                                className={`w-full font-sans text-[13.5px] px-2 py-1 transition-colors block cursor-pointer truncate ${isRootActive
                                  ? "text-sky-600 font-normal"
                                  : "text-brand-on-surface font-normal hover:text-sky-600"
                                  }`}
                              >
                                {renderTOCTitle(chap.title)}
                              </button>

                              {/* Subsections list (always visible, fully expanded) */}
                              {chap.subsections && chap.subsections.length > 0 && (
                                <div className="space-y-0.5">
                                  {chap.subsections.map((sub) => {
                                    const isSubActive = activePage?.id === sub.id;

                                    return (
                                      <button
                                        key={sub.id}
                                        onClick={() => goToChapter(sub.id)}
                                        style={{ textAlign: "left" }}
                                        className={`w-full font-sans text-[13px] pl-5 pr-2 py-0.5 transition-colors block cursor-pointer truncate ${isSubActive
                                          ? "text-sky-600 font-normal"
                                          : "text-brand-on-surface font-normal hover:text-sky-600"
                                          }`}
                                      >
                                        {renderTOCTitle(sub.title)}
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
                  <div className="border-t border-brand-surface-highest flex items-center bg-brand-surface-low/30 py-2.5 px-4 shrink-0 w-full">
                    <span className="font-sans text-[10px] text-brand-on-surface-variant/40 uppercase tracking-wider font-medium">
                      © 2026 Xuan Tung Hoang
                    </span>
                  </div>
                </div>
              )}

              {/* Right Hand: Sub-document scrolling reader canvas */}
              <div className="flex-1 flex flex-col min-w-0 min-h-0 h-full overflow-hidden">
                {/* Scrollable content container */}
                <div className="flex-1 p-5 sm:p-8 md:p-10 lg:px-16 xl:pl-36 xl:pr-8 overflow-y-auto">
                  {currentChapter ? (
                    <div className="space-y-6 max-w-2xl xl:max-w-[984px] w-full mx-auto pb-8">
                      <h3 className="font-sans font-medium text-2xl text-brand-primary tracking-tight">
                        {currentChapter.title}
                      </h3>

                      {/* Body text content (Rendered via Markdown helper) */}
                      <div className="prose prose-slate max-w-none text-sm leading-relaxed text-brand-on-surface font-sans">
                        <RenderMarkdown markdown={currentChapter.contents} />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-20 text-brand-on-surface-variant">
                      <BookOpenText className="w-8 h-8 mx-auto opacity-30 mb-2" />
                      <span>Chapter not synchronized.</span>
                    </div>
                  )}
                </div>

                {/* Prev / Next controls for chapter index inside ebook reader bottom sticky bar */}
                <div className="border-t border-brand-surface-highest flex justify-between items-center bg-brand-surface-low/60 backdrop-blur-xs py-2.5 px-4 shrink-0 w-full select-none z-10">
                  <button
                    disabled={activePageIndex === 0}
                    onClick={() => {
                      const prevPage = flatPages[activePageIndex - 1];
                      if (prevPage) {
                        navigate(`/docs/${selectedBook.id}/${prevPage.id}`);
                        if (typeof window !== "undefined" && window.innerWidth < 768) {
                          setShowSidebar(false);
                        }
                      }
                    }}
                    className="font-sans font-bold text-[10px] tracking-widest text-brand-secondary hover:text-brand-primary transition-all disabled:opacity-35 cursor-pointer uppercase text-left py-1"
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
                        navigate(`/docs/${selectedBook.id}/${nextPage.id}`);
                        if (typeof window !== "undefined" && window.innerWidth < 768) {
                          setShowSidebar(false);
                        }
                      }
                    }}
                    className="font-sans font-bold text-[10px] tracking-widest text-brand-primary hover:text-brand-secondary transition-all disabled:opacity-35 cursor-pointer uppercase text-right py-1"
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
