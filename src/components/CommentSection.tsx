/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import { User } from "@supabase/supabase-js";
import {
  supabase,
  isSupabaseConfigured,
  CommentItem,
  signInWithProvider,
  signOut,
  fetchComments,
  addComment,
  deleteComment,
  toggleReaction
} from "../lib/supabase";

interface CommentSectionProps {
  postId: string;
  postTitle?: string;
}

const EMOJI_REACTIONS = [
  { emoji: "👍", label: "Like" },
  { emoji: "❤️", label: "Love" },
  { emoji: "🌸", label: "Blossom" },
  { emoji: "💡", label: "Insight" },
  { emoji: "👏", label: "Clap" },
  { emoji: "😂", label: "Haha" },
  { emoji: "🔥", label: "Fire" },
  { emoji: "🐧", label: "Penguin" },
  { emoji: "🦖", label: "Dino" },
  { emoji: "🐍", label: "Snake" },
  { emoji: "🪨", label: "Rock" },
];

function NativeEmoji({ emoji, className = "" }: { emoji: string; className?: string }) {
  return (
    <span className={`inline-flex items-center justify-center leading-none ${className}`}>
      {emoji}
    </span>
  );
}

const AUTHOR_AVATAR = "/assets/images/user-nam8.png";
const DEFAULT_USER_AVATAR = "/assets/images/chii-meme.jpg";

function formatCommentDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[d.getMonth()];
    const day = d.getDate();
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes} — ${month} ${day}, ${year}`;
  } catch {
    return isoString;
  }
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const [user, setUser] = useState<User | null>(null);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [activeReactionPickerId, setActiveReactionPickerId] = useState<string | null>(null);
  const [expandedReplyIds, setExpandedReplyIds] = useState<Record<string, boolean>>({});
  const [statusMessage, setStatusMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const pickerRef = useRef<HTMLDivElement | null>(null);

  // Close reaction picker on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest('[data-reaction-container="true"]')) {
        return;
      }
      setActiveReactionPickerId(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Monitor Auth Session
  useEffect(() => {
    if (!supabase) {
      setUser(null);
      setComments([]);
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Fetch comments + Subscribe to Realtime updates
  const loadComments = useCallback(async (showLoading = true) => {
    if (!isSupabaseConfigured) {
      setComments([]);
      if (showLoading) setLoading(false);
      return;
    }

    if (showLoading) setLoading(true);
    const { data, error } = await fetchComments(postId);
    if (!error && data) {
      setComments(data);
    } else {
      setComments([]);
    }
    if (showLoading) setLoading(false);
  }, [postId]);

  useEffect(() => {
    loadComments(true);

    if (!supabase || !isSupabaseConfigured) return;

    // Realtime channel: listen to INSERT, UPDATE (reactions), DELETE on comments table for this post
    const channel = supabase
      .channel(`realtime-comments-${postId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comments",
          filter: `post_id=eq.${postId}`,
        },
        () => {
          // Refresh comments in the background silently
          loadComments(false);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadComments, postId]);

  const handleLogin = async (provider: "google" | "github") => {
    setStatusMessage(null);
    if (!isSupabaseConfigured) {
      setStatusMessage({
        type: "error",
        text: "Supabase is not configured yet. Please add API keys to .env."
      });
      return;
    }
    const { error } = await signInWithProvider(provider);
    if (error) {
      setStatusMessage({ type: "error", text: error.message });
    }
  };

  const handleLogout = async () => {
    await signOut();
    setUser(null);
  };

  const toggleReplies = (commentId: string) => {
    setExpandedReplyIds((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const isAuthorUserId = useCallback((id: string) => {
    if (id === "demo-user-author" || id === "author") return true;
    if (user && user.id === id) {
      const name = (
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.user_metadata?.user_name ||
        user.email ||
        ""
      ).toLowerCase();
      if (name.includes("tung") || name.includes("hxtunq") || name.includes("hoang")) return true;
    }
    return false;
  }, [user]);

  // Submit main comment
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    if (!isSupabaseConfigured) {
      const demo: CommentItem = {
        id: `demo-${Date.now()}`,
        post_id: postId,
        parent_id: null,
        user_id: "demo-guest",
        user_name: "Guest Reader",
        user_avatar: "",
        user_provider: "google",
        content: commentText.trim(),
        reactions: {},
        created_at: new Date().toISOString(),
      };
      setComments((prev) => [...prev, demo]);
      setCommentText("");
      setStatusMessage({ type: "success", text: "Comment submitted." });
      setTimeout(() => setStatusMessage(null), 3000);
      return;
    }

    if (!user) {
      setStatusMessage({ type: "error", text: "Please sign in to leave a comment." });
      setTimeout(() => setStatusMessage(null), 3000);
      return;
    }

    setSubmitting(true);
    setStatusMessage(null);

    const { data, error } = await addComment(postId, commentText, user);
    if (error) {
      setStatusMessage({ type: "error", text: error.message });
    } else if (data) {
      setComments((prev) => [...prev, data]);
      setCommentText("");
      setStatusMessage({ type: "success", text: "Comment published successfully." });
      setTimeout(() => setStatusMessage(null), 3000);
    }
    setSubmitting(false);
  };

  // Submit nested reply
  const handleReplySubmit = async (parentId: string) => {
    if (!replyText.trim()) return;

    if (!user) {
      setStatusMessage({ type: "error", text: "Please sign in to reply." });
      setTimeout(() => setStatusMessage(null), 3000);
      return;
    }

    if (!isSupabaseConfigured) {
      const demoReply: CommentItem = {
        id: `demo-reply-${Date.now()}`,
        post_id: postId,
        parent_id: parentId,
        user_id: user.id || "demo-guest",
        user_name: getUserDisplayName(),
        user_avatar: getUserAvatar(),
        user_provider: "google",
        content: replyText.trim(),
        reactions: {},
        created_at: new Date().toISOString(),
      };
      setComments((prev) => [...prev, demoReply]);
      setReplyText("");
      setReplyingToId(null);
      setExpandedReplyIds((prev) => ({ ...prev, [parentId]: true }));
      return;
    }

    setSubmittingReply(true);
    const { data, error } = await addComment(postId, replyText, user, parentId);
    if (error) {
      setStatusMessage({ type: "error", text: error.message });
    } else if (data) {
      setComments((prev) => [...prev, data]);
      setReplyText("");
      setReplyingToId(null);
      setExpandedReplyIds((prev) => ({ ...prev, [parentId]: true }));
    }
    setSubmittingReply(false);
  };

  // Toggle reaction (Auth Guarded)
  const handleToggleReaction = async (commentId: string, emoji: string) => {
    if (!user) {
      setStatusMessage({ type: "error", text: "Please sign in to react to comments." });
      setTimeout(() => setStatusMessage(null), 3000);
      setActiveReactionPickerId(null);
      return;
    }

    const activeUserId = user.id;

    // Optimistic UI update
    setComments((prev) =>
      prev.map((c) => {
        if (c.id !== commentId) return c;
        const current = c.reactions || {};
        const list = current[emoji] ? [...current[emoji]] : [];
        const idx = list.indexOf(activeUserId);
        if (idx >= 0) {
          list.splice(idx, 1);
        } else {
          list.push(activeUserId);
        }

        const nextReactions = { ...current };
        if (list.length > 0) {
          nextReactions[emoji] = list;
        } else {
          delete nextReactions[emoji];
        }
        return { ...c, reactions: nextReactions };
      })
    );

    setActiveReactionPickerId(null);

    if (isSupabaseConfigured) {
      const comment = comments.find((c) => c.id === commentId);
      const { error, updatedReactions } = await toggleReaction(commentId, emoji, user.id, comment?.reactions);
      if (error) {
        setStatusMessage({
          type: "error",
          text: `Cannot save reaction: ${error.message}. Check Supabase RLS policy for UPDATE.`
        });
        setTimeout(() => setStatusMessage(null), 5000);
        loadComments(false);
      } else {
        setComments((prev) =>
          prev.map((c) => (c.id === commentId ? { ...c, reactions: updatedReactions } : c))
        );
      }
    }
  };

  // Delete comment / reply (Author or Owner can delete)
  const handleDelete = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    if (!isSupabaseConfigured) {
      setComments((prev) => prev.filter((c) => c.id !== commentId && c.parent_id !== commentId));
      return;
    }

    const { error } = await deleteComment(commentId);
    if (error) {
      setStatusMessage({ type: "error", text: error.message });
    } else {
      setComments((prev) => prev.filter((c) => c.id !== commentId && c.parent_id !== commentId));
    }
  };

  const getUserDisplayName = () => {
    if (!user) return "";
    return (
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.user_metadata?.user_name ||
      user.email?.split("@")[0] ||
      "Reader"
    );
  };

  const getUserAvatar = () => {
    if (!user) return "";
    const meta = user.user_metadata || {};
    return (
      meta.avatar_url ||
      meta.picture ||
      user.identities?.[0]?.identity_data?.avatar_url ||
      user.identities?.[0]?.identity_data?.picture ||
      ""
    );
  };

  // Group comments: top-level vs nested replies
  const topLevelComments = comments.filter((c) => !c.parent_id);
  const repliesByParentId = comments.reduce<Record<string, CommentItem[]>>((acc, c) => {
    if (c.parent_id) {
      if (!acc[c.parent_id]) acc[c.parent_id] = [];
      acc[c.parent_id].push(c);
    }
    return acc;
  }, {});

  const renderCommentItem = (item: CommentItem, isReply = false) => {
    const isOwner = user && user.id === item.user_id;
    const isAuthor = user && isAuthorUserId(user.id);
    const canDelete = isOwner || isAuthor;
    const currentUserId = user ? user.id : "";
    const reactions = item.reactions || {};
    const reactionEntries = Object.entries(reactions).filter(([_, uIds]) => uIds.length > 0);
    const hasUserReacted = (emoji: string) => (reactions[emoji] || []).includes(currentUserId);
    const isPickerOpen = activeReactionPickerId === item.id;
    const childReplies = repliesByParentId[item.id] || [];
    const isExpanded = Boolean(expandedReplyIds[item.id]);

    // Check if author reacted to this comment
    let authorReactEmoji: string | null = null;
    for (const [emoji, uIds] of Object.entries(reactions)) {
      if (uIds.some((uid) => isAuthorUserId(uid))) {
        authorReactEmoji = emoji;
        break;
      }
    }

    return (
      <article
        key={item.id}
        className={`${isReply ? "pt-3 pb-2" : "py-4 first:pt-0"} flex gap-3 sm:gap-3.5 transition-colors`}
      >
        {/* Left: YouTube-style Prominent Circular Avatar */}
        <div className="shrink-0 pt-0.5">
          <img
            src={item.user_avatar || DEFAULT_USER_AVATAR}
            alt={item.user_name}
            className={`${
              isReply ? "w-6 h-6 sm:w-7 sm:h-7" : "w-8 h-8 sm:w-9 sm:h-9"
            } rounded-full object-cover border border-brand-surface-highest shrink-0`}
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLImageElement).src = DEFAULT_USER_AVATAR;
            }}
          />
        </div>

        {/* Right: Content Column (Name + Body + Reactions + Replies) */}
        <div className="flex-1 min-w-0">
          {/* Author Name + Timestamp + Delete */}
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2">
              <span className="font-sans font-semibold text-xs sm:text-[13px] text-brand-primary leading-none">
                {item.user_name}
              </span>
              <span className="text-[10.5px] font-mono text-brand-secondary leading-none">
                {formatCommentDate(item.created_at)}
              </span>
            </div>

            {canDelete && (
              <button
                onClick={() => handleDelete(item.id)}
                className="text-[11px] text-brand-secondary hover:text-rose-500 underline transition-colors cursor-pointer leading-none"
              >
                Delete
              </button>
            )}
          </div>

          {/* Comment Body */}
          <p className="font-sans text-xs sm:text-[13px] leading-relaxed text-justify text-brand-on-surface whitespace-pre-wrap break-words mb-2">
            {item.content}
          </p>

          {/* Actions Row: Reactions + Author Heart Badge + Reply Button */}
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-brand-secondary relative">
            {/* Like Button */}
            <button
              type="button"
              onClick={() => {
                if (!user) {
                  setStatusMessage({ type: "error", text: "Please sign in to like comments." });
                  setTimeout(() => setStatusMessage(null), 3000);
                  return;
                }
                handleToggleReaction(item.id, "👍");
              }}
              className={`hover:text-brand-primary transition-colors cursor-pointer flex items-center gap-1 font-medium ${hasUserReacted("👍") ? "text-brand-primary" : ""}`}
            >
              <span>Like</span>
            </button>

            {/* Reaction Bar / Button (Auth Guarded with 1-click toggle) */}
            <div data-reaction-container="true" className="relative inline-block">
              <button
                type="button"
                onClick={() => {
                  if (!user) {
                    setStatusMessage({ type: "error", text: "Please sign in to react to comments." });
                    setTimeout(() => setStatusMessage(null), 3000);
                    return;
                  }
                  setActiveReactionPickerId((prev) => (prev === item.id ? null : item.id));
                }}
                className="hover:text-brand-primary transition-colors cursor-pointer flex items-center gap-1 font-medium"
              >
                <span>React</span>
              </button>

              {/* Floating Facebook iOS-style Reactions Popover Dock */}
              {isPickerOpen && (
                <div
                  ref={pickerRef}
                  className="absolute bottom-full left-0 mb-2.5 z-40 flex items-center gap-1 px-2.5 py-1.5 bg-brand-surface-lowest/95 backdrop-blur-md border border-brand-surface-highest rounded-full shadow-[0_10px_35px_rgba(0,0,0,0.2)] animate-in fade-in zoom-in-95 duration-150 max-w-[90vw] overflow-x-auto scrollbar-none"
                >
                  {EMOJI_REACTIONS.map(({ emoji, label }) => (
                    <button
                      key={emoji}
                      onClick={() => handleToggleReaction(item.id, emoji)}
                      title={label}
                      className="group/emoji relative flex flex-col items-center justify-center p-1 hover:scale-140 hover:-translate-y-2.5 transition-all duration-150 ease-out cursor-pointer outline-none"
                    >
                      {/* iOS-style floating tooltip label on hover */}
                      <span className="opacity-0 group-hover/emoji:opacity-100 pointer-events-none absolute -top-7 bg-black/85 text-white text-[9.5px] font-sans font-medium px-2 py-0.5 rounded-full whitespace-nowrap shadow-md transition-opacity duration-150">
                        {label}
                      </span>
                      <NativeEmoji emoji={emoji} className="text-lg sm:text-xl w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Render Active Reaction Badges (iOS Style) */}
            {reactionEntries.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                {reactionEntries.map(([emoji, userList]) => {
                  const active = hasUserReacted(emoji);
                  return (
                    <button
                      key={emoji}
                      onClick={() => {
                        if (!user) {
                          setStatusMessage({ type: "error", text: "Please sign in to react to comments." });
                          setTimeout(() => setStatusMessage(null), 3000);
                          return;
                        }
                        handleToggleReaction(item.id, emoji);
                      }}
                      className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono border transition-all cursor-pointer ${
                        active
                          ? "bg-brand-surface-low border-brand-primary/60 text-brand-primary font-bold shadow-2xs"
                          : "bg-brand-surface-lowest border-brand-surface-highest text-brand-secondary hover:border-brand-primary/40"
                      }`}
                    >
                      <NativeEmoji emoji={emoji} className="text-[13px] w-3.5 h-3.5" />
                      <span>{userList.length}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* YouTube Style Author Heart Badge (Author Avatar + mini ❤️ pin) */}
            {authorReactEmoji && (
              <div
                className="relative inline-flex items-center justify-center shrink-0 cursor-default"
                title={`Hearted by Author (${authorReactEmoji})`}
              >
                <img
                  src={AUTHOR_AVATAR}
                  alt="Author"
                  className="w-4.5 h-4.5 rounded-full object-cover border border-brand-surface-highest bg-brand-bg shadow-2xs"
                />
                <NativeEmoji emoji="❤️" className="text-[10px] w-2.5 h-2.5 absolute -bottom-1 -right-1 drop-shadow-xs" />
              </div>
            )}

            {/* Reply Button (Only on top-level comments) */}
            {!isReply && (
              <button
                onClick={() => {
                  if (!user) {
                    setStatusMessage({ type: "error", text: "Please sign in to reply." });
                    setTimeout(() => setStatusMessage(null), 3000);
                    return;
                  }
                  setReplyingToId(replyingToId === item.id ? null : item.id);
                  setReplyText("");
                }}
                className="hover:text-brand-primary transition-colors cursor-pointer font-medium"
              >
                {replyingToId === item.id ? "Cancel reply" : "Reply"}
              </button>
            )}
          </div>

          {/* Inline Reply Form */}
          {replyingToId === item.id && (
            <div className="mt-3 pl-3 sm:pl-3.5 border-l-2 border-brand-surface-highest">
              <div className="text-[11px] text-brand-secondary mb-1.5">
                Replying to <strong className="text-brand-primary">{item.user_name}</strong>
              </div>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={2}
                placeholder="Write a reply..."
                className="w-full p-2.5 rounded-none bg-brand-surface-lowest border border-brand-surface-highest text-brand-on-surface text-xs focus:outline-none focus:border-brand-primary transition-colors"
              />
              <div className="flex items-center justify-end gap-2 mt-1.5">
                <button
                  type="button"
                  onClick={() => setReplyingToId(null)}
                  className="px-3 py-1 text-xs text-brand-secondary hover:text-brand-primary cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={submittingReply || !replyText.trim()}
                  onClick={() => handleReplySubmit(item.id)}
                  className="px-3.5 py-1 bg-brand-primary text-brand-surface-lowest text-xs font-medium hover:opacity-90 disabled:opacity-40 cursor-pointer"
                >
                  {submittingReply ? "Replying..." : "Post Reply"}
                </button>
              </div>
            </div>
          )}

          {/* Collapsible Trigger for Child Replies (YouTube Style: ▼ N replies) */}
          {!isReply && childReplies.length > 0 && (
            <div className="mt-2.5">
              <button
                onClick={() => toggleReplies(item.id)}
                className="flex items-center gap-1.5 text-xs font-semibold text-brand-secondary hover:text-brand-primary transition-colors cursor-pointer py-0.5"
              >
                <span className="text-[9px] transform transition-transform">
                  {isExpanded ? "▲" : "▼"}
                </span>
                <span>
                  {isExpanded
                    ? "Hide replies"
                    : `${childReplies.length} ${childReplies.length === 1 ? "reply" : "replies"}`}
                </span>
              </button>
            </div>
          )}

          {/* Collapsible Nested Child Replies */}
          {childReplies.length > 0 && isExpanded && (
            <div className="mt-2 space-y-1">
              {childReplies.map((reply) => renderCommentItem(reply, true))}
            </div>
          )}
        </div>
      </article>
    );
  };

  return (
    <section className="mt-10 font-sans">
      {/* Horizontal Divider matching abstract-content divider */}
      <div className="h-[1.5px] bg-brand-surface-highest mb-8"></div>

      {/* Editorial Header */}
      <div className="flex items-baseline justify-between mb-4">
        <div className="flex items-baseline gap-2">
          <h3 className="font-sans font-bold text-sm sm:text-[15px] uppercase tracking-wider text-brand-primary">
            Comments
          </h3>
          <span className="text-xs font-mono text-brand-secondary">
            ({comments.length})
          </span>
        </div>
      </div>

      {/* Status Notice */}
      {statusMessage && (
        <div
          className={`mb-4 py-2 px-3 text-xs rounded border ${
            statusMessage.type === "error"
              ? "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400"
              : "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
          }`}
        >
          {statusMessage.text}
        </div>
      )}

      {/* Clean YouTube-style Comment Input Box */}
      <div className="mb-8 flex gap-3 sm:gap-3.5 items-start">
        {/* Left: Prominent Avatar */}
        <div className="shrink-0 pt-0.5">
          <img
            src={getUserAvatar() || DEFAULT_USER_AVATAR}
            alt="avatar"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border border-brand-surface-highest shrink-0"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLImageElement).src = DEFAULT_USER_AVATAR;
            }}
          />
        </div>

        {/* Right: Textarea + Action buttons */}
        <div className="flex-1 min-w-0">
          {user ? (
            /* User Logged In Form */
            <form onSubmit={handleSubmit} className="space-y-2">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={2}
                placeholder="Share your perspective or leave a comment..."
                className="w-full p-2.5 sm:p-3 rounded-none bg-brand-surface-lowest border border-brand-surface-highest text-brand-on-surface text-xs sm:text-[13px] leading-relaxed focus:outline-none focus:border-brand-primary transition-colors placeholder:text-brand-on-surface-variant/60 resize-y"
              />

              <div className="flex flex-wrap items-center justify-between gap-3 pt-0.5 text-xs">
                <div className="flex items-center gap-1.5 text-brand-secondary">
                  <span className="text-brand-on-surface text-[11.5px]">
                    Commenting as: <strong className="text-brand-primary font-semibold">{getUserDisplayName()}</strong>
                  </span>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="text-brand-secondary hover:text-brand-primary underline transition-colors cursor-pointer text-[11px]"
                  >
                    Sign out
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !commentText.trim()}
                  className="px-4 py-1.5 bg-brand-primary text-brand-surface-lowest text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-40 cursor-pointer"
                >
                  {submitting ? "Posting..." : "Post Comment"}
                </button>
              </div>
            </form>
          ) : (
            /* User Not Logged In Form */
            <form onSubmit={handleSubmit} className="space-y-2">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={2}
                placeholder="Share your perspective or leave a comment..."
                className="w-full p-2.5 sm:p-3 rounded-none bg-brand-surface-lowest border border-brand-surface-highest text-brand-on-surface text-xs sm:text-[13px] leading-relaxed focus:outline-none focus:border-brand-primary transition-colors placeholder:text-brand-on-surface-variant/60 resize-y"
              />

              <div className="flex flex-wrap items-center justify-between gap-3 pt-0.5">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-brand-on-surface-variant text-[11.5px]">Sign in to post:</span>
                  <button
                    type="button"
                    onClick={() => handleLogin("google")}
                    className="flex items-center gap-1 px-2.5 py-1 border border-brand-surface-highest hover:border-brand-primary bg-brand-surface-lowest text-brand-primary font-medium text-xs transition-colors cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    <span>Google</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleLogin("github")}
                    className="flex items-center gap-1 px-2.5 py-1 border border-brand-surface-highest hover:border-brand-primary bg-brand-surface-lowest text-brand-primary font-medium text-xs transition-colors cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                    </svg>
                    <span>GitHub</span>
                  </button>
                </div>

                <button
                  type="submit"
                  className="px-4 py-1.5 bg-brand-primary text-brand-surface-lowest text-xs font-medium hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Post Comment
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Full-width Comments Stream */}
      <div className="divide-y divide-brand-surface-highest/60">
        {loading ? (
          <div className="py-6 text-brand-secondary text-xs font-mono">
            Loading comments...
          </div>
        ) : topLevelComments.length === 0 ? null : (
          topLevelComments.map((item) => renderCommentItem(item, false))
        )}
      </div>
    </section>
  );
}
