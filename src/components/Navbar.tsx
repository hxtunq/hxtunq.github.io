/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import React, { useState } from "react";
import { Search, Menu, X } from "lucide-react";

interface NavbarProps {
  activeTab: "home" | "blog" | "bookdown";
  onNavigate: (path: string) => void;
  onContactClick: () => void;
  onSearchToggle?: () => void;
}

export default function Navbar({
  activeTab,
  onNavigate,
  onContactClick,
  onSearchToggle
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full bg-brand-surface-lowest/90 backdrop-blur-md z-50 border-b border-brand-surface-highest transition-all duration-300">
      <div className="max-w-container-max mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={() => {
            onNavigate("/");
            setMobileMenuOpen(false);
          }}
          className="font-serif font-bold text-xl md:text-2xl text-brand-primary hover:opacity-80 transition-opacity text-left outline-none cursor-pointer"
        >
          Xuan Tung Hoang
        </button>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <button
            onClick={() => onNavigate("/")}
            className={`font-sans text-sm tracking-wide transition-all uppercase font-medium border-b-2 py-1 outline-none cursor-pointer ${activeTab === "home"
              ? "border-brand-primary text-brand-primary font-bold"
              : "border-transparent text-brand-on-surface-variant hover:text-brand-primary hover:border-brand-surface-highest"
              }`}
          >
            Home
          </button>
          <button
            onClick={() => onNavigate("/blog")}
            className={`font-sans text-sm tracking-wide transition-all uppercase font-medium border-b-2 py-1 outline-none cursor-pointer ${activeTab === "blog"
              ? "border-brand-primary text-brand-primary font-bold"
              : "border-transparent text-brand-on-surface-variant hover:text-brand-primary hover:border-brand-surface-highest"
              }`}
          >
            Blog
          </button>
          <button
            onClick={() => onNavigate("/bookdown")}
            className={`font-sans text-sm tracking-wide transition-all uppercase font-medium border-b-2 py-1 outline-none cursor-pointer ${activeTab === "bookdown"
              ? "border-brand-primary text-brand-primary font-bold"
              : "border-transparent text-brand-on-surface-variant hover:text-brand-primary hover:border-brand-surface-highest"
              }`}
          >
            Bookdown
          </button>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onSearchToggle}
            aria-label="Search posts"
            className="w-9 h-9 flex items-center justify-center text-brand-on-surface-variant hover:text-brand-primary hover:bg-brand-surface-low rounded-full transition-colors cursor-pointer"
          >
            <Search className="w-[18px] h-[18px]" />
          </button>

          <button
            onClick={onContactClick}
            className="hidden sm:block font-sans rounded-none font-semibold text-[11px] tracking-wider uppercase bg-brand-primary text-white border border-brand-primary hover:bg-transparent hover:text-brand-primary px-5 py-2.5 transition-all duration-200 cursor-pointer"
          >
            Contact
          </button>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-9 h-9 flex items-center justify-center text-brand-on-surface hover:bg-brand-surface-low rounded-lg transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-brand-surface-lowest border-b border-brand-surface-highest py-4 px-6 flex flex-col gap-4 shadow-sm animate-fade-in">
          <button
            onClick={() => {
              onNavigate("/");
              setMobileMenuOpen(false);
            }}
            className={`text-left font-sans text-sm tracking-widest uppercase font-semibold py-2 ${activeTab === "home" ? "text-brand-primary" : "text-brand-on-surface-variant"
              }`}
          >
            Home
          </button>
          <button
            onClick={() => {
              onNavigate("/blog");
              setMobileMenuOpen(false);
            }}
            className={`text-left font-sans text-sm tracking-widest uppercase font-semibold py-2 ${activeTab === "blog" ? "text-brand-primary" : "text-brand-on-surface-variant"
              }`}
          >
            Blog
          </button>
          <button
            onClick={() => {
              onNavigate("/bookdown");
              setMobileMenuOpen(false);
            }}
            className={`text-left font-sans text-sm tracking-widest uppercase font-semibold py-2 ${activeTab === "bookdown" ? "text-brand-primary" : "text-brand-on-surface-variant"
              }`}
          >
            Bookdown
          </button>
          <button
            onClick={() => {
              onContactClick();
              setMobileMenuOpen(false);
            }}
            className="w-full text-center mt-2 font-sans font-semibold text-[11px] tracking-widest uppercase bg-brand-primary text-white py-3 transition-colors"
          >
            Contact
          </button>
        </div>
      )}
    </nav>
  );
}
