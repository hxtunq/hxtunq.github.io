/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import { useState, useMemo, useCallback } from "react";
import { motion } from "motion/react";
import {
  Search,
  X,
  Calendar,
  RotateCcw,
  ArrowRight,
} from "lucide-react";

import { selectedPublications } from "../data";
import { blogPosts } from "../lib/blog-loader";
import { bookItems } from "../lib/book-loader";
import { notesPosts } from "../lib/notes-loader";

type DateFilterMode = "all" | "year" | "month" | "date";

const MONTH_NAMES = [
  { num: 1, short: "Jan", full: "January" },
  { num: 2, short: "Feb", full: "February" },
  { num: 3, short: "Mar", full: "March" },
  { num: 4, short: "Apr", full: "April" },
  { num: 5, short: "May", full: "May" },
  { num: 6, short: "Jun", full: "June" },
  { num: 7, short: "Jul", full: "July" },
  { num: 8, short: "Aug", full: "August" },
  { num: 9, short: "Sep", full: "September" },
  { num: 10, short: "Oct", full: "October" },
  { num: 11, short: "Nov", full: "November" },
  { num: 12, short: "Dec", full: "December" },
];

/**
 * Intelligent snippet generator:
 * - Strips raw Markdown, links, images, headings.
 * - Extracts complete sentence(s) if within reasonable length.
 * - If exceeding max length, breaks at a clean word boundary and appends '...'.
 */
function cleanContentSnippet(rawContent: string, maxLen = 175): string {
  if (!rawContent) return "";

  // 1. Clean markdown artifacts
  let text = rawContent
    .replace(/^---[\s\S]*?---/g, "")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/#+\s+/g, "")
    .replace(/[*_~>]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!text) return "";

  // 2. If short enough, check if ends with punctuation, otherwise return cleanly
  if (text.length <= maxLen) {
    return text;
  }

  // 3. Try to find the first complete sentence ending (. ! ?) in range [60, maxLen + 30]
  const sliceRange = text.slice(0, maxLen + 30);
  const sentenceEndMatches = [...sliceRange.matchAll(/[.!?](?:\s|$)/g)];
  if (sentenceEndMatches.length > 0) {
    const validSentence = sentenceEndMatches.reverse().find(
      (m) => m.index !== undefined && m.index >= 50 && m.index <= maxLen + 20
    );
    if (validSentence && validSentence.index !== undefined) {
      return text.slice(0, validSentence.index + 1).trim() + " ...";
    }
  }

  // 4. Fallback to word boundary
  const sub = text.slice(0, maxLen);
  const lastSpace = sub.lastIndexOf(" ");
  if (lastSpace > 40) {
    return sub.slice(0, lastSpace).trim() + " ...";
  }

  return sub.trim() + " ...";
}

// Helper to parse date into numeric components once
function parseDateComponents(dateVal?: string | number): {
  year: number | null;
  month: number | null;
  day: number | null;
  isoDate: string | null;
  formattedDate: string;
} {
  if (!dateVal) {
    return { year: null, month: null, day: null, isoDate: null, formattedDate: "" };
  }

  if (typeof dateVal === "number") {
    return {
      year: dateVal,
      month: null,
      day: null,
      isoDate: null,
      formattedDate: String(dateVal),
    };
  }

  const d = new Date(dateVal);
  if (!isNaN(d.getTime())) {
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const isoDate = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const formattedDate = d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    return { year, month, day, isoDate, formattedDate };
  }

  // Fallback for custom formats
  const match = String(dateVal).match(/\b(20\d{2}|19\d{2})\b/);
  const year = match ? parseInt(match[1], 10) : null;
  return { year, month: null, day: null, isoDate: null, formattedDate: String(dateVal) };
}

// Pre-index records statically at module level (runs only ONCE, lightning-fast)
const indexedNotes = notesPosts.map((post) => {
  const dateMeta = parseDateComponents(post.createdAt);
  const snippet = cleanContentSnippet(post.content, 180);
  return {
    raw: post,
    id: post.id,
    contentLower: (post.content || "").toLowerCase(),
    authorLower: (post.authorName || "").toLowerCase(),
    tagsLower: (post.tags || []).map((t) => t.toLowerCase()),
    snippet,
    ...dateMeta,
  };
});

