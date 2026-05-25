/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Network,
  FlaskConical,
  Database,
  Microscope,
  ArrowRight,
  ExternalLink,
  FileText,
  Github,
  Clipboard,
  ClipboardCheck,
  Award,
  BookOpen,
  Calendar,
  GraduationCap
} from "lucide-react";
import { focusItems, selectedPublications } from "../data";
import { SelectedPublication } from "../types";

interface HomeViewProps {
  setActiveTab: (tab: "home" | "blog" | "bookdown") => void;
  onContactClick: () => void;
}

export default function HomeView({ setActiveTab, onContactClick }: HomeViewProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showCV, setShowCV] = useState(false);
  const [themeMode, setThemeMode] = useState<"abstract" | "custom">("abstract");
  const [customImageUrl, setCustomImageUrl] = useState("");

  const handleCopyDoi = (id: string, doi: string, e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText(doi);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getFocusIcon = (iconName: string) => {
    switch (iconName) {
      case "network":
        return <Network className="w-5 h-5 text-brand-primary" />;
      case "flask":
        return <FlaskConical className="w-5 h-5 text-brand-primary" />;
      case "grid":
        return <Database className="w-5 h-5 text-brand-primary" />;
      case "microscope":
        return <Microscope className="w-5 h-5 text-brand-primary" />;
      default:
        return <BookOpen className="w-5 h-5 text-brand-primary" />;
    }
  };

  return (
    <div className="max-w-container-max mx-auto px-4 md:px-6 py-12">
      {/* SECTION 1: HERO CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-24">
        {/* Left Side text content (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-serif text-3.5xl sm:text-5xl lg:text-6xl text-brand-primary font-bold tracking-tight leading-[1.1] mb-6"
          >
            Advancing computational models for complex systems.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="font-sans text-brand-on-surface-variant text-base sm:text-lg leading-relaxed mb-8 max-w-2xl"
          >
            I am a postdoctoral researcher focusing on the intersection of machine learning and biophysics. My work aims to unravel the emergent properties of complex molecular networks using data-driven methodologies and rigorous statistical frameworks.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap gap-4 items-center"
          >
            <button
              onClick={() => setShowCV(!showCV)}
              className="group flex items-center gap-2 font-sans font-bold text-xs tracking-wider uppercase text-brand-primary outline-none cursor-pointer border-b border-transparent hover:border-brand-primary pb-1 transition-all"
            >
              <span>{showCV ? "Collapse Curriculum Vitae" : "View Curriculum Vitae"}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
            </button>
          </motion.div>
        </div>

        {/* Right Side visual headshot (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-[340px] aspect-square bg-brand-surface-low border border-brand-surface-highest rounded-[0.25rem] p-3 shadow-sm relative overflow-hidden"
          >
            {/* Visual Type Selector */}
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <button
                onClick={() => setThemeMode("abstract")}
                className={`px-2 py-1 text-[9px] font-mono tracking-widest uppercase transition-colors select-none ${
                  themeMode === "abstract"
                    ? "bg-brand-primary text-white font-bold"
                    : "bg-white/80 text-brand-secondary hover:bg-white"
                }`}
              >
                Simulation
              </button>
              <button
                onClick={() => setThemeMode("custom")}
                className={`px-2 py-1 text-[9px] font-mono tracking-widest uppercase transition-colors select-none ${
                  themeMode === "custom"
                    ? "bg-brand-primary text-white font-bold"
                    : "bg-white/80 text-brand-secondary hover:bg-white"
                }`}
              >
                Photo
              </button>
            </div>

            {themeMode === "abstract" ? (
              /* A gorgeous CSS/SVG neural biophysics network rendering */
              <div className="w-full h-full bg-brand-primary relative flex flex-col justify-between p-6 overflow-hidden rounded-[0.125rem]">
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e213b] to-transparent opacity-60 z-0"></div>

                {/* Animated bio-grid visual layout */}
                <svg className="absolute inset-0 w-full h-full opacity-25" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#ffffff" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>

                {/* Simulated network nodes */}
                <div className="absolute top-1/3 left-1/4 w-2 h-2 bg-emerald-400 rounded-full animate-ping"></div>
                <div className="absolute bottom-1/3 right-1/4 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></div>

                {/* Animated custom graphic: stylized biophysical protein model */}
                <div className="flex-1 flex items-center justify-center relative z-10 py-4">
                  <svg viewBox="0 0 100 100" className="w-32 h-32 text-white">
                    <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="0.75" strokeDasharray="3 3" className="animate-spin" style={{ animationDuration: "16s" }} />
                    <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    {/* Helix/nodes */}
                    <line x1="30" y1="50" x2="70" y2="50" stroke="currentColor" strokeWidth="1.25" />
                    <line x1="50" y1="30" x2="50" y2="70" stroke="currentColor" strokeWidth="1.25" />
                    <circle cx="30" cy="50" r="4" fill="currentColor" />
                    <circle cx="70" cy="50" r="4" fill="currentColor" />
                    <circle cx="50" cy="30" r="4" fill="currentColor" />
                    <circle cx="50" cy="70" r="4" fill="currentColor" />
                    <circle cx="50" cy="50" r="6" fill="#e2e8f0" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </div>

                {/* Visual Label */}
                <div className="relative z-10">
                  <div className="font-serif text-white font-bold text-lg leading-tight">Dr. E. Sterling</div>
                  <div className="font-mono text-cyan-200 text-[10px] uppercase tracking-widest mt-1">BIOPHYSICS HUB // SIM_ACTIVE</div>
                </div>
              </div>
            ) : (
              /* High-fidelity Photo fallback interface */
              <div className="w-full h-full bg-slate-200 relative flex flex-col justify-end p-4 rounded-[0.125rem] overflow-hidden group">
                {customImageUrl ? (
                  <img
                    src={customImageUrl}
                    alt="Dr. E. Sterling"
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={() => setCustomImageUrl("")}
                  />
                ) : (
                  /* Stylized Vector Portrait Avatar when no direct photo URL */
                  <div className="absolute inset-0 bg-slate-800 flex flex-col items-center justify-center p-6 text-center text-white">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-20 h-20 text-slate-400 mb-2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <div className="font-serif text-sm font-semibold text-slate-300">No Image Configured</div>
                    <p className="font-sans text-[10px] text-slate-400 max-w-[200px] mt-1">Paste any profile image URL below to dynamic swap</p>
                  </div>
                )}

                <div className="relative z-10 bg-slate-900/85 backdrop-blur-sm p-3 border border-slate-700">
                  <div className="font-serif text-white font-bold text-sm">Dr. E. Sterling</div>
                  <div className="font-mono text-slate-300 text-[9px] uppercase tracking-wider">Postdoctoral Fellow, Complex Networks</div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Dynamic swapper input */}
          {themeMode === "custom" && (
            <div className="w-full max-w-[340px] mt-3">
              <input
                type="text"
                placeholder="Paste profile photo image URL..."
                value={customImageUrl}
                onChange={(e) => setCustomImageUrl(e.target.value)}
                className="w-full bg-brand-surface-low border border-brand-surface-highest focus:border-brand-primary outline-none px-3 py-1.5 text-[10px] font-mono text-brand-on-surface placeholder:text-brand-on-surface-variant/40"
              />
            </div>
          )}
        </div>
      </div>

      {/* CURRICULUM VITAE DRAWER SUB-VIEW */}
      <AnimatePresence>
        {showCV && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-20"
          >
            <div className="border border-brand-surface-highest p-6 md:p-8 bg-brand-surface-low/60 rounded-none relative">
              <div className="absolute top-6 right-6 font-mono text-[9px] text-brand-on-surface-variant select-none">
                CURRICULUM_VITAE // REV_2026.1
              </div>

              <h2 className="font-serif font-bold text-2xl text-brand-primary mb-8 border-b border-brand-surface-highest pb-3">
                Academic Curriculum Vitae
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Academic Appointments timeline */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-brand-primary font-bold">
                    <GraduationCap className="w-5 h-5" />
                    <h3 className="font-serif text-lg">Academic Appointments</h3>
                  </div>

                  <div className="border-l-2 border-brand-surface-highest pl-4 space-y-4">
                    <div className="relative">
                      <div className="absolute -left-[21px] top-1 w-2 h-2 bg-brand-primary rounded-full"></div>
                      <div className="font-mono text-[10px] text-brand-secondary mb-1">2024 - PRESENT</div>
                      <div className="font-serif text-sm font-bold text-brand-primary">Postdoctoral Research Fellow</div>
                      <div className="font-sans text-xs text-brand-on-surface-variant">Division of Biophysics & Machine Learning, Institute of Complex Systems</div>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-[21px] top-1 w-2 h-2 bg-brand-surface-highest rounded-full"></div>
                      <div className="font-mono text-[10px] text-brand-secondary mb-1">2019 - 2024</div>
                      <div className="font-serif text-sm font-bold text-brand-primary">Doctor of Philosophy in Computational Biology</div>
                      <div className="font-sans text-xs text-brand-on-surface-variant">Department of Bioengineering, University of Cambridge</div>
                      <div className="italic text-[11px] text-brand-on-surface-variant/60 mt-1">Thesis: Topological constraints on bio-pathway robustness</div>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-[21px] top-1 w-2 h-2 bg-brand-surface-highest rounded-full"></div>
                      <div className="font-mono text-[10px] text-brand-secondary mb-1">2015 - 2019</div>
                      <div className="font-serif text-sm font-bold text-brand-primary">B.S. in Physics (with Honors)</div>
                      <div className="font-sans text-xs text-brand-on-surface-variant">Massachusetts Institute of Technology</div>
                    </div>
                  </div>
                </div>

                {/* Grants & Awards column */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-brand-primary font-bold">
                    <Award className="w-5 h-5" />
                    <h3 className="font-serif text-lg">Grants, Honors & Awards</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="flex gap-4 items-start border-b border-brand-surface-highest/50 pb-3">
                      <Calendar className="w-4 h-4 text-brand-secondary shrink-0 mt-0.5" />
                      <div>
                        <div className="font-mono text-[10px] text-brand-secondary">2025</div>
                        <div className="font-serif text-sm font-bold text-brand-primary">NIH Pathways to Independence Award (K99/R00)</div>
                        <div className="font-sans text-xs text-brand-on-surface-variant">Project total funding: $950,000 for modeling protein topologies.</div>
                      </div>
                    </div>

                    <div className="flex gap-4 items-start border-b border-brand-surface-highest/50 pb-3">
                      <Calendar className="w-4 h-4 text-brand-secondary shrink-0 mt-0.5" />
                      <div>
                        <div className="font-mono text-[10px] text-brand-secondary">2024</div>
                        <div className="font-serif text-sm font-bold text-brand-primary">Outstanding PhD Dissertation Prize</div>
                        <div className="font-sans text-xs text-brand-on-surface-variant">Awarded by the Biomedical Computational Science Society.</div>
                      </div>
                    </div>

                    <div className="flex gap-4 items-start">
                      <Calendar className="w-4 h-4 text-brand-secondary shrink-0 mt-0.5" />
                      <div>
                        <div className="font-mono text-[10px] text-brand-secondary">2021</div>
                        <div className="font-serif text-sm font-bold text-brand-primary">Wellcome Trust PhD Fellowship</div>
                        <div className="font-sans text-xs text-brand-on-surface-variant">Full academic funding & residency fellowship in London.</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Service & Mentorship */}
              <div className="mt-8 pt-6 border-t border-brand-surface-highest grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-serif text-sm font-bold text-brand-primary mb-2">Editorial Service</h4>
                  <p className="font-sans text-xs text-brand-on-surface-variant">
                    Ad-hoc reviewer for: Physical Review Letters, Journal of Royal Society Interface, Bioinformatics, and Biophysical Journal.
                  </p>
                </div>
                <div>
                  <h4 className="font-serif text-sm font-bold text-brand-primary mb-2">Teaching Portfolio</h4>
                  <p className="font-sans text-xs text-brand-on-surface-variant">
                    Guest lecturer for "Biostatistical Machine Learning" and lead teaching assistant for "Physiological Systems Engineering".
                  </p>
                </div>
                <div>
                  <h4 className="font-serif text-sm font-bold text-brand-primary mb-2">Active Affiliations</h4>
                  <p className="font-sans text-xs text-brand-on-surface-variant">
                    American Physical Society, Society of Mathematical Biology, International Society for Computational Biology (ISCB).
                  </p>
                </div>
              </div>

              {/* PDF Print Option */}
              <div className="mt-8 flex justify-end">
                <button
                  onClick={onContactClick}
                  className="font-sans font-bold text-[10px] tracking-widest uppercase border border-brand-primary py-2 px-6 rounded-none hover:bg-brand-primary hover:text-white transition-colors"
                >
                  Request Printed Copy
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SECTION 2: RESEARCH FOCUS (Bento Grid) */}
      <div className="mb-24">
        <h2 className="font-serif text-2xl font-bold text-brand-primary mb-2">
          Research Focus
        </h2>
        <div className="w-full h-[1px] bg-brand-surface-highest mb-8"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {focusItems.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ y: -3, borderColor: "var(--color-brand-primary)" }}
              transition={{ duration: 0.2 }}
              className="bg-brand-surface-lowest border border-brand-surface-highest rounded-[0.25rem] p-6 hover:shadow-xs transition-shadow"
            >
              <div className="w-10 h-10 rounded-[0.125rem] bg-brand-surface-low flex items-center justify-center mb-4 border border-brand-surface-highest">
                {getFocusIcon(item.iconName)}
              </div>
              <h3 className="font-serif font-bold text-lg text-brand-primary mb-2">
                {item.title}
              </h3>
              <p className="font-sans text-brand-on-surface-variant text-sm leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* SECTION 3: SELECTED PUBLICATIONS */}
      <div className="mb-12">
        <div className="flex justify-between items-end mb-2">
          <h2 className="font-serif text-2xl font-bold text-brand-primary">
            Selected Publications
          </h2>
          <button
            onClick={() => setActiveTab("blog")}
            className="group flex items-center gap-1.5 font-sans font-bold text-[10px] tracking-widest uppercase text-brand-secondary hover:text-brand-primary transition-colors cursor-pointer"
          >
            <span>All Articles</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
        <div className="w-full h-[1px] bg-brand-surface-highest mb-8"></div>

        <div className="space-y-6">
          {selectedPublications.map((pub) => (
            <div
              key={pub.id}
              className="border border-brand-surface-highest p-6 md:p-8 bg-brand-surface-lowest hover:bg-brand-surface-lowest/70 transition-colors rounded-[0.25rem] relative"
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-3 font-sans text-[11px] font-bold text-brand-secondary tracking-widest uppercase mb-4">
                <span>{pub.journal}</span>
                <span className="text-brand-surface-highest">•</span>
                <span>{pub.year}</span>
              </div>

              <h3 className="font-serif font-bold text-xl text-brand-primary mb-3">
                {pub.title}
              </h3>

              <p className="font-sans text-brand-on-surface-variant text-sm leading-relaxed mb-6 max-w-4xl">
                {pub.abstract}
              </p>

              {/* Publication Links Row */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={(e) => handleCopyDoi(pub.id, pub.doi, e)}
                  title="Copy DOI designation"
                  className="flex items-center gap-1.5 font-mono text-[10px] text-brand-secondary border border-brand-surface-highest hover:border-brand-primary hover:text-brand-primary px-3 py-1.5 transition-colors cursor-pointer bg-brand-surface-low"
                >
                  {copiedId === pub.id ? (
                    <>
                      <ClipboardCheck className="w-3 h-3 text-emerald-500" />
                      <span>Copied DOI!</span>
                    </>
                  ) : (
                    <>
                      <Clipboard className="w-3 h-3" />
                      <span>DOI: {pub.doi}</span>
                    </>
                  )}
                </button>

                {pub.pdfUrl && (
                  <button
                    onClick={onContactClick}
                    className="flex items-center gap-1.5 font-sans font-bold text-[10px] tracking-wider uppercase text-brand-primary border border-brand-primary hover:bg-brand-primary hover:text-white px-4 py-1.5 transition-colors cursor-pointer"
                  >
                    <FileText className="w-3 h-3" />
                    <span>PDF Manuscript</span>
                  </button>
                )}

                {pub.githubUrl && (
                  <a
                    href={pub.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 font-sans font-bold text-[10px] tracking-wider uppercase text-brand-secondary border border-brand-surface-highest hover:border-brand-primary hover:text-brand-primary px-4 py-1.5 transition-colors"
                  >
                    <Github className="w-3 h-3" />
                    <span>Computation Repo</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* View Full Publication List anchor footer action */}
        <div className="mt-10 text-center">
          <button
            onClick={() => setActiveTab("blog")}
            className="group inline-flex items-center gap-2 font-sans font-bold text-xs tracking-wider uppercase text-brand-primary border-b border-brand-primary pb-1 outline-none cursor-pointer hover:border-transparent transition-all"
          >
            <span>View Full Publication List</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
