import type { ImageResponse } from '@/types/image';
import type { TagResponse } from '@/types/tag';

// Backend openapi.json types PostType as a bare integer with no enum list
// (generator quirk — same as TagCategory, see normalizeTagCategory), but its
// description spells out the literal wire values: "share = 分享文；question = 提問文".
export type PostType = 'share' | 'question';

export type PostAuthorResponse = {
  userId: number;
  displayName: string;
  avatarUrl: string | null;
  isFollowing: boolean | null;
};

export type CreatePostRequest = {
  title: string;
  content: string;
  postType: PostType;
  imageIds?: number[];
  tagIds?: number[];
};

export type PostDetailResponse = {
  postId: number;
  author: PostAuthorResponse;
  title: string;
  content: string;
  postType: PostType;
  createdAt: string;
  updatedAt: string | null;
  isOwner: boolean;
  canEdit: boolean;
  canDelete: boolean;
  likeCount: number;
  commentCount: number;
  favoriteCount: number;
  isLiked: boolean | null;
  isFavorited: boolean | null;
  images: ImageResponse[];
  tags: TagResponse[];
};

const POST_TYPE_VALUES: PostType[] = ['share', 'question'];

// Mirrors normalizeTagCategory in @/types/tag — the backend has been
// observed returning enums as either their numeric value or a lowercase
// string name, so normalize defensively rather than trust the string type.
export function normalizePostType(value: unknown): PostType | null {
  if (typeof value === 'string') {
    const lower = value.toLowerCase();
    return POST_TYPE_VALUES.includes(lower as PostType) ? (lower as PostType) : null;
  }
  return null;
}
