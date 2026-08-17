/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import React from "react";
import { motion } from "motion/react";
import { RenderMarkdown } from "../lib/markdown";
import aboutMarkdown from "../../content/about.md?raw";

interface AboutViewProps {
  onContactClick?: () => void;
}

export default function AboutView({ onContactClick }: AboutViewProps) {
  return (
    <section className="w-full min-h-[calc(100svh-4rem)] flex items-center justify-center px-6 py-12 bg-brand-bg">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="max-w-2xl w-full space-y-6"
      >
        <h2 className="font-serif text-3xl font-medium text-brand-primary border-b border-brand-surface-highest pb-3">
          About Me
        </h2>
        <div className="font-serif text-[15px] sm:text-[16px] leading-relaxed text-brand-on-surface-variant space-y-4">
          <RenderMarkdown markdown={aboutMarkdown} />
          
          {onContactClick && (
            <div className="pt-4 select-none">
              <button
                onClick={onContactClick}
                className="font-sans font-medium text-[12.5px] tracking-wider uppercase bg-brand-primary text-brand-surface-lowest hover:opacity-90 transition-opacity px-6 py-3 cursor-pointer outline-none border border-transparent"
              >
                Get in Touch
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </section>
  );
}
