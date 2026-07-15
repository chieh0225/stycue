export type LikeTargetType = 'comment' | 'commission' | 'post';

export type LikeResponse = {
  targetType: LikeTargetType;
  targetId: number;
  isLiked: boolean;
  likeCount: number;
};
