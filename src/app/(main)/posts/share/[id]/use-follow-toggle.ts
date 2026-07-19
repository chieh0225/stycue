'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { followUser, unfollowUser } from '@/lib/follow-api';

// Same as posts/commissions/[id]/use-follow-toggle.ts, kept as its own copy
// per the share-post convention (see use-favorite-toggle.ts).
export function useFollowToggle(
  targetUserId: string,
  initialFollowing: boolean,
  isLoggedIn: boolean,
) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing);

  async function toggleFollow() {
    if (!isLoggedIn) {
      toast('請先登入才能追蹤');
      return;
    }
    const wasFollowing = isFollowing;
    setIsFollowing(!wasFollowing);

    const result = wasFollowing ? await unfollowUser(targetUserId) : await followUser(targetUserId);
    if (!result.success || !result.data) {
      setIsFollowing(wasFollowing);
      return;
    }
    setIsFollowing(result.data.isFollowing);
  }

  return { isFollowing, toggleFollow };
}
