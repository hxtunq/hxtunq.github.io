/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import ActivityHeatmap from "./ActivityHeatmap";

interface HomeViewProps {
  onNavigate: (path: string) => void;
  onContactClick: () => void;
}

const siteTags = [
  "Astrobiology",
  "Space Biology",
  "Microbiology",
  "Molecular Biology",
  "Genomics",
  "Metagenomics",
  "Transcriptomics",
  "Biochemistry",
  "Immunology",
  "Data Science",
  "Data Visualization",
  "Environmental Science",
  "Geology",
  "Research Skills",
];

export default function HomeView(_props: HomeViewProps) {
  const [showAvatarInfo, setShowAvatarInfo] = useState(false);

  return (
    <section className="w-full min-h-[calc(100svh-4rem)] flex flex-col justify-center items-center px-4 md:px-6 py-8 md:py-12 bg-brand-bg">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.1, ease: "easeOut" }}
        className="max-w-container-max w-full flex flex-col"
      >
        {/* ========================================================= */}
        {/* TOP ROW: AVATAR (Left) + INTRO & PURPOSE TAGS (Right)     */}
        {/* Shifted down by 1 more unit                               */}
        {/* ========================================================= */}
        <div className="w-full flex flex-col sm:flex-row items-center sm:items-start gap-8 sm:gap-12 md:gap-14 -mt-2 md:-mt-4 mb-4 md:mb-6">
          {/* Avatar with Click-to-Reveal Info Tooltip (Clean by default) */}
          <div className="relative flex flex-col items-center shrink-0">
            <button
              onClick={() => setShowAvatarInfo((prev) => !prev)}
              aria-label="Toggle character avatar information"
              title="Click to view avatar details"
              className="w-[168px] h-[168px] sm:w-[198px] sm:h-[198px] md:w-[214px] md:h-[214px] rounded-full border-2 border-brand-surface-highest overflow-hidden shadow-sm bg-brand-bg flex items-center justify-center cursor-pointer hover:border-brand-primary/60 transition-all outline-none focus:ring-2 focus:ring-brand-primary/20"
            >
              <img
                src="/assets/images/user-nam8.png"
                alt="Chiikawa HUSTer"
                className="w-full h-full object-cover object-center scale-[1.2] sm:scale-[1.22]"
              />
            </button>

            {/* Click-to-Reveal Info Tooltip (Positioned on the Left with Brand Theme) */}
            <AnimatePresence>
              {showAvatarInfo && (
                <motion.div
                  initial={{ opacity: 0, x: 8, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 8, scale: 0.95 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="absolute sm:right-full sm:top-1/2 sm:-translate-y-1/2 sm:mr-3.5 max-sm:bottom-full max-sm:mb-2.5 z-30 px-3.5 py-2 rounded-md bg-brand-surface-lowest border border-brand-surface-highest shadow-md text-center sm:text-right font-sans text-[11.5px] leading-tight whitespace-nowrap pointer-events-auto"
                >
                  <div className="font-semibold text-brand-primary">Chiikawa HUSTer</div>
                  <div className="text-[10px] text-brand-secondary mt-0.5">(Edited by Minh Ngọc)</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Short Intro & Purpose Tags (Shifted to the right) */}
          <div className="flex-1 min-w-0 flex flex-col justify-center text-left sm:pt-1">
            <h2 className="font-sans text-[18px] sm:text-[21px] font-bold text-brand-primary tracking-tight">
              Archive & Documentation
            </h2>
            <p className="font-sans text-brand-on-surface-variant text-[13px] sm:text-[13.5px] leading-relaxed text-justify mt-1.5 mb-2.5">
              This website archives and documents projects, research analyses, and curated reference materials across:
            </p>

            {/* Focus tags */}
            <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
              {siteTags.map((tag) => (
                <span
                  key={tag}
                  className="font-mono text-[10px] sm:text-[11px] px-2.5 py-1 rounded-[0.25rem] bg-brand-surface-high border border-brand-surface-highest text-brand-secondary font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Bottom narrative (Justified) */}
            <p className="font-sans text-brand-on-surface-variant text-[13px] sm:text-[13.5px] leading-relaxed text-justify">
              …and other fascinating areas of science. I created this website out of a desire to share interdisciplinary knowledge with friends, colleagues, and anyone curious, while consolidating a solid foundation for my future graduate studies. If you have any questions, spot any conceptual inaccuracies, or wish to discuss the topics, feel free to reach out via{" "}
              <a
                href="mailto:hxtunq@gmail.com"
                className="text-brand-primary font-medium underline underline-offset-3 decoration-brand-surface-highest hover:decoration-brand-primary transition-all"
              >
                email
              </a>{" "}
              or{" "}
              <a
                href="https://github.com/hxtunq/hxtunq.github.io/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-primary font-medium underline underline-offset-3 decoration-brand-surface-highest hover:decoration-brand-primary transition-all"
              >
                open an issue on GitHub
              </a>
              .
            </p>
          </div>
        </div>

        {/* ========================================================= */}
        {/* BOTTOM ROW: HEATMAP (Left) + QUOTE CARD (Right)           */}
        {/* Strictly equal in height and same baseline                */}
        {/* ========================================================= */}
        <div className="w-full text-left pt-8 md:pt-11">
          <ActivityHeatmap
            leftHeaderSlot={
              <h4 className="font-sans text-[12.5px] sm:text-[13.5px] text-brand-on-surface-variant font-medium">
                <span className="text-brand-secondary font-semibold">My Motivation</span>
              </h4>
            }
            leftSlot={
              <div className="flex-1 min-w-0 bg-brand-surface-lowest border border-brand-surface-highest rounded-md px-5 py-3 sm:px-6 sm:py-3.5 shadow-sm flex flex-col justify-between">
                <p className="font-sans text-[12px] sm:text-[12.5px] leading-relaxed text-brand-on-surface-variant text-justify">
                  Biology is like magic, but there's also this saying: <em>"any sufficiently advanced technology is indistinguishable from magic"</em> (Clarke's 3rd law). In other words, biology is probably one of the most advanced technologies that we see but are still struggling to understand (and it is the task of biologists, such as the future you, to crack this tech wide open!).
                </p>
                <div className="pt-2 text-right font-sans text-[11.5px] sm:text-[12px] text-brand-secondary font-medium not-italic">
                  — Dr. XOONG
                </div>
              </div>
            }
          />
        </div>
      </motion.div>
    </section>
  );
}
