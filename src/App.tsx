/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";

// Components Imports
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomeView from "./components/HomeView";
import BlogView from "./components/BlogView";
import BookdownView from "./components/BookdownView";
import AboutView from "./components/AboutView";
import NotesView from "./components/NotesView";
import ContactModal from "./components/ContactModal";
import SearchModal from "./components/SearchModal";

// Data & Types Imports
import { blogPosts } from "./lib/blog-loader";
import { useTheme } from "./lib/theme";

export default function App() {
  const { preference, resolvedTheme, isDark, setPreference } = useTheme();
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [contactOpen, setContactOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Keyboard shortcut listener (Cmd/Ctrl+K or '/' to open, Esc handled in modal)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      } else if (e.key === "/" && !searchOpen) {
        const activeEl = document.activeElement;
        const isInput = activeEl && (
          activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          (activeEl as HTMLElement).isContentEditable
        );
        if (!isInput) {
          e.preventDefault();
          setSearchOpen(true);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchOpen]);

  // Sync state with browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Update document title based on currentPath
  useEffect(() => {
    const cleanPath = currentPath.replace(/^\/+|\/+$/g, "");
    if (cleanPath.startsWith("post/")) {
      const postId = cleanPath.substring("post/".length);
      const post = blogPosts.find((p) => p.id === postId);
      document.title = post ? `${post.title} — Xuan Tung Hoang` : "Xuan Tung Hoang";
    } else if (cleanPath === "blog" || cleanPath.startsWith("blog/")) {
      document.title = "Blog — Xuan Tung Hoang";
    } else if (cleanPath === "notes" || cleanPath.startsWith("notes/")) {
      document.title = "Notes — Xuan Tung Hoang";
    } else if (cleanPath === "docs" || cleanPath.startsWith("docs/")) {
      document.title = "Docs — Xuan Tung Hoang";
    } else if (cleanPath === "about" || cleanPath.startsWith("about/")) {
      document.title = "About — Xuan Tung Hoang";
    } else {
      document.title = "Xuan Tung Hoang";
    }
  }, [currentPath]);

  // Navigate helper
  const navigate = (path: string) => {
    if (path === currentPath) return;
    window.history.pushState({}, "", path);
    setCurrentPath(path);
    window.scrollTo(0, 0);
  };

  // Toast notification trigger
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  // Derived state: Active Tab
  const activeTab = useMemo(() => {
    const cleanPath = currentPath.replace(/^\/+|\/+$/g, "");
    if (cleanPath.startsWith("post/") || cleanPath === "blog" || cleanPath.startsWith("blog/")) {
      return "blog";
    }
    if (cleanPath.startsWith("notes") || cleanPath.startsWith("notes/")) {
      return "notes";
    }
    if (cleanPath.startsWith("docs") || cleanPath.startsWith("docs/")) {
      return "docs";
    }
    if (cleanPath === "about") {
      return "about";
    }
    return "home";
  }, [currentPath]);

  // Check if current route is a bookdown reader view
  const isBookdownReader = useMemo(() => {
    const cleanPath = currentPath.replace(/^\/+|\/+$/g, "");
    const parts = cleanPath.split("/");
    return parts[0] === "docs" && parts.length >= 2;
  }, [currentPath]);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-brand-bg text-brand-on-surface antialiased selection:bg-brand-accent selection:text-brand-accent-ink">
      {/* TOAST SYSTEM NOTIFICATION */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-brand-primary text-brand-surface-lowest font-mono text-[11px] font-bold px-4 py-2 rounded-full shadow-lg border border-brand-surface-highest tracking-wider uppercase select-none pointer-events-auto"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOATING ACRYLIC NAVBAR */}
      {!isBookdownReader && (
        <Navbar
          activeTab={activeTab}
          onNavigate={navigate}
          onContactClick={() => setContactOpen(true)}
          onSearchToggle={() => setSearchOpen(true)}
          themePreference={preference}
          resolvedTheme={resolvedTheme}
          isDark={isDark}
          onSetTheme={setPreference}
        />
      )}

      {/* PRIMARY VIEWER PORTAL */}
      <main className="flex-1 pt-16">
        {activeTab === "home" && (
          <motion.div
            key="home-tab"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <BlogView
              currentPath={currentPath}
              navigate={navigate}
              onContactClick={() => setContactOpen(true)}
              onLinkHighlight={() => triggerToast("NAVIGATING OUTSIDE SANDBOX")}
            />
          </motion.div>
        )}

        {activeTab === "docs" && (
          <motion.div
            key="docs-tab"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <BookdownView
              currentPath={currentPath}
              navigate={navigate}
              themePreference={preference}
              resolvedTheme={resolvedTheme}
              isDark={isDark}
              onSetTheme={setPreference}
            />
          </motion.div>
        )}

        {activeTab === "notes" && (
          <motion.div
            key="notes-tab"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <NotesView />
          </motion.div>
        )}

        {activeTab === "about" && (
          <motion.div
            key="about-tab"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <AboutView onContactClick={() => setContactOpen(true)} />
          </motion.div>
        )}
      </main>

      {/* FOOTER Wordmark & Profiles links */}
      {!isBookdownReader && (
        <Footer onLinkHighlight={() => triggerToast("OPENING ACCAL REPO LINK")} />
      )}

      {/* COLLABORATIVE CONTACT DIALOGUE FORM */}
      <ContactModal
        isOpen={contactOpen}
        onClose={() => setContactOpen(false)}
      />

      {/* GLOBAL SEARCH MODAL (ISOLATED & HIGH PERFORMANCE) */}
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        navigate={navigate}
        triggerToast={triggerToast}
      />
    </div>
  );
}
