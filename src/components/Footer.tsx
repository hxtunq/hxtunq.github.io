/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";

interface FooterProps {
  onLinkHighlight?: () => void;
}

export default function Footer({ onLinkHighlight }: FooterProps) {
  return (
    <footer className="w-full bg-brand-surface-highest/60 border-t border-brand-surface-highest mt-20">
      <div className="max-w-container-max mx-auto px-4 md:px-6 py-10 flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Left Side: Serif Wordmark */}
        <div className="font-serif font-bold text-xl text-brand-primary tracking-tight">
          Academic Portfolio
        </div>

        {/* Center: Social links with consistent layout spacing */}
        <div className="flex flex-wrap justify-center items-center gap-6">
          <a
            href="https://orcid.org"
            target="_blank"
            rel="noopener noreferrer"
            onClick={onLinkHighlight}
            className="font-sans text-[11px] font-bold tracking-wider text-brand-on-surface-variant hover:text-brand-primary uppercase underline-offset-4 hover:underline transition-all duration-200"
          >
            ORCID
          </a>
          <a
            href="https://scholar.google.com"
            target="_blank"
            rel="noopener noreferrer"
            onClick={onLinkHighlight}
            className="font-sans text-[11px] font-bold tracking-wider text-brand-on-surface-variant hover:text-brand-primary uppercase underline-offset-4 hover:underline transition-all duration-200"
          >
            Google Scholar
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            onClick={onLinkHighlight}
            className="font-sans text-[11px] font-bold tracking-wider text-brand-on-surface-variant hover:text-brand-primary uppercase underline-offset-4 hover:underline transition-all duration-200"
          >
            GitHub
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            onClick={onLinkHighlight}
            className="font-sans text-[11px] font-bold tracking-wider text-brand-on-surface-variant hover:text-brand-primary uppercase underline-offset-4 hover:underline transition-all duration-200"
          >
            LinkedIn
          </a>
        </div>

        {/* Right Side: Copyright */}
        <div className="font-sans text-[11px] font-medium text-brand-on-surface-variant tracking-wider uppercase text-center md:text-right">
          © 2026 Academic Professional. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
