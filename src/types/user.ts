import type { UserSummaryResponse } from '@/types/commission';

export type MyUserProfileResponse = {
  user: UserSummaryResponse;
  avatarImageId: number | null;
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

// Wire format for `gender` not yet confirmed against a live response (see
// MyUserProfileResponse's caveat above) — kept as a plain string rather than
// guessing the value set.
//
// Avatar is managed entirely through the images endpoints (POST /api/images/avatar,
// DELETE /api/images/{imageId}) — this request no longer carries avatarImageId.
// height/weight/birthDate are strings (not numbers): an empty string clears the
// field, matching bio's existing clear semantics; omitting or sending null leaves
// it unchanged.
export type UpdateUserProfileRequest = {
  nickName?: string | null;
  bio?: string | null;
  gender?: string | null;
  height?: string | null;
  weight?: string | null;
  birthDate?: string | null;
};
