import type { UserSummaryResponse } from '@/types/commission';

export type FollowResponse = {
  targetUserId: number;
  isFollowing: boolean;
  followerCount: number;
};

// The backend includes isFollowing on the user object in GET .../following
// (it's always true there) but omits it in GET .../{id}/followers.
export type FollowUserResponse = {
  user: UserSummaryResponse & { isFollowing?: boolean };
  followedAt: string;
};