const indexedBlogs = blogPosts.map((post) => {
  const dateMeta = parseDateComponents(post.date);
  const snippet = cleanContentSnippet(post.abstract || post.contentMarkdown || "", 170);
  return {
    raw: post,
    id: post.id,
    titleLower: (post.title || "").toLowerCase(),
    abstractLower: (post.abstract || "").toLowerCase(),
    categoryLower: (post.category || "").toLowerCase(),
    tagsLower: (post.tags || []).map((t) => t.toLowerCase()),
    snippet,
    ...dateMeta,
  };
});

const indexedPublications = selectedPublications.map((pub) => {
  const snippet = cleanContentSnippet(pub.abstract || "", 170);
  return {
    raw: pub,
    id: pub.id,
    titleLower: (pub.title || "").toLowerCase(),
    abstractLower: (pub.abstract || "").toLowerCase(),
    journalLower: (pub.journal || "").toLowerCase(),
    year: pub.year || null,
    snippet,
  };
});

const indexedDocs: {
  bookId: string;
  bookTitle: string;
  id: string;
  title: string;
  titleLower: string;
  contentsLower: string;
  snippet: string;
}[] = [];

bookItems.forEach((book) => {
  book.chapters.forEach((chap) => {
    indexedDocs.push({
      bookId: book.id,
      bookTitle: book.title,
      id: chap.id,
      title: chap.title,
      titleLower: chap.title.toLowerCase(),
      contentsLower: (chap.contents || "").toLowerCase(),
      snippet: cleanContentSnippet(chap.contents || "", 160),
    });
  });
});

// Compute available years once
const STATIC_AVAILABLE_YEARS: number[] = (() => {
  const years = new Set<number>();
  indexedNotes.forEach((n) => n.year && years.add(n.year));
  indexedBlogs.forEach((b) => b.year && years.add(b.year));
  indexedPublications.forEach((p) => p.year && years.add(p.year));
  const sorted = Array.from(years).sort((a, b) => b - a);
  return sorted.length > 0 ? sorted : [new Date().getFullYear()];
})();

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  navigate: (path: string) => void;
  triggerToast: (msg: string) => void;
}

