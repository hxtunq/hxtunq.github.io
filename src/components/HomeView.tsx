/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import { motion } from "motion/react";

interface HomeViewProps {
  onNavigate: (path: string) => void;
  onContactClick: () => void;
}

export default function HomeView(_props: HomeViewProps) {
  return (
    <section className="w-full min-h-[calc(100svh-4rem)] flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-4xl text-center"
      >
        {/* Single mission line */}
        <p className="font-serif text-[1.9rem] leading-snug sm:text-[2.4rem] lg:text-[2.75rem] sm:leading-[1.15] text-brand-primary tracking-tight">
          A place to share and archive what I learn.
        </p>

        {/* Author + contact email + focus */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-mono text-xs sm:text-sm uppercase tracking-[0.2em] text-brand-on-surface-variant">
          <span className="text-brand-secondary font-semibold">Tung Hoang</span>
          <span className="text-brand-surface-highest" aria-hidden="true">·</span>
          <a
            href="mailto:hxtunq@gmail.com"
            className="text-brand-accent hover:text-cyan-800 underline-offset-4 hover:underline transition-colors normal-case tracking-normal"
          >
            hxtunq@gmail.com
          </a>
          <span className="text-brand-surface-highest" aria-hidden="true">·</span>
          <span className="text-brand-on-surface-variant normal-case tracking-normal">Biology & Informatics related</span>
        </div>
      </motion.div>
    </section>
  );
}
