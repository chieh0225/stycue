import type { ImageCategoryId } from '@/lib/image-categories';

export const DRAFT_STORAGE_KEY = 'stycue:share-post-draft';
export const TITLE_MAX_LENGTH = 40;
export const postTypes = ['分享', '委託', '提問'] as const;

// Already-uploaded image (real backend imageId/url), not a local file preview.
export type DraftPhoto = {
  imageId: number;
  url: string;
  category: ImageCategoryId;
  brand: string;
};

export type Draft = {
  title: string;
  description: string;
  postType: (typeof postTypes)[number];
  outfitStyle: string;
  outfitOccasion: string;
  outfitDate: string;
  outfitLocation: string;
  photos: DraftPhoto[];
};

export const emptyDraft: Draft = {
  title: '',
  description: '',
  postType: postTypes[0],
  outfitStyle: '',
  outfitOccasion: '',
  outfitDate: '',
  outfitLocation: '',
  photos: [],
};

// Both the localStorage draft and the server-side draft-tags store are
// global, not scoped per account, so they leak into the next login on the
// same browser unless cleared explicitly — call this on logout and after a
// successful submit (same convention as posts/commissions/new/draft.ts).
export function clearDraftState(): void {
  localStorage.removeItem(DRAFT_STORAGE_KEY);
  fetch('/api/posts/draft-tags', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tags: [] }),
  }).catch(() => {});
}
