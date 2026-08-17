/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Menu, X, Home, BookOpen, FolderGit2, Mail, User, MessageSquare } from "lucide-react";
import NavSky from "./NavSky";

import { bookItems } from "../lib/book-loader";

interface NavbarProps {
  activeTab: "home" | "blog" | "notes" | "docs" | "about";
  onNavigate: (path: string) => void;
  onContactClick: () => void;
  onSearchToggle?: () => void;
}

const navItems = [
  { key: "home", label: "Home", path: "/", Icon: Home },
  { key: "blog", label: "Blog", path: "/blog", Icon: BookOpen },
  { key: "notes", label: "Notes", path: "/notes", Icon: MessageSquare },
  ...(bookItems.length > 0 ? [{ key: "docs" as const, label: "Docs", path: "/docs", Icon: FolderGit2 }] : []),
  { key: "about", label: "About", path: "/about", Icon: User },
] as const;

export default function Navbar({
  activeTab,
  onNavigate,
  onContactClick,
  onSearchToggle
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 px-4 md:px-6 py-2.5 bg-brand-bg">
      <div className="max-w-container-max mx-auto h-11 px-5 md:px-6 flex items-center justify-between rounded-full bg-brand-nav border border-brand-nav-border">
        {/* Brand Logo - Left Side */}
        <button
          onClick={() => {
            onNavigate("/");
            setMobileMenuOpen(false);
          }}
          className="font-sans font-medium text-[13px] tracking-wide text-brand-primary hover:opacity-80 transition-opacity text-left outline-none cursor-pointer"
        >
          Tung Hoang
        </button>

        <NavSky />

        {/* Right Group: Tabs & Search Action */}
        <div className="flex items-center gap-8 ml-auto">
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map(({ key, label, path }) => (
              <button
                key={key}
                onClick={() => onNavigate(path)}
                className={`font-sans text-[13px] tracking-wide transition-all font-medium border-b-2 py-1 outline-none cursor-pointer ${activeTab === key
                  ? "border-brand-primary text-brand-primary font-bold"
                  : "border-transparent text-brand-on-surface-variant hover:text-brand-primary hover:border-brand-surface-highest"
                  }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Quick Actions (Search and Mobile Hamburger menu) */}
          <div className="flex items-center gap-1 sm:gap-3">
            <button
              onClick={onSearchToggle}
              aria-label="Search posts"
              className="w-9 h-9 flex items-center justify-center text-brand-on-surface-variant hover:text-brand-primary hover:bg-brand-surface-high rounded-full transition-colors cursor-pointer"
            >
              <Search className="w-[18px] h-[18px]" />
            </button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              className="md:hidden w-9 h-9 flex items-center justify-center text-brand-primary hover:bg-brand-surface-high rounded-full transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden fixed inset-0 top-16 bg-black/20 z-40"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Menu panel */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="md:hidden absolute top-[60px] left-4 right-4 z-50 rounded-2xl overflow-hidden bg-brand-nav border border-brand-nav-border shadow-lg"
            >
              <div className="px-4 py-4 flex flex-col gap-1">
                {navItems.map(({ key, label, path, Icon }, idx) => {
                  const active = activeTab === key;
                  return (
                    <motion.button
                      key={key}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: idx * 0.04, ease: "easeOut" }}
                      onClick={() => {
                        onNavigate(path);
                        setMobileMenuOpen(false);
                      }}
                      className={`group flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all duration-200 cursor-pointer ${active
                        ? "bg-brand-accent/10 text-brand-primary"
                        : "text-brand-on-surface-variant hover:bg-brand-surface-high active:scale-[0.98]"
                        }`}
                    >
                      <div className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${active
                        ? "bg-brand-accent/15 text-brand-accent"
                        : "bg-brand-surface-high text-brand-on-surface-variant group-hover:text-brand-primary"
                        }`}>
                        <Icon className="w-[16px] h-[16px]" />
                      </div>
                      <span className={`font-sans text-[13.5px] tracking-wide ${active ? "font-bold" : "font-medium"}`}>
                        {label}
                      </span>
                      {active && (
                        <motion.span
                          layoutId="mobile-active-dot"
                          className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-accent"
                        />
                      )}
                    </motion.button>
                  );
                })}

                {/* Divider */}
                <div className="h-px bg-brand-surface-highest my-2 mx-2" />

                {/* Contact button */}
                <motion.button
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: navItems.length * 0.04, ease: "easeOut" }}
                  onClick={() => {
                    onContactClick();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-brand-on-surface-variant hover:bg-brand-surface-high active:scale-[0.98] transition-all duration-200 cursor-pointer"
                >
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-brand-surface-high text-brand-on-surface-variant">
                    <Mail className="w-[16px] h-[16px]" />
                  </div>
                  <span className="font-sans text-[13.5px] tracking-wide font-medium">Contact</span>
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
