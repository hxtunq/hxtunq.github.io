/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  Menu,
  X,
  Home,
  BookOpen,
  FolderGit2,
  User,
  MessageSquare,
  Sun,
  Moon,
  Sparkles,
  Flower2,
  Monitor,
  Settings,
  Palette
} from "lucide-react";
import NavSky from "./NavSky";
import { ThemePreference, ResolvedTheme } from "../lib/theme";
import { bookItems } from "../lib/book-loader";

interface NavbarProps {
  activeTab: "home" | "blog" | "notes" | "docs" | "about";
  onNavigate: (path: string) => void;
  onContactClick: () => void;
  onSearchToggle?: () => void;
  themePreference?: ThemePreference;
  resolvedTheme?: ResolvedTheme;
  isDark?: boolean;
  onSetTheme?: (preference: ThemePreference) => void;
}

const navItems = [
  { key: "home" as const, label: "Home", path: "/", Icon: Home },
  { key: "blog" as const, label: "Blog", path: "/blog", Icon: BookOpen },
  { key: "notes" as const, label: "Notes", path: "/notes", Icon: MessageSquare },
  ...(bookItems.length > 0 ? [{ key: "docs" as const, label: "Docs", path: "/docs", Icon: FolderGit2 }] : []),
  { key: "about" as const, label: "About", path: "/about", Icon: User },
];

