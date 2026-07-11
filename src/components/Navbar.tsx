/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Menu, X, Home, BookOpen, FolderGit2, Mail } from "lucide-react";

interface NavbarProps {
  activeTab: "home" | "blog" | "project";
  onNavigate: (path: string) => void;
  onContactClick: () => void;
  onSearchToggle?: () => void;
}

const navItems = [
  { key: "home", label: "Home", path: "/", Icon: Home },
  { key: "blog", label: "Blog", path: "/blog", Icon: BookOpen },
  { key: "project", label: "Project", path: "/project", Icon: FolderGit2 },
] as const;

export default function Navbar({
  activeTab,
  onNavigate,
  onContactClick,
  onSearchToggle
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 transition-all duration-300 bg-brand-surface-lowest/85 backdrop-blur-md border-b border-brand-surface-highest">
      <div className="max-w-container-max mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={() => {
            onNavigate("/");
            setMobileMenuOpen(false);
          }}
          className="font-serif font-semibold text-base md:text-lg text-brand-primary tracking-tight hover:opacity-80 transition-opacity text-left outline-none cursor-pointer"
        >
          Tung Hoang
        </button>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map(({ key, label, path }) => (
            <button
              key={key}
              onClick={() => onNavigate(path)}
              className={`font-sans text-sm tracking-wide transition-all uppercase font-medium border-b-2 py-1 outline-none cursor-pointer ${activeTab === key
                ? "border-brand-primary text-brand-primary font-bold"
                : "border-transparent text-brand-on-surface-variant hover:text-brand-primary hover:border-brand-surface-highest"
                }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-1 sm:gap-3">
          <button
            onClick={onSearchToggle}
            aria-label="Search posts"
            className="w-9 h-9 flex items-center justify-center text-brand-on-surface-variant hover:text-brand-primary hover:bg-brand-surface-low rounded-full transition-colors cursor-pointer"
          >
            <Search className="w-[18px] h-[18px]" />
          </button>

          {/* Contact — desktop only; on mobile it lives inside the drawer */}
          <button
            onClick={onContactClick}
            className="hidden md:block font-sans rounded-none font-semibold text-[11px] tracking-wider uppercase bg-brand-accent text-brand-accent-ink border border-brand-accent hover:bg-transparent hover:text-brand-accent px-5 py-2.5 transition-all duration-200 cursor-pointer"
          >
            Contact
          </button>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            className="md:hidden w-9 h-9 flex items-center justify-center text-brand-primary hover:bg-brand-surface-low rounded-full transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="md:hidden overflow-hidden border-b border-brand-surface-highest bg-brand-surface-lowest"
          >
            <div className="px-3 py-3 flex flex-col gap-1">
              {navItems.map(({ key, label, path, Icon }) => {
                const active = activeTab === key;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      onNavigate(path);
                      setMobileMenuOpen(false);
                    }}
                    className={`group flex items-center justify-between px-3.5 py-3 rounded-xl transition-colors ${active
                      ? "bg-brand-accent/10 text-brand-primary"
                      : "text-brand-on-surface-variant hover:bg-brand-surface-low active:bg-brand-surface-high"
                      }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon
                        className={`w-[18px] h-[18px] transition-colors ${active ? "text-brand-accent" : "text-brand-on-surface-variant group-hover:text-brand-primary"
                          }`}
                      />
                      <span className="font-sans text-sm font-semibold tracking-wide uppercase">
                        {label}
                      </span>
                    </span>
                    {active && <span className="w-1.5 h-1.5 rounded-full bg-brand-accent" />}
                  </button>
                );
              })}

              {/* Divider */}
              <div className="h-px bg-brand-surface-highest my-2 mx-1.5" />

              {/* Contact */}
              <button
                onClick={() => {
                  onContactClick();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 bg-brand-accent text-brand-accent-ink py-3 rounded-xl font-sans font-semibold text-[11px] tracking-widest uppercase hover:bg-cyan-800 transition-colors cursor-pointer"
              >
                <Mail className="w-4 h-4" />
                Contact
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
