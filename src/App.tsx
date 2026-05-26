/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  X,
  FileText,
  Bookmark,
  ArrowRight,
  Clipboard,
  ExternalLink
} from "lucide-react";

// Components Imports
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomeView from "./components/HomeView";
import BlogView from "./components/BlogView";
import BookdownView from "./components/BookdownView";
import ContactModal from "./components/ContactModal";

// Data & Types Imports
import { selectedPublications } from "./data";
import { blogPosts } from "./lib/blog-loader";
import { SelectedPublication, BlogPost } from "./types";

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [contactOpen, setContactOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync state with browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = (path: string) => {
    if (window.location.pathname !== path) {
      window.history.pushState(null, "", path);
      setCurrentPath(path);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Derive activeTab from currentPath
  const getActiveTab = (path: string): "home" | "blog" | "bookdown" => {
    const cleanPath = path.replace(/^\/+|\/+$/g, "");
    if (cleanPath.startsWith("blog") || cleanPath.startsWith("post/")) {
      return "blog";
    }
    if (cleanPath.startsWith("bookdown")) {
      return "bookdown";
    }
    return "home";
  };

  const activeTab = getActiveTab(currentPath);

  const isBookdownReader = useMemo(() => {
    const cleanPath = currentPath.replace(/^\/+|\/+$/g, "");
    if (cleanPath.startsWith("bookdown/")) {
      const parts = cleanPath.substring("bookdown/".length).split("/");
      return !!parts[0];
    }
    return false;
  }, [currentPath]);

  // Trigger quick interactive notification
  const triggerToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Compute search results across all publications & blogs
  const matchedPublications = selectedPublications.filter(
    (pub) =>
      pub.title.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
      pub.abstract.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
      pub.journal.toLowerCase().includes(globalSearchQuery.toLowerCase())
  );

  const matchedBlogs = blogPosts.filter(
    (post) =>
      post.title.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
      post.abstract.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
      post.category.toLowerCase().includes(globalSearchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-brand-bg text-brand-on-surface flex flex-col justify-between selection:bg-brand-primary selection:text-white">
      {/* Dynamic Toast feedback */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-brand-primary text-white text-xs font-mono tracking-widest px-6 py-3 border border-brand-surface-high shadow-lg"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* FIXED NAVIGATION HEADER */}
      {!isBookdownReader && (
        <Navbar
          activeTab={activeTab}
          onNavigate={navigate}
          onContactClick={() => setContactOpen(true)}
          onSearchToggle={() => setSearchOpen(true)}
        />
      )}

      {/* PRIMARY VIEWER PORTAL */}
      <main className={`flex-1 ${isBookdownReader ? "pt-0" : "pt-20"}`}>
        <AnimatePresence mode="wait">
          {activeTab === "home" && (
            <motion.div
              key="home-tab"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <HomeView
                onNavigate={navigate}
                onContactClick={() => setContactOpen(true)}
              />
            </motion.div>
          )}

          {activeTab === "blog" && (
            <motion.div
              key="blog-tab"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <BlogView
                currentPath={currentPath}
                navigate={navigate}
                onContactClick={() => setContactOpen(true)}
                onLinkHighlight={() => triggerToast("NAVIGATING OUTSIDE SANDBOX")}
              />
            </motion.div>
          )}

          {activeTab === "bookdown" && (
            <motion.div
              key="bookdown-tab"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <BookdownView
                currentPath={currentPath}
                navigate={navigate}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* FOOTER Wordmark & Profiles links */}
      {!isBookdownReader && (
        <Footer onLinkHighlight={() => triggerToast("OPENING ACCAL REPO LINK")} />
      )}

      {/* COLLABORATIVE CONTACT DIALOGUE FORM */}
      <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />

      {/* GLOBAL SEARCH DIALOG DRAWER */}
      <AnimatePresence>
        {searchOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[10vh]">
            {/* Blur dark shield */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setSearchOpen(false);
                setGlobalSearchQuery("");
              }}
              className="absolute inset-0 bg-brand-primary/40 backdrop-blur-sm"
            />

            {/* Popup Box */}
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              className="relative w-full max-w-2xl bg-brand-surface-lowest border border-brand-surface-highest shadow-2xl p-6 z-10 rounded-none overflow-hidden"
            >
              <div className="flex justify-between items-center border-b border-brand-surface-highest pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-brand-secondary" />
                  <span className="font-serif font-bold text-lg text-brand-primary">Search Portal</span>
                </div>
                <button
                  onClick={() => {
                    setSearchOpen(false);
                    setGlobalSearchQuery("");
                  }}
                  className="w-8 h-8 flex items-center justify-center hover:bg-brand-surface-low text-brand-on-surface-variant hover:text-brand-primary transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Text Input */}
              <input
                type="text"
                autoFocus
                value={globalSearchQuery}
                onChange={(e) => setGlobalSearchQuery(e.target.value)}
                placeholder="Type keywords (e.g. biophysics, transformer, ggplot2)..."
                className="w-full bg-brand-surface-low border border-brand-surface-highest focus:border-brand-primary outline-none px-4 py-3.5 text-sm rounded-none text-brand-on-surface placeholder:text-brand-on-surface-variant/40"
              />

              {/* Dynamic search outputs layout portal */}
              <div className="mt-6 max-h-[360px] overflow-y-auto space-y-6 pr-1 whitespace-normal">
                {globalSearchQuery === "" ? (
                  <div className="text-center py-8 text-brand-on-surface-variant/60">
                    <span className="font-mono text-xs">Search across Tung's website in real-time.</span>
                  </div>
                ) : matchedPublications.length === 0 && matchedBlogs.length === 0 ? (
                  <div className="text-center py-8">
                    <span className="font-mono text-xs text-rose-700 font-bold">ZERO RECORDS MATCHED</span>
                    <p className="font-sans text-xs text-brand-on-surface-variant mt-1">Try searching broader tags or parameters.</p>
                  </div>
                ) : (
                  <>
                    {/* Publication entries matches */}
                    {matchedPublications.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-sans text-[11px] font-bold text-brand-secondary tracking-widest uppercase border-b border-brand-surface-highest pb-1.5">
                          Peer-Reviewed Publications ({matchedPublications.length})
                        </h4>
                        <div className="space-y-2">
                          {matchedPublications.map((pub) => (
                            <div
                              key={pub.id}
                              className="p-3 border border-brand-surface-highest bg-brand-surface-low/50 hover:bg-brand-surface-low cursor-default flex justify-between items-center"
                            >
                              <div>
                                <span className="font-mono text-[9px] text-brand-secondary block tracking-wider uppercase mb-0.5">{pub.journal} • {pub.year}</span>
                                <span className="font-serif text-sm font-bold text-brand-primary block">{pub.title}</span>
                              </div>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(pub.doi);
                                  triggerToast("COPIED DOI TO SYSTEM CLIPBOARD");
                                  setSearchOpen(false);
                                  setGlobalSearchQuery("");
                                }}
                                className="font-mono text-[9px] font-bold tracking-widest uppercase text-brand-secondary border border-brand-surface-highest bg-white hover:border-brand-primary px-3 py-1.5 shrink-0 ml-4 transition-colors cursor-pointer"
                              >
                                Copy DOI
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Blog & chapters matches */}
                    {matchedBlogs.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-sans text-[11px] font-bold text-brand-secondary tracking-widest uppercase border-b border-brand-surface-highest pb-1.5">
                          Preprints & Research Articles ({matchedBlogs.length})
                        </h4>
                        <div className="space-y-2">
                          {matchedBlogs.map((post) => (
                            <div
                              key={post.id}
                              className="p-3 border border-brand-surface-highest bg-brand-surface-low/50 hover:bg-brand-surface-low cursor-default flex justify-between items-center"
                            >
                              <div>
                                <span className="font-mono text-[9px] text-brand-secondary block tracking-wider uppercase mb-0.5">{post.category}</span>
                                <span className="font-serif text-sm font-bold text-brand-primary block">{post.title}</span>
                              </div>
                              <button
                                onClick={() => {
                                  navigate(`/post/${post.id}`);
                                  setSearchOpen(false);
                                  setGlobalSearchQuery("");
                                }}
                                className="font-sans text-[9px] font-bold tracking-widest uppercase text-brand-primary border border-brand-primary bg-white hover:bg-brand-primary hover:text-white px-3 py-1.5 shrink-0 ml-4 transition-colors cursor-pointer"
                              >
                                Read
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
        )}
      </AnimatePresence>
    </div>
  );
}
