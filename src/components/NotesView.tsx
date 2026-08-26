import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Share2, MoreHorizontal, ExternalLink, Copy, Check, Send, X } from "lucide-react";
import { Facebook, Twitter } from "./BrandIcons";
import { notesPosts } from "../lib/notes-loader";
import { renderInlineStyles } from "../lib/markdown";

// Helper to extract YouTube thumbnail
const getYouTubeThumbnail = (url: string): string | null => {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
};

// Helper to format date relative or formatted like X (e.g. 5m, 2h, 1d, 12-Feb-2026)
const formatRelativeDate = (dateString: string) => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  const now = new Date();
  const diffDays = (now.getTime() - date.getTime()) / (1000 * 3600 * 24);

  // If older than 3 days, format as "12-Feb-2026"
  if (diffDays > 3) {
    const day = date.getDate().toString().padStart(2, "0");
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  // Under 3 days relative time
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  if (diffMinutes < 1) return "now";
  if (diffMinutes < 60) return `${diffMinutes}m`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h`;

  const diffDaysRound = Math.floor(diffHours / 24);
  return `${diffDaysRound}d`;
};

// Helper to extract first URL from text
const detectFirstUrl = (content: string): string | null => {
  const urlRegex = /(https?:\/\/[^\s\)]+)/g;
  const match = content.match(urlRegex);
  if (!match) return null;
  let url = match[0];
  if (url.endsWith(".") || url.endsWith(",") || url.endsWith(";")) {
    url = url.slice(0, -1);
  }
  return url;
};

interface AutoLinkPreviewProps {
  content: string;
  manualPreview?: {
    url: string;
    title?: string;
    description?: string;
    siteName?: string;
    imageUrl?: string;
  };
}

function AutoLinkPreview({ content, manualPreview }: AutoLinkPreviewProps) {
  const [preview, setPreview] = useState<{
    url: string;
    title: string;
    description: string;
    siteName?: string;
    imageUrl?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const targetUrl = manualPreview?.url || detectFirstUrl(content);

  useEffect(() => {
    if (!targetUrl) {
      setPreview(null);
      return;
    }

    // 1. If we have full manual overrides, use them immediately
    if (
      manualPreview &&
      manualPreview.title &&
      manualPreview.description &&
      manualPreview.imageUrl
    ) {
      setPreview({
        url: targetUrl,
        title: manualPreview.title,
        description: manualPreview.description,
        siteName: manualPreview.siteName,
        imageUrl: manualPreview.imageUrl,
      });
      return;
    }

    // 2. Check localStorage cache
    const cacheKey = `link-preview-v4:${targetUrl}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setPreview({
          url: targetUrl,
          title: manualPreview?.title || parsed.title || "",
          description: manualPreview?.description || parsed.description || "",
          siteName: manualPreview?.siteName || parsed.siteName || "",
          imageUrl: manualPreview?.imageUrl || parsed.imageUrl || "",
        });
        return;
      } catch (e) {
        // Ignore cache parse error
      }
    }

    // 3. YouTube oEmbed support for fast, exact YouTube video titles and channels
    const isYouTube = targetUrl.includes("youtube.com") || targetUrl.includes("youtu.be");
    if (isYouTube) {
      setLoading(true);
      fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(targetUrl)}&format=json`)
        .then(res => res.json())
        .then(oembed => {
          const ytThumb = getYouTubeThumbnail(targetUrl) || oembed.thumbnail_url || "";
          const cleanAuthor = (oembed.author_name || "").replace(/\s*•\s*YouTube/gi, "").trim();
          const parsedData = {
            url: targetUrl,
            title: manualPreview?.title || oembed.title || "YouTube Video",
            description: manualPreview?.description || "",
            siteName: manualPreview?.siteName || cleanAuthor || "YouTube",
            imageUrl: manualPreview?.imageUrl || ytThumb,
          };
          localStorage.setItem(cacheKey, JSON.stringify(parsedData));
          setPreview(parsedData);
        })
        .catch(() => {
          const ytThumb = getYouTubeThumbnail(targetUrl) || "";
          const fallback = {
            url: targetUrl,
            title: manualPreview?.title || "YouTube Video",
            description: manualPreview?.description || "",
            siteName: manualPreview?.siteName || "YouTube",
            imageUrl: manualPreview?.imageUrl || ytThumb,
          };
          setPreview(fallback);
        })
        .finally(() => {
          setLoading(false);
        });
      return;
    }

    // 4. Fetch from microlink for other URLs
    setLoading(true);
    const apiEndpoint = `https://api.microlink.io?url=${encodeURIComponent(targetUrl)}`;

    fetch(apiEndpoint)
      .then(res => res.json())
      .then(json => {
        if (json.status === "success" && json.data) {
          const data = json.data;
          let imgUrl = "";
          if (data.image) {
            imgUrl = typeof data.image === "object" ? data.image.url : data.image;
          }

          const ytThumb = getYouTubeThumbnail(targetUrl);
          const parsedData = {
            url: targetUrl,
            title: manualPreview?.title || data.title || (ytThumb ? "YouTube Video" : ""),
            description: manualPreview?.description || data.description || "",
            siteName: manualPreview?.siteName || data.publisher || (ytThumb ? "YouTube" : new URL(targetUrl).hostname.replace("www.", "")),
            imageUrl: manualPreview?.imageUrl || imgUrl || ytThumb || "",
          };

          localStorage.setItem(cacheKey, JSON.stringify(parsedData));
          setPreview(parsedData);
        } else {
          throw new Error("API call failed");
        }
      })
      .catch(err => {
        console.error("Error scraping preview link: ", err);
        const ytThumb = getYouTubeThumbnail(targetUrl);
        const fallback = {
          url: targetUrl,
          title: manualPreview?.title || (ytThumb ? "YouTube Video" : new URL(targetUrl).hostname),
          description: manualPreview?.description || "",
          siteName: manualPreview?.siteName || (ytThumb ? "YouTube" : new URL(targetUrl).hostname.replace("www.", "")),
          imageUrl: manualPreview?.imageUrl || ytThumb || "",
        };
        setPreview(fallback);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [targetUrl, manualPreview]);

  if (!targetUrl) return null;

  if (loading) {
    return (
      <div className="mt-3 overflow-hidden rounded-lg border border-brand-surface-highest/60 bg-brand-surface-low/30 animate-pulse h-28 flex items-center justify-center font-sans text-xs text-brand-secondary/45 select-none">
        Loading link preview...
      </div>
    );
  }

  if (!preview || (!preview.title && !preview.imageUrl)) return null;

  const cleanSiteName = (preview.siteName || "")
    .replace(/\s*•\s*YouTube/gi, "")
    .trim();

  const rawDesc = (preview.description || "").trim();
  const cleanDescription =
    rawDesc.startsWith("Kênh:") ||
    rawDesc.includes("• YouTube") ||
    rawDesc.toLowerCase() === cleanSiteName.toLowerCase()
      ? ""
      : rawDesc;

  return (
    <a
      href={preview.url}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-3 flex flex-col sm:flex-row overflow-hidden rounded-lg border border-brand-surface-highest hover:bg-brand-surface-low/30 active:bg-brand-surface-low/60 transition-colors group"
    >
      {/* Link Preview Image */}
      {preview.imageUrl && (
        <div className="w-full sm:w-32 h-32 sm:h-auto shrink-0 border-b sm:border-b-0 sm:border-r border-brand-surface-highest bg-brand-surface-low">
          <img
            src={preview.imageUrl}
            alt={preview.title}
            className="w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-500"
            loading="lazy"
          />
        </div>
      )}
      {/* Link Preview Texts */}
      <div className="p-3.5 flex flex-col justify-center min-w-0 flex-1">
        {cleanSiteName && (
          <span className="font-sans text-[10.5px] font-bold text-brand-secondary/70 uppercase tracking-wider mb-0.5">
            {cleanSiteName}
          </span>
        )}
        <h4 className="font-sans text-[13px] font-bold text-brand-primary line-clamp-2 leading-snug group-hover:text-brand-accent transition-colors">
          {preview.title}
        </h4>
        {cleanDescription && (
          <p className="font-serif text-xs text-brand-secondary/80 line-clamp-2 leading-relaxed mt-1">
            {cleanDescription}
          </p>
        )}
        <span className="font-sans text-[10.5px] text-brand-secondary/40 truncate mt-2.5">
          {preview.url}
        </span>
      </div>
    </a>
  );
}

