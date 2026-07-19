import type { UserSummaryResponse } from '@/types/commission';

export type MyUserProfileResponse = {
  user: UserSummaryResponse;
  bio: string | null;
  // Wire format not yet confirmed against a live response (see HomepageItemResponse's
  // commissionStatus for the same caveat) — kept loose rather than guessing the value set.
  gender: string | null;
  height: number | null;
  weight: number | null;
  birthDate: string | null;
};

export type PublicUserProfileResponse = {
  user: UserSummaryResponse;
  bio: string | null;
  followingCount: number;
  followerCount: number;
  isFollowing: boolean | null;
};
