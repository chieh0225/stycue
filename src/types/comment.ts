import type { UserSummaryResponse } from '@/types/commission';
import type { ImageResponse } from '@/types/image';

export type CommentResponse = {
  commentId: number;
  author: UserSummaryResponse;
  postId: number | null;
  commissionId: number | null;
  parentCommentId: number | null;
  content: string;
  createdAt: string;
  updatedAt: string | null;
  isOwner: boolean;
  canEdit: boolean;
  canDelete: boolean;
  likeCount: number;
  isLiked: boolean;
  images: ImageResponse[];
  replies: CommentResponse[];
};

export type UpsertCommentRequest = {
  content: string;
  imageIds?: number[];
};
