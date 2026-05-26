/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Dna,
  Orbit,
  CircuitBoard,
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
  onNavigate: (path: string) => void;
  onContactClick: () => void;
}

export default function HomeView({ onNavigate, onContactClick }: HomeViewProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showCV, setShowCV] = useState(false);
  const [themeMode, setThemeMode] = useState<"abstract" | "custom">("abstract");

  const staticStars = React.useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: `${(i * 13 + 7) % 96 + 2}%`,
      top: `${(i * 17 + 11) % 96 + 2}%`,
      size: `${0.8 + (i * 0.4) % 1.5}px`,
      duration: `${2 + (i * 0.7) % 4}s`,
    }));
  }, []);

  const fallingStars = React.useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      id: i,
      left: `${(i * 19 + 15) % 90 + 5}%`,
      delay: `${(i * 1.8) % 10}s`,
      duration: `${5 + (i * 1.2) % 6}s`,
      size: `${1.5 + (i * 0.5) % 2.5}px`,
    }));
  }, []);

  const handleCopyDoi = (id: string, doi: string, e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText(doi);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getFocusIcon = (iconName: string) => {
    switch (iconName) {
      case "circuit-board":
        return <CircuitBoard className="w-5 h-5 text-brand-primary" />;
      case "orbit":
        return <Orbit className="w-5 h-5 text-brand-primary" />;
      case "dna":
        return <Dna className="w-5 h-5 text-brand-primary" />;
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
            Deciphering biological complexity through data and computation.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="font-sans text-brand-on-surface-variant text-base sm:text-lg leading-relaxed mb-8 max-w-2xl"
          >
            I am a student focusing on the intersection of biology, astrobiology and bioinformatics.
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
                className={`px-2 py-1 text-[9px] font-mono tracking-widest uppercase transition-colors select-none ${themeMode === "abstract"
                  ? "bg-brand-primary text-white font-bold"
                  : "bg-white/80 text-brand-secondary hover:bg-white"
                  }`}
              >
                Simulation
              </button>
              <button
                onClick={() => setThemeMode("custom")}
                className={`px-2 py-1 text-[9px] font-mono tracking-widest uppercase transition-colors select-none ${themeMode === "custom"
                  ? "bg-brand-primary text-white font-bold"
                  : "bg-white/80 text-brand-secondary hover:bg-white"
                  }`}
              >
                Photo
              </button>
            </div>

            {themeMode === "abstract" ? (
              /* A gorgeous CSS space scene with a pixel-art explorer spaceship and meteor shower rendering */
              <div className="w-full h-full bg-[#030712] relative flex flex-col justify-between p-6 overflow-hidden rounded-[0.125rem] border border-slate-800">
                <style>{`
                  @keyframes starTwinkle {
                    0%, 100% { opacity: 0.2; transform: scale(0.8); }
                    50% { opacity: 1; transform: scale(1.2); }
                  }
                  @keyframes starFall {
                    0% {
                      transform: translateY(-20px) translateX(-50px);
                      opacity: 0;
                    }
                    10% {
                      opacity: 0.8;
                    }
                    90% {
                      opacity: 0.8;
                    }
                    100% {
                      transform: translateY(340px) translateX(120px);
                      opacity: 0;
                    }
                  }
                  @keyframes spaceCruise {
                    0% {
                      transform: translateY(0px) translateX(-8px);
                    }
                    50% {
                      transform: translateY(-6px) translateX(8px);
                    }
                    100% {
                      transform: translateY(0px) translateX(-8px);
                    }
                  }
                  @keyframes scanBeam {
                    0% {
                      transform: rotate(-10deg);
                      opacity: 0.25;
                    }
                    50% {
                      opacity: 0.55;
                    }
                    100% {
                      transform: rotate(10deg);
                      opacity: 0.25;
                    }
                  }
                  @keyframes microbeWiggle {
                    0% {
                      transform: translateY(0px) translateX(0px) rotate(0deg);
                    }
                    100% {
                      transform: translateY(-1.5px) translateX(1px) rotate(6deg);
                    }
                  }
                  @keyframes laserBolt {
                    0% {
                      stroke-dashoffset: 48;
                      opacity: 0;
                    }
                    3% {
                      opacity: 1;
                    }
                    72% {
                      stroke-dashoffset: -85;
                      opacity: 1;
                    }
                    75%, 100% {
                      stroke-dashoffset: -85;
                      opacity: 0;
                    }
                  }
                  .custom-static-star {
                    position: absolute;
                    background-color: #ffffff;
                    border-radius: 50%;
                    animation: starTwinkle ease-in-out infinite alternate;
                  }
                  .custom-falling-star {
                    position: absolute;
                    top: -20px;
                    background-color: #ffffff;
                    border-radius: 50%;
                    box-shadow: 0 0 6px 1.5px rgba(255, 255, 255, 0.7);
                    animation: starFall linear infinite;
                  }
                `}</style>

                {/* Glowing cosmic nebula background */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#0b132b] via-[#1c2541] to-[#030712] opacity-90 z-0"></div>
                <div className="absolute top-1/4 left-1/4 w-40 h-40 bg-purple-600/10 rounded-full filter blur-[50px] pointer-events-none"></div>
                <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-cyan-600/10 rounded-full filter blur-[40px] pointer-events-none"></div>

                {/* Static twinkling stars */}
                {staticStars.map((star) => (
                  <div
                    key={`static-${star.id}`}
                    className="custom-static-star"
                    style={{
                      left: star.left,
                      top: star.top,
                      width: star.size,
                      height: star.size,
                      animationDuration: star.duration,
                    }}
                  />
                ))}

                {/* Falling stars */}
                {fallingStars.map((star) => (
                  <div
                    key={`falling-${star.id}`}
                    className="custom-falling-star"
                    style={{
                      left: star.left,
                      width: star.size,
                      height: star.size,
                      animationDelay: star.delay,
                      animationDuration: star.duration,
                    }}
                  />
                ))}

                {/* Centerpiece: Pixel Spacecraft cruising and scanning */}
                <div className="flex-1 flex items-center justify-center relative z-10 py-4">
                  <div
                    className="relative flex items-center justify-center animate-[spaceCruise_6s_ease-in-out_infinite]"
                    style={{ transformOrigin: "center" }}
                  >
                    {/* Spaceship and Crew */}
                    <div className="relative z-10 drop-shadow-[0_4px_10px_rgba(56,189,248,0.3)]">
                      <svg viewBox="0 -10 40 20" className="w-40 h-20 overflow-visible" shapeRendering="crispEdges">
                        <defs>
                          <linearGradient id="scanBeamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                          </linearGradient>
                          <filter id="laserGlowFilter" x="-30%" y="-30%" width="160%" height="160%">
                            <feGaussianBlur stdDeviation="0.4" result="blur" />
                          </filter>
                        </defs>

                        {/* Scanning Beam — symmetric fan from nose tip at (30.5, 5) */}
                        <polygon
                          points="30.5,5 40,-1 40,11"
                          fill="url(#scanBeamGrad)"
                          style={{ transformOrigin: "30.5px 5px" }}
                          className="animate-[scanBeam_3s_ease-in-out_infinite_alternate] pointer-events-none"
                        />

                        {/* Twin Ion Engine Plumes (symmetric: upper at y=4, lower at y=6) */}
                        <g className="animate-pulse">
                          <polygon points="-1,4 0,3 0,5" fill="rgba(6, 182, 212, 0.4)" />
                          <line x1="-3" y1="4" x2="0" y2="4" stroke="#ffffff" strokeWidth="0.8" />
                          <polygon points="-1,6 0,5 0,7" fill="rgba(6, 182, 212, 0.4)" />
                          <line x1="-3" y1="6" x2="0" y2="6" stroke="#ffffff" strokeWidth="0.8" />
                        </g>

                        {/* Rear Engine Nozzles (symmetric: y=3-5 and y=5-7) */}
                        <rect x="0" y="3" width="2" height="2" fill="#475569" />
                        <rect x="0" y="3.5" width="1" height="1" fill="#1e293b" />
                        <rect x="0" y="5" width="2" height="2" fill="#475569" />
                        <rect x="0" y="5.5" width="1" height="1" fill="#1e293b" />

                        {/* ======= SHIP (bottom half, y=1.5 to y=8.5, slightly scaled up) ======= */}
                        {/* Main chassis block */}
                        <rect x="2" y="2.5" width="22" height="5" fill="#94a3b8" />
                        {/* Top armored deck */}
                        <rect x="4" y="1.5" width="16" height="1" fill="#cbd5e1" />
                        {/* Bottom armor plate */}
                        <rect x="4" y="7.5" width="14" height="1" fill="#475569" />
                        {/* Blocky Nose Prow block */}
                        <rect x="24" y="3" width="3.5" height="4" fill="#cbd5e1" />
                        <polygon points="27.5,3.5 30.5,4.5 30.5,5.5 27.5,6.5" fill="#94a3b8" />

                        {/* Greebles & Windows */}
                        <rect x="8" y="6" width="5" height="0.5" fill="#334155" />
                        <rect x="15" y="6" width="4" height="0.5" fill="#334155" />
                        <rect x="10" y="3.5" width="1.5" height="0.6" fill="#38bdf8" />
                        <rect x="13.5" y="3.5" width="1.5" height="0.6" fill="#38bdf8" />
                        <rect x="17" y="3.5" width="1.5" height="0.6" fill="#38bdf8" />

                        {/* Red Accent Stripe */}
                        <rect x="6" y="4.5" width="12" height="1" fill="#ef4444" />

                        {/* Front Scanning Beam Emitter */}
                        <rect x="30.5" y="4.7" width="2" height="0.6" fill="#38bdf8" />

                        {/* Ventral Heavy Laser Cannon */}
                        <g>
                          {/* Cannon Base (Dark sloped armor) */}
                          <path d="M 8.5,8.5 L 12.5,8.5 L 11.5,9.1 L 9.5,9.1 Z" fill="#334155" />

                          {/* Status LEDs on the turret base */}
                          <rect x="9.8" y="8.7" width="0.5" height="0.3" fill="#06b6d4" />
                          <rect x="11.2" y="8.7" width="0.5" height="0.3" fill="#ef4444" className="animate-pulse" />

                          {/* Swivel Pivot */}
                          <circle cx="10.5" cy="9.1" r="0.6" fill="#1e293b" />

                          {/* Background Barrel (Shadow barrel) */}
                          <line x1="11.0" y1="8.8" x2="14.5" y2="8.8" stroke="#1e293b" strokeWidth="0.8" strokeLinecap="round" />
                          <circle cx="14.5" cy="8.8" r="0.35" fill="#ef4444" opacity="0.6" />

                          {/* Foreground Barrel */}
                          <line x1="10.5" y1="9.2" x2="14.0" y2="9.2" stroke="#64748b" strokeWidth="0.8" strokeLinecap="round" />
                          <circle cx="14.0" cy="9.2" r="0.4" fill="#ff4757" className="animate-pulse" />
                        </g>

                        {/* Laser Bolt glow */}
                        <line
                          x1="14.0"
                          y1="9.2"
                          x2="48.0"
                          y2="9.2"
                          stroke="#ff0000"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                          strokeDasharray="8 40"
                          filter="url(#laserGlowFilter)"
                          className="animate-[laserBolt_4s_linear_infinite] pointer-events-none"
                          style={{ opacity: 0.9 }}
                        />
                        {/* Laser Bolt core */}
                        <line
                          x1="14.0"
                          y1="9.2"
                          x2="48.0"
                          y2="9.2"
                          stroke="#ffffff"
                          strokeWidth="0.4"
                          strokeLinecap="round"
                          strokeDasharray="8 40"
                          className="animate-[laserBolt_4s_linear_infinite] pointer-events-none"
                        />

                        {/* ======= ASTRONAUT (upper area, y=-7 to y=-2, clearly above ship) ======= */}
                        {/* Legs (trailing left, floating horizontal pose) */}
                        <rect x="16" y="-4" width="2" height="1" fill="#1e293b" />
                        <rect x="17" y="-3" width="2" height="1" fill="#1e293b" />

                        {/* Torso */}
                        <rect x="18" y="-5" width="4" height="3" fill="#ea580c" />
                        <rect x="19" y="-5" width="2" height="3" fill="#ff7849" />

                        {/* Oxygen Tank (on back) */}
                        <rect x="17" y="-5" width="1" height="2" fill="#475569" />

                        {/* Helmet & Visor (facing right toward Astrophage) */}
                        <rect x="21" y="-7" width="3" height="3" fill="#ffffff" />
                        <rect x="23" y="-7" width="1" height="3" fill="#fbbf24" />

                        {/* Arm reaching right */}
                        <rect x="22" y="-4" width="2" height="1" fill="#ea580c" />
                        <rect x="24" y="-5" width="1" height="1" fill="#475569" />

                        {/* Robotic Claw / Gripper (reaching toward Astrophage) */}
                        <rect x="25" y="-6" width="1" height="1" fill="#475569" />
                        <rect x="26" y="-7" width="1" height="1" fill="#475569" />
                        <rect x="27" y="-7" width="1" height="1" fill="#94a3b8" />
                        <rect x="28" y="-8" width="1" height="1" fill="#cbd5e1" />  {/* Upper pincer */}
                        <rect x="29" y="-8" width="1" height="1" fill="#cbd5e1" />
                        <rect x="28" y="-6" width="1" height="1" fill="#cbd5e1" />  {/* Lower pincer */}
                        <rect x="29" y="-6" width="1" height="1" fill="#cbd5e1" />

                        {/* Safety Tether — from deck (5, 1.5) curving up to the back of astronaut's body (attached to oxygen tank at 17.5, -4) */}
                        <motion.path
                          animate={{
                            d: [
                              "M 5,1.5 C 6,0.2 9,-2.5 11,-2 C 13,-1.5 15.5,-3.0 17.5,-4",
                              "M 5,1.5 C 7,1.0 8,-1.5 10.5,-1.5 C 12.5,-1.5 15.0,-2.5 17.5,-4",
                              "M 5,1.5 C 5,-0.8 9,-1.2 11.5,-2.5 C 13.5,-3.2 15.5,-2.8 17.5,-4",
                              "M 5,1.5 C 6,0.2 9,-2.5 11,-2 C 13,-1.5 15.5,-3.0 17.5,-4"
                            ]
                          }}
                          transition={{
                            duration: 8,
                            ease: "easeInOut",
                            repeat: Infinity,
                          }}
                          fill="none"
                          stroke="#94a3b8"
                          strokeWidth="0.5"
                          strokeDasharray="1 1"
                        />

                        {/* ======= ASTROPHAGE (far right, shifted by +2x, +2y) ======= */}
                        <g className="animate-[microbeWiggle_0.8s_ease-in-out_infinite_alternate]" style={{ transformOrigin: "37.5px -5px" }}>
                          {/* Glowing Gold Aura */}
                          <circle cx="37.5" cy="-5" r="3.5" fill="rgba(245, 158, 11, 0.25)" />

                          {/* Main Astrophage Body */}
                          <rect x="36" y="-6" width="3" height="3" fill="#fbbf24" rx="0.5" />
                          <rect x="37" y="-6" width="1" height="1" fill="#ffffff" />
                          <rect x="37" y="-5" width="1" height="1" fill="#ea580c" />

                          {/* Cilia */}
                          <rect x="35" y="-5" width="1" height="1" fill="#f59e0b" />
                          <rect x="39" y="-5" width="1" height="1" fill="#f59e0b" />
                          <rect x="37" y="-7" width="1" height="1" fill="#f59e0b" />
                          <rect x="37" y="-3" width="1" height="1" fill="#f59e0b" />

                          {/* Eyes */}
                          <rect x="37" y="-6" width="1" height="1" fill="#ffffff" />
                          <rect x="38" y="-6" width="1" height="1" fill="#ffffff" />
                          <rect x="37" y="-5" width="1" height="1" fill="#000000" />
                          <rect x="38" y="-5" width="1" height="1" fill="#000000" />
                        </g>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Visual Label */}
                <div className="relative z-10">
                  <div className="font-serif text-white font-bold text-lg leading-tight">Xuan Tung Hoang</div>
                  <div className="font-mono text-cyan-200 text-[10px] uppercase tracking-widest mt-1">Undergraduate, Bioengineering</div>
                </div>
              </div>
            ) : (
              /* High-fidelity Photo fallback interface */
              <div className="w-full h-full bg-slate-200 relative flex flex-col justify-end p-4 rounded-[0.125rem] overflow-hidden group">
                <img
                  src="/assets/images/profile_pic.png"
                  alt="Xuan Tung Hoang"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                <div className="relative z-10 bg-slate-900/85 backdrop-blur-sm p-3 border border-slate-700">
                  <div className="font-serif text-white font-bold text-sm">Xuan Tung Hoang</div>
                  <div className="font-mono text-slate-300 text-[9px] uppercase tracking-wider">Undergraduate, Bioengineering</div>
                </div>
              </div>
            )}
          </motion.div>
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
                Curriculum Vitae
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
                      <div className="font-mono text-[10px] text-brand-secondary mb-1">2025 - PRESENT</div>
                      <div className="font-serif text-sm font-bold text-brand-primary">Research Assistant</div>
                      <div className="font-sans text-xs text-brand-on-surface-variant">Vietnam Academy of Science and Technology</div>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-[21px] top-1 w-2 h-2 bg-brand-surface-highest rounded-full"></div>
                      <div className="font-mono text-[10px] text-brand-secondary mb-1">2021 - PRESENT</div>
                      <div className="font-serif text-sm font-bold text-brand-primary">Bachelor in Bioengineering</div>
                      <div className="font-sans text-xs text-brand-on-surface-variant">Hanoi University of Science and Technology</div>
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
                        <div className="font-serif text-sm font-bold text-brand-primary">Not available</div>
                        <div className="font-sans text-xs text-brand-on-surface-variant">Not available</div>
                      </div>
                    </div>

                    <div className="flex gap-4 items-start">
                      <Calendar className="w-4 h-4 text-brand-secondary shrink-0 mt-0.5" />
                      <div>
                        <div className="font-mono text-[10px] text-brand-secondary">2021</div>
                        <div className="font-serif text-sm font-bold text-brand-primary">Not available</div>
                        <div className="font-sans text-xs text-brand-on-surface-variant">Not available</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Service & Mentorship */}
              <div className="mt-8 pt-6 border-t border-brand-surface-highest grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-serif text-sm font-bold text-brand-primary mb-2">Technical Skills</h4>
                  <p className="font-sans text-xs text-brand-on-surface-variant">
                    Python, R, Git, Linux/Bash and LaTeX.
                  </p>
                </div>
                <div>
                  <h4 className="font-serif text-sm font-bold text-brand-primary mb-2">Community & Network</h4>
                  <p className="font-sans text-xs text-brand-on-surface-variant">
                    Innovative BioScience Club, Vietnam Omics Society.
                  </p>
                </div>
                <div>
                  <h4 className="font-serif text-sm font-bold text-brand-primary mb-2">Extracurricular Activities</h4>
                  <p className="font-sans text-xs text-brand-on-surface-variant">
                    xPhO Physics Club, D Free Book library.
                  </p>
                </div>
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
      {/* 
      <div className="mb-12">
        <div className="flex justify-between items-end mb-2">
          <h2 className="font-serif text-2xl font-bold text-brand-primary">
            Selected Publications
          </h2>
          <button
            onClick={() => onNavigate("/blog")}
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

        <div className="mt-10 text-center">
          <button
            onClick={() => onNavigate("/blog")}
            className="group inline-flex items-center gap-2 font-sans font-bold text-xs tracking-wider uppercase text-brand-primary border-b border-brand-primary pb-1 outline-none cursor-pointer hover:border-transparent transition-all"
          >
            <span>View Full Publication List</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
          </button>
        </div>
      </div>
      */}
    </div>
  );
}
