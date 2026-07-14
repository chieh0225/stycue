import type { Comment, Reply } from './comments/comment-board';

// Client-side optimistic store for comments/replies added without a backend.
//
// The comment board and the full-page comment template live on different routes,
// so React state does not survive the navigation between them. To make an added
// comment "stick" (appear on the board after submitting, and persist across a
// reload within the tab), we stash pending items in sessionStorage keyed by the
// commission id. The board merges them onto the server mock data on mount.
//
// Image attachments are stored as the already-"uploaded" { imageId, imageUrl,
// category, brand } records (see add-comment-form's publish()) — never the
// original File blobs.

// A pending top-level comment carries everything a rendered Comment needs except
// `floor`, which is recomputed at merge time from the comment's position.
export type PendingComment = Omit<Comment, 'floor'>;

type PendingReply = { commentId: string; reply: Reply };

type PendingStore = {
  comments: PendingComment[];
  replies: PendingReply[];
};

const EMPTY: PendingStore = { comments: [], replies: [] };

function storageKey(postId: string) {
  return `stycue:pending-comments:${postId}`;
}

function read(postId: string): PendingStore {
  if (typeof window === 'undefined') return EMPTY;
  try {
    const raw = window.sessionStorage.getItem(storageKey(postId));
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<PendingStore>;
    return {
      comments: parsed.comments ?? [],
      replies: parsed.replies ?? [],
    };
  } catch {
    return EMPTY;
  }
}

function write(postId: string, store: PendingStore) {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(storageKey(postId), JSON.stringify(store));
  } catch {
    // sessionStorage can be unavailable (private mode / quota); the optimistic
    // add still shows for the current view, it just will not survive navigation.
  }
}

export function getPendingComment(postId: string, commentId: string): PendingComment | undefined {
  return read(postId).comments.find((comment) => comment.commentId === commentId);
}

export function getPendingReply(
  postId: string,
  commentId: string,
  replyId: string,
): Reply | undefined {
  return read(postId).replies.find(
    (entry) => entry.commentId === commentId && entry.reply.replyId === replyId,
  )?.reply;
}

// Returns false (no-op) if the id is no longer in the store — e.g. the entry
// was created in a different tab/session. Callers fall back to a plain cancel.
export function updatePendingComment(
  postId: string,
  commentId: string,
  patch: Pick<PendingComment, 'content' | 'images'>,
): boolean {
  const store = read(postId);
  const index = store.comments.findIndex((comment) => comment.commentId === commentId);
  if (index === -1) return false;
  const comments = [...store.comments];
  comments[index] = { ...comments[index], ...patch };
  write(postId, { ...store, comments });
  return true;
}

export function updatePendingReply(
  postId: string,
  commentId: string,
  replyId: string,
  patch: Pick<Reply, 'content' | 'images'>,
): boolean {
  const store = read(postId);
  const index = store.replies.findIndex(
    (entry) => entry.commentId === commentId && entry.reply.replyId === replyId,
  );
  if (index === -1) return false;
  const replies = [...store.replies];
  replies[index] = { ...replies[index], reply: { ...replies[index].reply, ...patch } };
  write(postId, { ...store, replies });
  return true;
}

// Returns false (no-op) if the id is no longer in the store — same fallback
// contract as the update* functions above.
export function removePendingComment(postId: string, commentId: string): boolean {
  const store = read(postId);
  const comments = store.comments.filter((comment) => comment.commentId !== commentId);
  if (comments.length === store.comments.length) return false;
  write(postId, { ...store, comments });
  return true;
}

export function removePendingReply(postId: string, commentId: string, replyId: string): boolean {
  const store = read(postId);
  const replies = store.replies.filter(
    (entry) => !(entry.commentId === commentId && entry.reply.replyId === replyId),
  );
  if (replies.length === store.replies.length) return false;
  write(postId, { ...store, replies });
  return true;
}

// Merge the stored pending items onto a base comment list: append pending
// top-level comments (assigning floors after the base ones), then splice each
// pending reply into its parent. Pure in `base` so it is safe to call on every
// mount / re-run without duplicating.
export function mergePendingComments(postId: string, base: Comment[]): Comment[] {
  const { comments, replies } = read(postId);
  if (comments.length === 0 && replies.length === 0) return base;

  const merged: Comment[] = base.map((comment) => ({ ...comment }));

  comments.forEach((pending) => {
    merged.push({ ...pending, floor: `B${merged.length + 1}` });
  });

  if (replies.length === 0) return merged;

  return merged.map((comment) => {
    const extra = replies
      .filter((entry) => entry.commentId === comment.commentId)
      .map((entry) => entry.reply);
    return extra.length > 0
      ? { ...comment, replies: [...(comment.replies ?? []), ...extra] }
      : comment;
  });
}
