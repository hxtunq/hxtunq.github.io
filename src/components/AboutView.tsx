/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import React from "react";
import { motion } from "motion/react";
import { Calendar, Mail, MapPin, ExternalLink } from "lucide-react";
import { RenderMarkdown } from "../lib/markdown";
import aboutMarkdown from "../../content/about.md?raw";

interface AboutViewProps {
  onContactClick?: () => void;
}

export default function AboutView({ onContactClick }: AboutViewProps) {
  const calendarUrl = "https://calendar.app.google/hPtV7Dy8gpNQLtAS7";
  const favPlaceUrl = "https://maps.app.goo.gl/UmcaU3WdBH1uFqth8";

  return (
    <section className="w-full min-h-[calc(100svh-4rem)] flex items-center justify-center px-4 sm:px-6 py-12 bg-brand-bg transition-colors duration-200">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="max-w-2xl w-full space-y-6"
      >
        <div>
          <h2 className="font-sans text-2xl sm:text-3xl font-bold text-brand-primary tracking-tight border-b border-brand-surface-highest pb-3 mb-6">
            About Me
          </h2>
          <div className="font-sans text-[14.5px] sm:text-[15.5px] leading-relaxed text-brand-on-surface-variant space-y-4 text-justify [&_p]:text-justify">
            <RenderMarkdown markdown={aboutMarkdown} />
          </div>
        </div>

        {/* Action Buttons: Get in Touch + My Availability + My Fav Place */}
        <div className="flex flex-wrap items-center gap-3 pt-3">
          {onContactClick && (
            <button
              onClick={onContactClick}
              className="font-sans font-medium text-[12px] sm:text-[12.5px] tracking-wider uppercase bg-brand-surface-low border border-brand-surface-highest text-brand-primary hover:border-brand-primary/60 hover:bg-brand-surface-lowest transition-all px-5 py-2.5 cursor-pointer outline-none rounded-[0.25rem] flex items-center gap-2 shadow-xs group"
            >
              <Mail className="w-4 h-4 text-brand-secondary group-hover:text-brand-accent transition-colors" />
              <span>Get in Touch</span>
            </button>
          )}

          <a
            href={calendarUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-sans font-medium text-[12px] sm:text-[12.5px] tracking-wider uppercase bg-brand-surface-low border border-brand-surface-highest text-brand-primary hover:border-brand-primary/60 hover:bg-brand-surface-lowest transition-all px-5 py-2.5 outline-none rounded-[0.25rem] flex items-center gap-2 shadow-xs group cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-brand-secondary group-hover:text-brand-accent transition-colors" />
            <span>My Availability</span>
            <ExternalLink className="w-3.5 h-3.5 text-brand-secondary/60 group-hover:text-brand-accent transition-colors ml-0.5" />
          </a>

          <a
            href={favPlaceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-sans font-medium text-[12px] sm:text-[12.5px] tracking-wider uppercase bg-brand-surface-low border border-brand-surface-highest text-brand-primary hover:border-brand-primary/60 hover:bg-brand-surface-lowest transition-all px-5 py-2.5 outline-none rounded-[0.25rem] flex items-center gap-2 shadow-xs group cursor-pointer"
          >
            <MapPin className="w-4 h-4 text-brand-secondary group-hover:text-brand-accent transition-colors" />
            <span>Where to Find Me</span>
            <ExternalLink className="w-3.5 h-3.5 text-brand-secondary/60 group-hover:text-brand-accent transition-colors ml-0.5" />
          </a>
        </div>
      </motion.div>
    </section>
  );
}