export default function Navbar({
  activeTab,
  onNavigate,
  onContactClick,
  onSearchToggle,
  themePreference = "system",
  resolvedTheme = "light",
  isDark = false,
  onSetTheme
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
  const settingsMenuRef = useRef<HTMLDivElement>(null);

  // Close settings popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(e.target as Node)) {
        setSettingsMenuOpen(false);
      }
    };
    if (settingsMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [settingsMenuOpen]);

  const themeButtons: { key: ThemePreference; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
    { key: "light", label: "Light", Icon: Sun },
    { key: "orange", label: "Orange", Icon: Sparkles },
    { key: "sakura", label: "Sakura", Icon: Flower2 },
    { key: "dark", label: "Dark", Icon: Moon },
    { key: "system", label: "System", Icon: Monitor },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 px-4 md:px-6 py-2.5 bg-brand-bg">
      <div className="max-w-container-max mx-auto h-11 px-5 md:px-6 flex items-center justify-between rounded-full bg-brand-nav border border-brand-nav-border shadow-xs">
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

        {/* Right Group: Tabs & Actions */}
        <div className="flex items-center gap-8 ml-auto">
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map(({ key, label, path }) => (
              <button
                key={key}
                onClick={() => onNavigate(path)}
                className={`font-sans text-[13px] tracking-wide transition-all font-medium border-b-2 py-1 outline-none cursor-pointer ${
                  activeTab === key
                    ? "border-brand-primary text-brand-primary font-bold"
                    : "border-transparent text-brand-on-surface-variant hover:text-brand-primary hover:border-brand-surface-highest"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Quick Actions (Settings Popover, Search, Mobile Hamburger) */}
          <div className="flex items-center gap-1 sm:gap-1.5 relative">
            {/* Settings Gear Popover Container (Desktop/Laptop only, mobile has it in drawer) */}
            <div className="hidden md:block relative" ref={settingsMenuRef}>
              <button
                onClick={() => setSettingsMenuOpen(!settingsMenuOpen)}
                aria-label="Theme settings"
                title="Theme settings"
                className={`w-9 h-9 flex items-center justify-center rounded-full transition-all duration-200 cursor-pointer outline-none ${
                  settingsMenuOpen
                    ? "bg-brand-surface-high text-brand-primary ring-1 ring-brand-surface-highest"
                    : "text-brand-on-surface-variant hover:text-brand-primary hover:bg-brand-surface-high"
                }`}
              >
                <Settings
                  className={`w-[18px] h-[18px] transition-transform duration-300 ${
                    settingsMenuOpen ? "rotate-90 text-brand-primary" : "hover:rotate-45"
                  }`}
                />
              </button>

              {/* Settings Dropdown Popover (Theme Selector Only) */}
              <AnimatePresence>
                {settingsMenuOpen && onSetTheme && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 6 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute right-0 top-11 z-50 w-[340px] p-2 rounded-2xl bg-brand-surface-lowest border border-brand-surface-highest shadow-xl overflow-hidden font-sans space-y-1.5"
                  >
                    <div className="flex items-center gap-1.5 px-1 py-0.5 text-xs text-brand-secondary font-medium">
                      <Palette className="w-3.5 h-3.5" />
                      <span>Theme</span>
                    </div>
                    <div className="grid grid-cols-5 gap-1 p-1 bg-brand-surface-low rounded-xl border border-brand-surface-highest/80">
                      {themeButtons.map(({ key, label, Icon }) => {
                        const isSelected = themePreference === key;
                        return (
                          <button
                            key={key}
                            onClick={() => onSetTheme(key)}
                            className={`flex flex-col items-center justify-center gap-1 py-1.5 px-0.5 rounded-lg text-xs font-sans transition-all duration-150 cursor-pointer ${
                              isSelected
                                ? "bg-brand-surface-lowest text-brand-primary shadow-xs font-bold ring-1 ring-brand-surface-highest"
                                : "text-brand-on-surface-variant hover:text-brand-primary hover:bg-brand-surface-high/50"
                            }`}
                          >
                            <Icon
                              className={`w-3.5 h-3.5 ${
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
                            <span className="text-[10px] leading-tight truncate max-w-full">{label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Search Button */}
            <button
              onClick={onSearchToggle}
              aria-label="Search posts"
              title="Search"
              className="w-9 h-9 flex items-center justify-center text-brand-on-surface-variant hover:text-brand-primary hover:bg-brand-surface-high rounded-full transition-colors cursor-pointer outline-none"
            >
              <Search className="w-[18px] h-[18px]" />
            </button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              className="md:hidden w-9 h-9 flex items-center justify-center text-brand-primary hover:bg-brand-surface-high rounded-full transition-colors cursor-pointer outline-none"
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
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="md:hidden fixed inset-0 top-16 bg-black/25 z-40 backdrop-blur-[2px]"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Menu panel with fluid hardware-accelerated spring opening */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -8 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              style={{ willChange: "transform, opacity", transformOrigin: "top right" }}
              className="md:hidden absolute top-[60px] left-4 right-4 z-50 rounded-2xl overflow-hidden bg-brand-nav border border-brand-nav-border shadow-xl"
            >
              <div className="px-3.5 py-3.5 flex flex-col gap-0.5">
                {navItems.map(({ key, label, path, Icon }) => {
                  const active = activeTab === key;
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        onNavigate(path);
                        setMobileMenuOpen(false);
                      }}
                      className={`group flex items-center gap-3.5 px-3.5 py-3 rounded-xl transition-colors duration-150 cursor-pointer ${
                        active
                          ? "bg-brand-accent/10 text-brand-primary"
                          : "text-brand-on-surface-variant hover:bg-brand-surface-high active:bg-brand-surface-high/70"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                          active
                            ? "bg-brand-accent/15 text-brand-accent"
                            : "bg-brand-surface-high text-brand-on-surface-variant group-hover:text-brand-primary"
                        }`}
                      >
                        <Icon className="w-[16px] h-[16px]" />
                      </div>
                      <span className={`font-sans text-[13.5px] tracking-wide ${active ? "font-bold" : "font-medium"}`}>
                        {label}
                      </span>
                      {active && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-accent" />
                      )}
                    </button>
                  );
                })}

                {/* Divider */}
                <div className="h-px bg-brand-surface-highest my-1.5 mx-2" />

                {/* Theme Control inside Mobile Drawer */}
                {onSetTheme && (
                  <div className="px-2 py-2">
                    <div className="text-[10px] font-mono uppercase text-brand-secondary font-bold tracking-wider px-1 mb-1.5 flex items-center gap-1.5">
                      <Palette className="w-3 h-3" />
                      <span>Theme</span>
                    </div>
                    <div className="grid grid-cols-5 gap-1 p-1 bg-brand-surface-high/60 rounded-xl border border-brand-surface-highest">
                      {themeButtons.map(({ key, label, Icon }) => {
                        const isSelected = themePreference === key;
                        return (
                          <button
                            key={key}
                            onClick={() => onSetTheme(key)}
                            className={`flex flex-col items-center justify-center gap-1 py-1.5 px-0.5 rounded-lg text-xs font-sans transition-all duration-150 cursor-pointer ${
                              isSelected
                                ? "bg-brand-surface-lowest text-brand-primary shadow-xs font-bold"
                                : "text-brand-on-surface-variant hover:text-brand-primary"
                            }`}
                          >
                            <Icon
                              className={`w-3.5 h-3.5 ${
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
                            <span className="text-[9.5px] truncate max-w-full">{label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
