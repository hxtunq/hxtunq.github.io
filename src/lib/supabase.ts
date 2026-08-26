/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import { createClient, SupabaseClient, User } from "@supabase/supabase-js";

// Read Supabase environment variables
const rawUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
const supabaseUrl = rawUrl?.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith("https://") &&
  supabaseAnonKey.length > 20
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

export interface CommentItem {
  id: string;
  post_id: string;
  parent_id?: string | null;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  user_provider?: "google" | "github" | "email" | string;
  content: string;
  reactions?: Record<string, string[]>; // e.g. { "👍": ["userId1", "userId2"], "❤️": ["userId3"] }
  created_at: string;
}

/**
 * Sign in with Google or GitHub OAuth
 */
export async function signInWithProvider(provider: "google" | "github"): Promise<{ error: Error | null }> {
  if (!supabase) {
    return { error: new Error("Supabase is not configured yet.") };
  }
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.href,
      },
    });
    return { error: error ? new Error(error.message) : null };
  } catch (err: any) {
    return { error: err };
  }
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<{ error: Error | null }> {
  if (!supabase) return { error: null };
  try {
    const { error } = await supabase.auth.signOut();
    return { error: error ? new Error(error.message) : null };
  } catch (err: any) {
    return { error: err };
  }
}

/**
 * Fetch all comments for a specific post
 */
export async function fetchComments(postId: string): Promise<{ data: CommentItem[]; error: Error | null }> {
  if (!supabase) {
    return { data: [], error: null };
  }

  try {
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (error) {
      return { data: [], error: new Error(error.message) };
    }
    return { data: (data as CommentItem[]) || [], error: null };
  } catch (err: any) {
    return { data: [], error: err };
  }
}

/**
 * Add a new comment or reply to a post
 */
export async function addComment(
  postId: string,
  content: string,
  currentUser: User,
  parentId?: string | null
): Promise<{ data: CommentItem | null; error: Error | null }> {
  if (!supabase) {
    return { error: new Error("Supabase is not configured yet."), data: null };
  }

  const rawMetadata = currentUser.user_metadata || {};
  const provider = currentUser.app_metadata?.provider || "unknown";
  const userName =
    rawMetadata.full_name ||
    rawMetadata.name ||
    rawMetadata.user_name ||
    currentUser.email?.split("@")[0] ||
    "Reader";
  const userAvatar =
    rawMetadata.avatar_url ||
    rawMetadata.picture ||
    currentUser.identities?.[0]?.identity_data?.avatar_url ||
    currentUser.identities?.[0]?.identity_data?.picture ||
    "";

  try {
    const { data, error } = await supabase
      .from("comments")
      .insert([
        {
          post_id: postId,
          parent_id: parentId || null,
          user_id: currentUser.id,
          user_name: userName,
          user_avatar: userAvatar,
          user_provider: provider,
          content: content.trim(),
          reactions: {},
        },
      ])
      .select()
      .single();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }
    return { data: data as CommentItem, error: null };
  } catch (err: any) {
    return { data: null, error: err };
  }
}

/**
 * Toggle emoji reaction for a comment
 */
export async function toggleReaction(
  commentId: string,
  emoji: string,
  userId: string,
  currentReactions: Record<string, string[]> = {}
): Promise<{ error: Error | null; updatedReactions: Record<string, string[]> }> {
  if (!supabase) {
    const updated = { ...currentReactions };
    const userList = updated[emoji] ? [...updated[emoji]] : [];
    const idx = userList.indexOf(userId);
    if (idx >= 0) userList.splice(idx, 1);
    else userList.push(userId);
    if (userList.length > 0) updated[emoji] = userList;
    else delete updated[emoji];
    return { error: null, updatedReactions: updated };
  }

  try {
    // 1. Fetch freshest reactions from Supabase to prevent race-condition overwrite
    const { data: latestComment, error: fetchErr } = await supabase
      .from("comments")
      .select("reactions")
      .eq("id", commentId)
      .single();

    const baseReactions: Record<string, string[]> =
      !fetchErr && latestComment?.reactions && typeof latestComment.reactions === "object"
        ? latestComment.reactions
        : currentReactions;

    const updated = { ...baseReactions };
    const userList = Array.isArray(updated[emoji]) ? [...updated[emoji]] : [];
    const existingIndex = userList.indexOf(userId);

    if (existingIndex >= 0) {
      userList.splice(existingIndex, 1);
    } else {
      userList.push(userId);
    }

    if (userList.length > 0) {
      updated[emoji] = userList;
    } else {
      delete updated[emoji];
    }

    // 2. Perform database update
    const { error: updateErr } = await supabase
      .from("comments")
      .update({ reactions: updated })
      .eq("id", commentId);

    if (updateErr) {
      console.error("[Supabase toggleReaction Error]:", updateErr);
      return { error: new Error(updateErr.message), updatedReactions: currentReactions };
    }

    return { error: null, updatedReactions: updated };
  } catch (err: any) {
    console.error("[Supabase toggleReaction Exception]:", err);
    return { error: err, updatedReactions: currentReactions };
  }
}

/**
 * Delete a comment by ID (must belong to current user per RLS)
 */
export async function deleteComment(commentId: string): Promise<{ error: Error | null }> {
  if (!supabase) {
    return { error: new Error("Supabase is not configured yet.") };
  }

  try {
    const { error } = await supabase.from("comments").delete().eq("id", commentId);
    if (error) {
      return { error: new Error(error.message) };
    }
    return { error: null };
  } catch (err: any) {
    return { error: err };
  }
}
