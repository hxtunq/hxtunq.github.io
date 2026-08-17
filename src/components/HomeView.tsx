/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import { motion } from "motion/react";
import { newsItems } from "../lib/news-loader";

interface HomeViewProps {
  onNavigate: (path: string) => void;
  onContactClick: () => void;
}

export default function HomeView(_props: HomeViewProps) {
  return (
    <section className="w-full min-h-[calc(100svh-4rem)] flex flex-col items-center justify-center px-6 py-12 md:py-20 bg-brand-bg">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-4xl w-full text-center"
      >
        {/* Single mission line */}
        <p className="font-serif text-[2.2rem] leading-snug sm:text-[2.8rem] lg:text-[3.2rem] sm:leading-[1.15] text-brand-primary tracking-tight">
          A place to share and archive what I learn.
        </p>

        {/* Author + contact email + focus */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-serif text-[12.5px] sm:text-[14px] text-brand-on-surface-variant">
          <span className="text-brand-secondary font-semibold">Tung Hoang</span>
          <span className="text-brand-surface-highest" aria-hidden="true">·</span>
          <a
            href="mailto:hxtunq@gmail.com"
            className="text-brand-accent hover:text-cyan-800 underline-offset-4 hover:underline transition-colors"
          >
            hxtunq@gmail.com
          </a>
          <span className="text-brand-surface-highest" aria-hidden="true">·</span>
          <span className="text-brand-on-surface-variant">Biology & Informatics related</span>
        </div>

        {/* News Section */}
        {newsItems && newsItems.length > 0 && (
          <div className="mt-16 max-w-2xl mx-auto w-full border-t border-brand-surface-highest pt-10 text-left">
            <h3 className="font-sans text-[11px] font-bold tracking-wider uppercase text-brand-secondary/85 mb-6">
              Latest Updates
            </h3>
            <div className="space-y-6">
              {newsItems.map((item) => (
                <div key={item.id} className="flex gap-5 items-start">
                  <span className="font-mono text-[11.5px] text-brand-secondary shrink-0 pt-0.5 select-none w-16">
                    {item.date}
                  </span>
                  <p className="font-serif text-[13.5px] sm:text-[14.5px] text-brand-on-surface-variant leading-relaxed">
                    {item.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </section>
  );
}
