import type { Comment, CommentImage, Reply } from './comments/comment-board';

// Client-side optimistic store for comments/replies added without a backend.
//
// The comment board and the full-page comment template live on different routes,
// so React state does not survive the navigation between them. To make an added
// comment "stick" (appear on the board after submitting, and persist across a
// reload within the tab), we stash pending items in sessionStorage keyed by the
// commission id. The board merges them onto the server mock data on mount.
//
// Only serialisable display data is stored — labels and text, never File blobs.
// The board renders images as labelled placeholder cells, so the original files
// are not needed to reproduce the card.

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

export function addPendingComment(postId: string, comment: PendingComment) {
  const store = read(postId);
  write(postId, { ...store, comments: [...store.comments, comment] });
}

export function addPendingReply(postId: string, commentId: string, reply: Reply) {
  const store = read(postId);
  write(postId, { ...store, replies: [...store.replies, { commentId, reply }] });
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

// Build the labelled placeholder images for a set of attachments. A label reads
// "分類：品牌" when a brand was given, otherwise just the category — mirroring the
// existing mock comment image labels (e.g. 上衣：NET).
export function buildCommentImages(attachments: { tag: string; brand: string }[]): CommentImage[] {
  return attachments.map(({ tag, brand }) => {
    const trimmedBrand = brand.trim();
    return { label: trimmedBrand ? `${tag}：${trimmedBrand}` : tag };
  });
}

// Pick a layout from the attachment count, matching how the board lays out the
// existing mock comments: one image spans full width, a handful scroll
// horizontally, and a larger set tiles into the 3-column grid.
export function pickImageLayout(count: number): Comment['imageLayout'] | undefined {
  if (count === 0) return undefined;
  if (count === 1) return 'single';
  if (count >= 4) return 'grid';
  return 'scroll';
}
