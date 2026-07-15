import type { ImageResponse } from '@/types/image';
import type { TagResponse } from '@/types/tag';

export type UserSummaryResponse = {
  userId: number;
  displayName: string;
  avatarUrl: string | null;
};

export type CreateCommissionRequest = {
  title: string;
  content: string;
  height?: number;
  weight?: number;
  age?: number;
  budget?: string;
  points?: number;
  imageIds?: number[];
  tagIds?: number[];
};

// 委託文狀態 => {委託進行中=1, 已過期=2, 提前關閉=3, 積分已發放=4, 流標=5}
export type CommissionStatus = 1 | 2 | 3 | 4 | 5;

export type CommissionRepostResponse = {
  [key: string]: unknown;
};

export type CommissionDetailResponse = {
  commissionId: number;
  author: UserSummaryResponse;
  title: string;
  content: string;
  status: CommissionStatus;
  height: number | null;
  weight: number | null;
  age: number | null;
  budget: string | null;
  points: number;
  awardedCommentId: number | null;
  awardedAt: string | null;
  rewardSettledAt: string | null;
  repostCount: number;
  createdAt: string;
  updatedAt: string | null;
  expiredAt: string;
  closedAt: string | null;
  isOwner: boolean;
  isExpired: boolean;
  canRepost: boolean;
  canBoost: boolean;
  canSelectBestComment: boolean;
  commentCount: number;
  likeCount: number;
  isLiked: boolean;
  favoriteCount: number;
  images: ImageResponse[];
  tags: TagResponse[];
  reposts: CommissionRepostResponse[];
};