export default function SearchModal({
  isOpen,
  onClose,
  navigate,
  triggerToast,
}: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [dateFilterMode, setDateFilterMode] = useState<DateFilterMode>("all");
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMonthYear, setSelectedMonthYear] = useState<number>(
    STATIC_AVAILABLE_YEARS[0] || 2026
  );
  const [selectedMonthNum, setSelectedMonthNum] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");

  // Reset internal state when closed
  const handleClose = useCallback(() => {
    setQuery("");
    setDateFilterMode("all");
    setSelectedYear(null);
    setSelectedMonthNum(null);
    setSelectedDate("");
    onClose();
  }, [onClose]);

  const resetDateFilter = useCallback(() => {
    setDateFilterMode("all");
    setSelectedYear(null);
    setSelectedMonthNum(null);
    setSelectedDate("");
  }, []);

  const isFilterActive =
    (dateFilterMode === "year" && selectedYear !== null) ||
    (dateFilterMode === "month" && selectedMonthNum !== null) ||
    (dateFilterMode === "date" && selectedDate !== "");

  const isSearching = query.trim() !== "" || isFilterActive;

  // Ultra-fast date matcher using pre-parsed numeric comparisons
  const checkDateMatch = useCallback(
    (itemYear: number | null, itemMonth: number | null, itemIso: string | null) => {
      if (!isFilterActive) return true;

      if (dateFilterMode === "year") {
        if (selectedYear === null) return true;
        return itemYear === selectedYear;
      }

      if (dateFilterMode === "month") {
        if (selectedMonthNum === null) return true;
        if (itemYear !== selectedMonthYear) return false;
        if (itemMonth !== null) return itemMonth === selectedMonthNum;
        return true;
      }

      if (dateFilterMode === "date") {
        if (!selectedDate) return true;
        return itemIso === selectedDate;
      }

      return true;
    },
    [isFilterActive, dateFilterMode, selectedYear, selectedMonthYear, selectedMonthNum, selectedDate]
  );

  // Fast filtered collections
  const matchedNotes = useMemo(() => {
    if (!isSearching) return [];
    const q = query.toLowerCase().trim();

    return indexedNotes.filter((item) => {
      const textMatch =
        !q ||
        item.contentLower.includes(q) ||
        item.authorLower.includes(q) ||
        item.tagsLower.some((t) => t.includes(q));

      if (!textMatch) return false;
      return checkDateMatch(item.year, item.month, item.isoDate);
    });
  }, [isSearching, query, checkDateMatch]);

  const matchedBlogs = useMemo(() => {
    if (!isSearching) return [];
    const q = query.toLowerCase().trim();

    return indexedBlogs.filter((item) => {
      const textMatch =
        !q ||
        item.titleLower.includes(q) ||
        item.abstractLower.includes(q) ||
        item.categoryLower.includes(q) ||
        item.tagsLower.some((t) => t.includes(q));

      if (!textMatch) return false;
      return checkDateMatch(item.year, item.month, item.isoDate);
    });
  }, [isSearching, query, checkDateMatch]);

  const matchedPublications = useMemo(() => {
    if (!isSearching) return [];
    const q = query.toLowerCase().trim();

    return indexedPublications.filter((item) => {
      const textMatch =
        !q ||
        item.titleLower.includes(q) ||
        item.abstractLower.includes(q) ||
        item.journalLower.includes(q);

      if (!textMatch) return false;
      return checkDateMatch(item.year, null, null);
    });
  }, [isSearching, query, checkDateMatch]);

  const matchedDocs = useMemo(() => {
    if (!isSearching) return [];
    const q = query.toLowerCase().trim();
    if (!q) return [];

    return indexedDocs.filter(
      (item) => item.titleLower.includes(q) || item.contentsLower.includes(q)
    );
  }, [isSearching, query]);

  const totalResultsCount =
    matchedNotes.length +
    matchedBlogs.length +
    matchedDocs.length +
    matchedPublications.length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[6vh] md:pt-[10vh]">
      {/* Lightweight GPU-friendly dark backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.12 }}
        onClick={handleClose}
        className="fixed inset-0 bg-brand-primary/65"
      />

      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: -6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: -6 }}
        transition={{ duration: 0.14, ease: "easeOut" }}
        className="relative w-full max-w-2xl bg-brand-surface-lowest border border-brand-surface-highest shadow-2xl p-5 md:p-6 z-10 rounded-none overflow-hidden"
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b border-brand-surface-highest pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <Search className="w-5 h-5 text-brand-primary" />
            <span className="font-serif font-bold text-lg text-brand-primary">
              Search Portal
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block font-mono text-[10px] text-brand-on-surface-variant/60 border border-brand-surface-highest px-1.5 py-0.5 rounded">
              ESC
            </span>
            <button
              onClick={handleClose}
              className="w-8 h-8 flex items-center justify-center hover:bg-brand-surface-low text-brand-on-surface-variant hover:text-brand-primary transition-colors cursor-pointer rounded"
              aria-label="Close search"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full mb-3.5">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-on-surface-variant/50 pointer-events-none" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search keywords (e.g. biophysics, genomics, python)..."
            className="w-full bg-brand-surface-low border border-brand-surface-highest focus:border-brand-primary outline-none pl-10 pr-12 py-3 text-xs md:text-sm rounded-none text-brand-on-surface placeholder:text-brand-on-surface-variant/40 font-sans transition-colors"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold text-brand-secondary hover:text-brand-primary cursor-pointer px-1 py-0.5"
            >
              CLEAR
            </button>
          )}
        </div>

        {/* Date Filter Bar */}
        <div className="bg-brand-surface-low/40 border border-brand-surface-highest p-3 space-y-2.5 mb-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-brand-secondary">
              <Calendar className="w-3.5 h-3.5" />
              <span className="font-sans text-[11px] font-bold tracking-wider uppercase">
                Filter by Date
              </span>
            </div>
            {isFilterActive && (
              <button
                onClick={resetDateFilter}
                className="flex items-center gap-1 text-[10px] font-mono text-brand-accent hover:underline cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Filter Mode Selector Pills */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => {
                setDateFilterMode("all");
                resetDateFilter();
              }}
              className={`px-2.5 py-1 text-[11px] font-sans font-medium transition-colors cursor-pointer rounded-xs ${
                dateFilterMode === "all"
                  ? "bg-brand-primary text-brand-surface-lowest font-semibold"
                  : "bg-brand-surface-lowest text-brand-on-surface-variant hover:text-brand-primary border border-brand-surface-highest"
              }`}
            >
              All Time
            </button>

            <button
              onClick={() => {
                setDateFilterMode("year");
                if (!selectedYear && STATIC_AVAILABLE_YEARS.length > 0) {
                  setSelectedYear(STATIC_AVAILABLE_YEARS[0]);
                }
              }}
              className={`px-2.5 py-1 text-[11px] font-sans font-medium transition-colors cursor-pointer rounded-xs ${
                dateFilterMode === "year"
                  ? "bg-brand-primary text-brand-surface-lowest font-semibold"
                  : "bg-brand-surface-lowest text-brand-on-surface-variant hover:text-brand-primary border border-brand-surface-highest"
              }`}
            >
              By Year
            </button>

            <button
              onClick={() => {
                setDateFilterMode("month");
                if (selectedMonthNum === null) {
                  const now = new Date();
                  setSelectedMonthYear(STATIC_AVAILABLE_YEARS[0] || now.getFullYear());
                  setSelectedMonthNum(now.getMonth() + 1);
                }
              }}
              className={`px-2.5 py-1 text-[11px] font-sans font-medium transition-colors cursor-pointer rounded-xs ${
                dateFilterMode === "month"
                  ? "bg-brand-primary text-brand-surface-lowest font-semibold"
                  : "bg-brand-surface-lowest text-brand-on-surface-variant hover:text-brand-primary border border-brand-surface-highest"
              }`}
            >
              By Month
            </button>

            <button
              onClick={() => {
                setDateFilterMode("date");
                if (!selectedDate) {
                  const now = new Date();
                  setSelectedDate(
                    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
                      now.getDate()
                    ).padStart(2, "0")}`
                  );
                }
              }}
              className={`px-2.5 py-1 text-[11px] font-sans font-medium transition-colors cursor-pointer rounded-xs ${
                dateFilterMode === "date"
                  ? "bg-brand-primary text-brand-surface-lowest font-semibold"
                  : "bg-brand-surface-lowest text-brand-on-surface-variant hover:text-brand-primary border border-brand-surface-highest"
              }`}
            >
              By Date
            </button>
          </div>

          {/* Sub-controls based on chosen date mode */}
          {dateFilterMode === "year" && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-mono text-brand-secondary">Year:</span>
              {STATIC_AVAILABLE_YEARS.map((yr) => (
                <button
                  key={yr}
                  type="button"
                  onClick={() => setSelectedYear(selectedYear === yr ? null : yr)}
                  className={`px-2.5 py-0.5 text-xs font-mono rounded-xs cursor-pointer transition-colors ${
                    selectedYear === yr
                      ? "bg-brand-accent text-brand-accent-ink font-bold"
                      : "bg-brand-surface-lowest border border-brand-surface-highest text-brand-on-surface hover:border-brand-primary"
                  }`}
                >
                  {yr}
                </button>
              ))}
            </div>
          )}

          {dateFilterMode === "month" && (
            <div className="space-y-2 pt-1">
              {/* Year selector for month */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-mono text-brand-secondary">Year:</span>
                {STATIC_AVAILABLE_YEARS.map((yr) => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => setSelectedMonthYear(yr)}
                    className={`px-2 py-0.5 text-xs font-mono rounded-xs cursor-pointer transition-colors ${
                      selectedMonthYear === yr
                        ? "bg-brand-primary text-brand-surface-lowest font-bold"
                        : "bg-brand-surface-lowest border border-brand-surface-highest text-brand-on-surface hover:border-brand-primary"
                    }`}
                  >
                    {yr}
                  </button>
                ))}
              </div>

              {/* Month pills */}
              <div className="flex flex-wrap items-center gap-1">
                <span className="text-[11px] font-mono text-brand-secondary mr-0.5">Month:</span>
                {MONTH_NAMES.map((m) => {
                  const isSelected = selectedMonthNum === m.num;
                  return (
                    <button
                      key={m.num}
                      type="button"
                      onClick={() => setSelectedMonthNum(isSelected ? null : m.num)}
                      className={`px-2 py-0.5 text-[11px] font-mono rounded-xs cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-brand-accent text-brand-accent-ink font-bold"
                          : "bg-brand-surface-lowest border border-brand-surface-highest text-brand-on-surface-variant hover:text-brand-primary hover:border-brand-primary"
                      }`}
                    >
                      {m.short}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {dateFilterMode === "date" && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] font-mono text-brand-secondary">Date:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-brand-surface-lowest border border-brand-surface-highest px-3 py-1 text-xs font-mono text-brand-on-surface rounded-xs outline-none focus:border-brand-primary cursor-pointer transition-colors"
              />
              <button
                type="button"
                onClick={() => {
                  const now = new Date();
                  setSelectedDate(
                    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
                      now.getDate()
                    ).padStart(2, "0")}`
                  );
                }}
                className="px-2.5 py-1 text-[10px] font-mono text-brand-secondary hover:text-brand-primary border border-brand-surface-highest bg-brand-surface-lowest rounded-xs cursor-pointer hover:border-brand-primary transition-colors"
              >
                Today
              </button>
            </div>
          )}
        </div>

        {/* Results summary bar */}
        {isSearching && (
          <div className="flex items-center justify-between text-[11px] font-mono text-brand-on-surface-variant pb-2 border-b border-brand-surface-highest/60 mb-3">
            <span>
              {totalResultsCount === 0
                ? "No matches found"
                : `${totalResultsCount} result${totalResultsCount === 1 ? "" : "s"} found`}
            </span>
            {isFilterActive && (
              <span className="text-[10px] text-brand-accent font-semibold tracking-wide">
                {dateFilterMode === "year" && `Filtered: ${selectedYear || "Any Year"}`}
                {dateFilterMode === "month" &&
                  `Filtered: ${
                    selectedMonthNum
                      ? `${MONTH_NAMES[selectedMonthNum - 1]?.short} ${selectedMonthYear}`
                      : selectedMonthYear
                  }`}
                {dateFilterMode === "date" && `Filtered: ${selectedDate}`}
              </span>
            )}
          </div>
        )}

        {/* Results scroll area */}
        <div className="max-h-[300px] md:max-h-[340px] overflow-y-auto space-y-6 pr-1 whitespace-normal">
          {!isSearching ? (
            <div className="text-center py-8 text-brand-on-surface-variant/60">
              <span className="font-mono text-xs">
                Search across all posts, notes & docs by keywords or date filters.
              </span>
            </div>
          ) : totalResultsCount === 0 ? (
            <div className="text-center py-8">
              <span className="font-mono text-xs text-rose-700 font-bold">No results found</span>
              <p className="font-sans text-xs text-brand-on-surface-variant mt-1">
                Try adjusting your keywords or date criteria.
              </p>
            </div>
          ) : (
            <>
              {/* Notes matches */}
              {matchedNotes.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-sans text-[11px] font-bold text-brand-secondary tracking-widest uppercase border-b border-brand-surface-highest pb-1.5">
                    Notes ({matchedNotes.length})
                  </h4>
                  <div className="space-y-2.5">
                    {matchedNotes.map((item) => (
                      <div
                        key={item.id}
                        className="p-3.5 border border-brand-surface-highest bg-brand-surface-low/40 hover:bg-brand-surface-low cursor-pointer flex justify-between items-start gap-4 rounded-xs transition-colors group"
                        onClick={() => {
                          navigate("/notes");
                          handleClose();
                          setTimeout(() => {
                            document
                              .getElementById(item.id)
                              ?.scrollIntoView({ behavior: "smooth", block: "center" });
                          }, 300);
                        }}
                      >
                        <div className="min-w-0 flex-1 space-y-1.5">
                          <div className="flex items-center gap-2 font-mono text-[9px] text-brand-secondary tracking-wider uppercase">
                            <span className="font-semibold text-brand-primary">NOTE</span>
                            <span>•</span>
                            <span>{item.formattedDate}</span>
                            {item.raw.tags && item.raw.tags.length > 0 && (
                              <>
                                <span>•</span>
                                <span className="text-brand-accent">#{item.raw.tags[0]}</span>
                              </>
                            )}
                          </div>
                          <p className="font-sans text-sm text-brand-primary line-clamp-2 leading-relaxed font-normal">
                            {item.snippet}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-brand-secondary shrink-0 group-hover:translate-x-0.5 transition-transform mt-1" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Blog matches */}
              {matchedBlogs.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-sans text-[11px] font-bold text-brand-secondary tracking-widest uppercase border-b border-brand-surface-highest pb-1.5">
                    Blog Posts ({matchedBlogs.length})
                  </h4>
                  <div className="space-y-2.5">
                    {matchedBlogs.map((item) => (
                      <div
                        key={item.id}
                        className="p-3.5 border border-brand-surface-highest bg-brand-surface-low/40 hover:bg-brand-surface-low cursor-pointer flex justify-between items-start gap-4 rounded-xs transition-colors group"
                        onClick={() => {
                          navigate(`/post/${item.id}`);
                          handleClose();
                        }}
                      >
                        <div className="min-w-0 flex-1 space-y-1.5">
                          <div className="flex items-center gap-2 font-mono text-[9px] text-brand-secondary tracking-wider uppercase">
                            <span className="font-semibold text-brand-primary">{item.raw.category}</span>
                            <span>•</span>
                            <span>{item.raw.date}</span>
                          </div>
                          <h4 className="font-sans text-sm font-bold text-brand-primary group-hover:text-brand-accent transition-colors leading-snug">
                            {item.raw.title}
                          </h4>
                          {item.snippet && (
                            <p className="font-sans text-xs text-brand-on-surface-variant line-clamp-2 leading-relaxed">
                              {item.snippet}
                            </p>
                          )}
                        </div>
                        <ArrowRight className="w-4 h-4 text-brand-secondary shrink-0 group-hover:translate-x-0.5 transition-transform mt-1" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Docs matches */}
              {matchedDocs.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-sans text-[11px] font-bold text-brand-secondary tracking-widest uppercase border-b border-brand-surface-highest pb-1.5">
                    Docs ({matchedDocs.length})
                  </h4>
                  <div className="space-y-2.5">
                    {matchedDocs.map((ch) => (
                      <div
                        key={`${ch.bookId}-${ch.id}`}
                        className="p-3.5 border border-brand-surface-highest bg-brand-surface-low/40 hover:bg-brand-surface-low cursor-pointer flex justify-between items-start gap-4 rounded-xs transition-colors group"
                        onClick={() => {
                          navigate(`/docs/${ch.bookId}/${ch.id}`);
                          handleClose();
                        }}
                      >
                        <div className="min-w-0 flex-1 space-y-1.5">
                          <div className="flex items-center gap-2 font-mono text-[9px] text-brand-secondary tracking-wider uppercase">
                            <span className="font-semibold text-brand-primary">{ch.bookTitle}</span>
                          </div>
                          <h4 className="font-sans text-sm font-bold text-brand-primary group-hover:text-brand-accent transition-colors leading-snug">
                            {ch.title}
                          </h4>
                          {ch.snippet && (
                            <p className="font-sans text-xs text-brand-on-surface-variant line-clamp-2 leading-relaxed">
                              {ch.snippet}
                            </p>
                          )}
                        </div>
                        <ArrowRight className="w-4 h-4 text-brand-secondary shrink-0 group-hover:translate-x-0.5 transition-transform mt-1" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Publication matches */}
              {matchedPublications.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-sans text-[11px] font-bold text-brand-secondary tracking-widest uppercase border-b border-brand-surface-highest pb-1.5">
                    Publications ({matchedPublications.length})
                  </h4>
                  <div className="space-y-2.5">
                    {matchedPublications.map((pub) => (
                      <div
                        key={pub.id}
                        className="p-3.5 border border-brand-surface-highest bg-brand-surface-low/40 hover:bg-brand-surface-low cursor-default flex justify-between items-start gap-4 rounded-xs"
                      >
                        <div className="min-w-0 flex-1 space-y-1.5">
                          <div className="flex items-center gap-2 font-mono text-[9px] text-brand-secondary tracking-wider uppercase">
                            <span className="font-semibold text-brand-primary">{pub.raw.journal}</span>
                            <span>•</span>
                            <span>{pub.year}</span>
                          </div>
                          <h4 className="font-serif text-sm font-bold text-brand-primary leading-snug">
                            {pub.raw.title}
                          </h4>
                          {pub.snippet && (
                            <p className="font-sans text-xs text-brand-on-surface-variant line-clamp-2 leading-relaxed">
                              {pub.snippet}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(pub.raw.doi);
                            triggerToast("Copied DOI");
                            handleClose();
                          }}
                          className="font-mono text-[9px] font-bold tracking-widest uppercase text-brand-secondary border border-brand-surface-highest bg-brand-surface-low hover:border-brand-accent hover:text-brand-accent px-3 py-1.5 shrink-0 ml-4 transition-colors cursor-pointer rounded-xs"
                        >
                          DOI
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