export default function NotesView() {
  const [activeShareMenu, setActiveShareMenu] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Calculate papers count dynamically with deduplication
  const calculatePapersCount = (year?: number) => {
    const uniquePapers = new Set<string>();
    notesPosts.forEach(post => {
      if (year && new Date(post.createdAt).getFullYear() !== year) return;
      if (post.paperPreview) {
        uniquePapers.add(post.paperPreview);
      }
    });
    return uniquePapers.size;
  };

  // Calculate percentage change in papers compared to last year
  const getPapersYearlyPercentageChange = () => {
    const currentYear = new Date().getFullYear();
    const lastYear = currentYear - 1;
    const thisYearCount = calculatePapersCount(currentYear);
    const lastYearCount = calculatePapersCount(lastYear);

    if (lastYearCount === 0) {
      return thisYearCount > 0 ? `+${thisYearCount * 100}%` : "0%";
    }

    const percent = Math.round(((thisYearCount - lastYearCount) / lastYearCount) * 100);
    return percent >= 0 ? `+${percent}%` : `${percent}%`;
  };

  // Calculate distinct days active (count unique calendar days with posted notes)
  const calculateDaysActive = () => {
    const uniqueDays = new Set<string>();
    notesPosts.forEach(post => {
      const date = new Date(post.createdAt);
      if (!isNaN(date.getTime())) {
        const dayKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
        uniqueDays.add(dayKey);
      }
    });
    return uniqueDays.size;
  };

  // Calculate distinct topics dynamically from tags
  const calculateTopicsCount = () => {
    const topics = new Set<string>();
    notesPosts.forEach(post => {
      if (post.tags && post.tags.length > 0) {
        post.tags.forEach(tag => {
          if (tag.trim()) {
            topics.add(tag.trim().toLowerCase());
          }
        });
      }
    });

    return topics.size;
  };

  // Calculate percentage change in posts compared to last year
  const getYearlyPercentageChange = () => {
    const currentYear = new Date().getFullYear();
    const lastYear = currentYear - 1;
    const thisYearCount = notesPosts.filter(p => new Date(p.createdAt).getFullYear() === currentYear).length;
    const lastYearCount = notesPosts.filter(p => new Date(p.createdAt).getFullYear() === lastYear).length;

    if (lastYearCount === 0) {
      return thisYearCount > 0 ? `+${thisYearCount * 100}%` : "0%";
    }

    const percent = Math.round(((thisYearCount - lastYearCount) / lastYearCount) * 100);
    return percent >= 0 ? `+${percent}%` : `${percent}%`;
  };

  // Close sharing menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveShareMenu(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getShareUrl = (id: string) => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/notes#${id}`;
    }
    return `https://hxtunq.github.io/notes#${id}`;
  };

  const handleCopyLink = async (id: string) => {
    const shareUrl = getShareUrl(id);
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy link: ", err);
    }
  };

  return (
    <section className="w-full min-h-[calc(100svh-4rem)] bg-brand-bg px-4 py-8 md:py-12 flex justify-center">
      <div className="max-w-[630px] w-full">
        <div className="pb-3.5 text-[11px] font-sans text-brand-secondary/60">
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <div>
              <span className="font-bold text-brand-primary">{notesPosts.length}</span> {notesPosts.length === 1 ? "post" : "posts"} <span className="text-green-600 font-semibold">({getYearlyPercentageChange()} vs {new Date().getFullYear() - 1})</span>
            </div>
            <span className="text-brand-surface-highest" aria-hidden="true">•</span>
            <div>
              <span className="font-bold text-brand-primary">{calculatePapersCount()}</span> {calculatePapersCount() === 1 ? "paper" : "papers"} mentioned <span className="text-green-600 font-semibold">({getPapersYearlyPercentageChange()} vs {new Date().getFullYear() - 1})</span>
            </div>
            <span className="text-brand-surface-highest hidden sm:inline" aria-hidden="true">•</span>
            <div className="hidden sm:block">
              <span className="font-bold text-brand-primary">{calculateTopicsCount()}</span> {calculateTopicsCount() === 1 ? "topic" : "topics"} covered
            </div>
            <span className="text-brand-surface-highest hidden sm:inline" aria-hidden="true">•</span>
            <div className="hidden sm:block">
              <span className="font-bold text-brand-primary">{calculateDaysActive()}</span> {calculateDaysActive() === 1 ? "day" : "days"} active
            </div>
          </div>
        </div>

        <div className="bg-brand-surface-lowest border border-brand-surface-highest rounded-xl divide-y divide-brand-surface-highest overflow-hidden shadow-sm">
          {notesPosts.map((post, idx) => {
            return (
              <motion.div
                key={post.id}
                id={post.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: idx * 0.08, ease: "easeOut" }}
                className="flex flex-col sm:flex-row sm:gap-4 py-5 px-4 sm:py-6 sm:px-6 scroll-mt-20 hover:bg-brand-surface-low/10 transition-colors"
              >
                {/* Left Side: Avatar Image (Desktop only) */}
                <div className="hidden sm:flex w-10 h-10 rounded-full overflow-hidden border border-brand-surface-highest shrink-0 select-none bg-brand-bg items-center justify-center">
                  <img
                    src="/assets/images/user-nam8.png"
                    alt={post.authorName}
                    className="w-full h-full object-cover object-center scale-[1.2]"
                    loading="lazy"
                  />
                </div>

                {/* Right Side / Main Contents */}
                <div className="flex-1 min-w-0">
                  {/* Top line metadata (with inline avatar on mobile only) */}
                  <div className="flex items-center justify-between gap-3 mb-1.5 sm:mb-0">
                    <div className="flex items-center gap-2.5 sm:gap-2 min-w-0">
                      {/* Mobile-only inline Avatar */}
                      <div className="sm:hidden w-9 h-9 rounded-full overflow-hidden border border-brand-surface-highest shrink-0 select-none bg-brand-bg flex items-center justify-center">
                        <img
                          src="/assets/images/user-nam8.png"
                          alt={post.authorName}
                          className="w-full h-full object-cover object-center scale-[1.2]"
                          loading="lazy"
                        />
                      </div>

                      {/* Author Name and Date */}
                      <div className="flex items-center gap-2 truncate">
                        <span className="font-sans font-semibold text-[13.5px] text-brand-primary truncate">
                          {post.authorName}
                        </span>
                        <span className="text-brand-surface-highest" aria-hidden="true">·</span>
                        <span className="font-mono text-xs text-brand-on-surface-variant/40 hover:underline shrink-0">
                          {formatRelativeDate(post.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Share action dropdown triggered by ... */}
                    <div className="relative shrink-0" ref={activeShareMenu === post.id ? menuRef : null}>
                      <button
                        onClick={() => setActiveShareMenu(activeShareMenu === post.id ? null : post.id)}
                        className="text-brand-on-surface-variant/40 hover:text-brand-primary p-1 rounded-full hover:bg-brand-surface-high transition-colors cursor-pointer"
                        aria-label="More options"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>

                      {/* Share Dropdown popover */}
                      <AnimatePresence>
                        {activeShareMenu === post.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -4 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -4 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 top-7 z-20 bg-brand-surface-lowest border border-brand-surface-highest rounded-lg shadow-lg py-1.5 w-48 font-sans text-xs text-brand-primary"
                          >
                            <button
                              onClick={() => handleCopyLink(post.id)}
                              className="w-full px-3 py-2 text-left hover:bg-brand-surface-low flex items-center gap-2 cursor-pointer transition-colors"
                            >
                              {copiedId === post.id ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-green-500 shrink-0" />
                                  <span className="text-green-600 font-medium">Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5 text-brand-secondary shrink-0" />
                                  <span>Copy Link</span>
                                </>
                              )}
                            </button>

                            <a
                              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareUrl(post.id))}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => setActiveShareMenu(null)}
                              className="w-full px-3 py-2 text-left hover:bg-brand-surface-low flex items-center gap-2 cursor-pointer transition-colors"
                            >
                              <Facebook className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              <span>Share to Facebook</span>
                            </a>

                            <a
                              href={`https://sp.zalo.me/share_to_zalo?url=${encodeURIComponent(getShareUrl(post.id))}&title=${encodeURIComponent(post.content.slice(0, 100))}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => setActiveShareMenu(null)}
                              className="w-full px-3 py-2 text-left hover:bg-brand-surface-low flex items-center gap-2 cursor-pointer transition-colors"
                            >
                              <Send className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                              <span>Share to Zalo</span>
                            </a>

                            <a
                              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(getShareUrl(post.id))}&text=${encodeURIComponent(post.content.slice(0, 100))}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => setActiveShareMenu(null)}
                              className="w-full px-3 py-2 text-left hover:bg-brand-surface-low flex items-center gap-2 cursor-pointer transition-colors"
                            >
                              <Twitter className="w-3.5 h-3.5 text-brand-primary shrink-0" />
                              <span>Share to X (Twitter)</span>
                            </a>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Body Text (styled as system-sans font-sans matching Facebook/Threads) */}
                  <div className="font-sans text-[13px] sm:text-[13.5px] leading-relaxed text-brand-on-surface text-justify mt-1.5 break-words">
                    {renderInlineStyles(post.content)}
                  </div>

                  {/* Attached Image (Facebook/Threads style image preview) */}
                  {post.imageUrl && (
                    <div
                      className="mt-3 overflow-hidden rounded-lg border border-brand-surface-highest max-h-[300px] sm:max-h-[360px] bg-brand-surface-low select-none cursor-pointer group"
                      onClick={() => setLightboxUrl(post.imageUrl!)}
                    >
                      <img
                        src={post.imageUrl}
                        alt="Attached visualization"
                        className="w-full h-full object-cover object-center max-w-full group-hover:scale-[1.02] transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                  )}

                  {/* Paper Preview (academic paper link) */}
                  {post.paperPreview && (
                    <AutoLinkPreview content="" manualPreview={{ url: post.paperPreview }} />
                  )}

                  {/* URL Preview (general URL preview from frontmatter) */}
                  {post.urlPreview && !post.paperPreview && (
                    <AutoLinkPreview
                      content=""
                      manualPreview={{
                        url: post.urlPreview,
                        title: post.linkPreview?.title,
                        description: post.linkPreview?.description,
                        siteName: post.linkPreview?.siteName,
                        imageUrl: post.linkPreview?.imageUrl,
                      }}
                    />
                  )}

                  {/* Automatic Link Preview (regular links detected from content when neither paperPreview nor urlPreview is specified) */}
                  {!post.paperPreview && !post.urlPreview && (
                    <AutoLinkPreview content={post.content} manualPreview={post.linkPreview} />
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Lightbox Modal for full-size image */}
      <AnimatePresence>
        {lightboxUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 cursor-pointer will-change-[opacity]"
            onClick={() => setLightboxUrl(null)}
            style={{ WebkitBackfaceVisibility: "hidden" }}
          >
            {/* Close button */}
            <button
              onClick={() => setLightboxUrl(null)}
              className="absolute top-4 right-4 z-[60] text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full p-2 cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Full-size image */}
            <motion.img
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              src={lightboxUrl}
              alt="Full size preview"
              className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl cursor-default will-change-transform"
              onClick={(e) => e.stopPropagation()}
              style={{ WebkitBackfaceVisibility: "hidden" }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
