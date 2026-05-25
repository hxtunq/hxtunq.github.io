/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  Book,
  ArrowLeft,
  ChevronRight,
  GitBranch,
  Dna,
  TrendingUp,
  Terminal,
  Bug,
  LayoutGrid,
  Copy,
  CheckCircle2,
  BookOpenText,
  Bookmark
} from "lucide-react";
import { bookItems } from "../data";
import { BookItem } from "../types";

export default function BookdownView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBook, setSelectedBook] = useState<BookItem | null>(null);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [copiedCitation, setCopiedCitation] = useState(false);

  const filteredBooks = useMemo(() => {
    return bookItems.filter((book) => {
      return (
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [searchQuery]);

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

  // Pre-compiled chapter contents simulating a high-end educational tool
  const getSimulatedChapterContent = (bookId: string, chapterIndex: number) => {
    const defaultText = {
      title: "Module Overview & Setup",
      contents: "This section configures local pipelines. Ensure your system meets the minimum hardware spec (16GB RAM recommended for large indices). We will load required modules, import environment configuration files, and initialize test data streams to verify compilation paths.",
      code: "# Setup terminal parameters\nexport METAGENOMICS_PATH=/opt/bioinformatics/bin\nexport PATH=$PATH:$METAGENOMICS_PATH\n\n# Test compilation path\nbio_tool --version"
    };

    const datasets: Record<string, typeof defaultText[]> = {
      "book-1": [
        {
          title: "Introduction to Shotgun Sequencing",
          contents: "Shotgun metagenomics provides an untargeted window into the entire genomic content of a microbial community. Unlike 16S amplicon profiling, shotgun datasets capture partial sequences representing viral, bacterial, and eukaryotic kingdoms alike. Users must handle massive volume, requiring optimized fastaq/bam pipelines.",
          code: "# Download raw FASTQ test assets\nwget https://data.microbiome-hub.org/samples/mock_community_R1.fastq.gz\nwget https://data.microbiome-hub.org/samples/mock_community_R2.fastq.gz"
        },
        {
          title: "Quality Control & Adapter Trimming",
          contents: "Raw reads contain PCR adapters, priming artifacts, and low-quality bases. We leverage FastQC for visual analysis, and configure Trimmomatic layers to drop low score bases under Q20 from the ends, with a sliding-window cut size.",
          code: "# Run quality-control pipeline\nfastqc mock_community_R1.fastq.gz\n\n# Execute Trimmomatic base cleanup\njava -jar trimmomatic.jar PE mock_community_R1.fastq.gz mock_community_R2.fastq.gz \\\n  paired_R1_clean.fq unpaired_R1.fq paired_R2_clean.fq unpaired_R2.fq \\\n  ILLUMINACLIP:TruSeq3-PE.fa:2:30:10 LEADING:3 TRAILING:3 SLIDINGWINDOW:4:20 MINLEN:36"
        },
        {
          title: "Taxonomic Profiling Protocols",
          contents: "Identifying 'who' is in the sample. We run Kraken2 against a compressed Standard database, mapping reads directly to taxonomic clades. Results will be saved into classified and unclassified text tables.",
          code: "# Run classification using Kraken2 databases\nkraken2 --db /databases/standard_kraken2 \\\n  --paired paired_R1_clean.fq paired_R2_clean.fq \\\n  --output sample_kraken.out \\\n  --report sample_report.txt"
        }
      ],
      "book-2": [
        {
          title: "Probability Theory Foundations",
          contents: "Statistical inference transitions us from observing sample dynamics to identifying core latent populations. This chapter establishes the axioms of probability, cumulative distribution functions, and discrete distributions (Poisson, Binomial) critical in digital counting systems.",
          code: "# R Script distribution generation\nx <- seq(0, 50, by = 1)\ny_poisson <- dpois(x, lambda = 12)\n\n# Quick visual validation plot\nplot(x, y_poisson, type='h', col='navy', lwd=2,\n     main='Poisson Count Probability Curve')"
        },
        {
          title: "Hypothesis Testing Paradigms",
          contents: "We evaluate empirical samples against Null distributions. In this chapter we break down Type I and Type II testing errors, define statistical power curves, and configure manual ANOVA computations on social questionnaires.",
          code: "# Run student t-test on biological vectors\ntreatment <- c(10.2, 11.4, 12.1, 9.8, 11.0)\ncontrol   <- c(8.5, 9.2, 9.0, 10.1, 8.8)\n\nt.test(treatment, control, var.equal=TRUE)"
        }
      ]
    };

    const bookData = datasets[bookId];
    if (bookData && bookData[chapterIndex]) {
      return bookData[chapterIndex];
    }
    
    // Fallback automatic generator
    const chapterName = selectedBook?.chapters[chapterIndex] || "Module Content";
    return {
      title: chapterName,
      contents: `In this section of "${selectedBook?.title}", we dive deeply into theoretical frameworks, architectural rules, and operational strategies. By defining structural conditions, we compile reproducible methodologies that withstand peer scrutiny. Standard setups involve referencing our helper classes before configuring the core analytical block.`,
      code: `# Standard automated pipeline execution\npython -m ${bookId.replace("-", "_")}_pipeline \\\n  --chapter_idx ${chapterIndex} \\\n  --mode production \\\n  --export_pdf`
    };
  };

  const handleCopyCitation = (bookTitle: string) => {
    navigator.clipboard.writeText(`Sterling, E. (2025). ${bookTitle}: An Open-Source Interactive Tutorial. Academic Lab Bookdowns. https://bookdown.sterling-lab.org/`);
    setCopiedCitation(true);
    setTimeout(() => setCopiedCitation(false), 2000);
  };

  const currentChapter = selectedBook ? getSimulatedChapterContent(selectedBook.id, activeChapterIndex) : null;

  return (
    <div className="max-w-container-max mx-auto px-4 md:px-6 py-12">
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
                  className="w-full bg-brand-surface-low border border-brand-surface-highest focus:border-brand-primary outline-none py-3 pl-10 pr-4 text-xs font-sans tracking-wide text-brand-on-surface transition-all placeholder:text-brand-on-surface-variant/40"
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
                          <span className="font-mono text-[9px] bg-brand-surface-low px-1.5 py-0.25 text-brand-on-surface-variant/70">
                            {book.chapters.length} CHAPTERS
                          </span>
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
                        setSelectedBook(book);
                        setActiveChapterIndex(0);
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
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="border border-brand-surface-highest bg-brand-surface-lowest grid grid-cols-1 md:grid-cols-12 min-h-[600px]"
          >
            {/* Left Hand: Book chapters index listing hierarchy (Cols 4) */}
            <div className="md:col-span-4 bg-brand-surface-low border-b md:border-b-0 md:border-r border-brand-surface-highest p-6 flex flex-col justify-between">
              <div>
                {/* Back link to books catalog */}
                <button
                  onClick={() => setSelectedBook(null)}
                  className="flex items-center gap-1.5 font-sans font-bold text-[10px] tracking-widest uppercase text-brand-secondary hover:text-brand-primary transition-colors mb-8 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Books Catalog</span>
                </button>

                {/* Book specifications header */}
                <div className="mb-8">
                  <div className="font-mono text-[9px] text-brand-secondary tracking-widest uppercase mb-1">
                    ACTIVE LIBRARY
                  </div>
                  <h2 className="font-serif font-bold text-xl text-brand-primary leading-snug">
                    {selectedBook.title}
                  </h2>
                </div>

                {/* Table of Chapters list */}
                <div className="space-y-1.5">
                  <div className="font-sans text-[10px] font-bold text-brand-on-surface-variant/45 tracking-widest uppercase mb-2">
                    Chapters List
                  </div>
                  <div className="space-y-1">
                    {selectedBook.chapters.map((chap, idx) => (
                      <button
                        key={chap}
                        onClick={() => setActiveChapterIndex(idx)}
                        className={`w-full text-left font-sans text-xs px-3 py-2.5 transition-colors border-l-2 flex items-center gap-2 cursor-pointer ${
                          activeChapterIndex === idx
                            ? "bg-brand-surface-lowest text-brand-primary font-bold border-brand-primary"
                            : "text-brand-on-surface-variant border-transparent hover:bg-brand-surface-lowest/40"
                        }`}
                      >
                        <Bookmark className={`w-3.5 h-3.5 shrink-0 ${activeChapterIndex === idx ? "text-brand-primary" : "text-brand-on-surface-variant/30"}`} />
                        <span className="truncate">{chap}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom quick citation copy action */}
              <div className="pt-6 border-t border-brand-surface-highest mt-8 space-y-3">
                <button
                  onClick={() => handleCopyCitation(selectedBook.title)}
                  className="w-full flex items-center justify-center gap-2 font-mono text-[10px] tracking-wider text-brand-on-surface border border-brand-surface-highest hover:bg-white hover:border-brand-primary py-2.5 px-3 transition-all cursor-pointer"
                >
                  {copiedCitation ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Citation Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-brand-secondary" />
                      <span>Copy Cite Vector</span>
                    </>
                  )}
                </button>
                <div className="text-center">
                  <span className="font-sans text-[10px] text-brand-on-surface-variant/40">
                    Open-Source Bookdown Academic License
                  </span>
                </div>
              </div>
            </div>

            {/* Right Hand: Sub-document scrolling reader canvas (Cols 8) */}
            <div className="md:col-span-8 p-6 md:p-10 flex flex-col justify-between">
              {currentChapter ? (
                <div className="space-y-6">
                  {/* Heading header title */}
                  <div className="border-b border-brand-surface-highest pb-4 flex items-center justify-between">
                    <span className="font-mono text-[10px] text-brand-secondary">
                      Section {activeChapterIndex + 1}
                    </span>
                    <span className="font-sans text-[10px] bg-brand-surface-low border border-brand-surface-highest text-brand-on-surface-variant px-2.5 py-0.5">
                      COMPUTATION_READY
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-2xl text-brand-primary tracking-tight">
                    {currentChapter.title}
                  </h3>

                  {/* Body text content */}
                  <p className="font-sans text-sm text-brand-on-surface-variant leading-relaxed">
                    {currentChapter.contents}
                  </p>

                  {/* Dynamic coding exercises window */}
                  <div className="border border-brand-surface-highest bg-[#0d1522] rounded-[0.25rem] overflow-hidden my-6">
                    <div className="bg-[#080d16] border-b border-brand-primary/10 px-4 py-2 font-mono text-[9px] text-slate-400 select-none flex items-center gap-1.5">
                      <Terminal className="w-3 h-3 text-cyan-400" />
                      <span>Interactive Bookdown Code Console</span>
                    </div>
                    <div className="p-4 overflow-x-auto">
                      <pre className="font-mono text-xs text-lime-400 text-left">
                        {currentChapter.code}
                      </pre>
                    </div>
                  </div>

                  <p className="font-sans text-xs text-brand-on-surface-variant/70 italic mt-4">
                    Modify parameters directly or port this workflow snippet directly into RStudio / Posit environments to execute calculations. All supporting files are accessible under GNU research repositories.
                  </p>
                </div>
              ) : (
                <div className="text-center py-20 text-brand-on-surface-variant">
                  <BookOpenText className="w-8 h-8 mx-auto opacity-30 mb-2" />
                  <span>Chapter not synchronized.</span>
                </div>
              )}

              {/* Prev / Next controls for chapter index inside ebook reader */}
              <div className="mt-12 pt-6 border-t border-brand-surface-highest flex justify-between items-center bg-brand-surface-low/30 p-4">
                <button
                  disabled={activeChapterIndex === 0}
                  onClick={() => setActiveChapterIndex(activeChapterIndex - 1)}
                  className="font-sans font-bold text-[10px] tracking-widest text-brand-secondary hover:text-brand-primary transition-all disabled:opacity-35 cursor-pointer uppercase"
                >
                  &larr; Prev Chapter
                </button>
                <span className="font-mono text-[10px] text-brand-secondary font-semibold">
                  {activeChapterIndex + 1} of {selectedBook.chapters.length}
                </span>
                <button
                  disabled={activeChapterIndex === selectedBook.chapters.length - 1}
                  onClick={() => setActiveChapterIndex(activeChapterIndex + 1)}
                  className="font-sans font-bold text-[10px] tracking-widest text-brand-primary hover:text-brand-secondary transition-all disabled:opacity-35 cursor-pointer uppercase"
                >
                  Next Chapter &rarr;
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
