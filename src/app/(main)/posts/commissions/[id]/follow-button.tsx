'use client';

import { Button } from '@/components/ui/button';
import { useFollowToggle } from './use-follow-toggle';

export default function FollowButton({
  targetUserId,
  initialFollowing,
  isLoggedIn,
}: {
  targetUserId: string;
  initialFollowing: boolean;
  isLoggedIn: boolean;
}) {
  const { isFollowing, toggleFollow } = useFollowToggle(targetUserId, initialFollowing, isLoggedIn);

  return (
    <Button
      type="button"
      size="sm"
      variant={isFollowing ? 'secondary' : 'primary'}
      aria-pressed={isFollowing}
      onClick={toggleFollow}
    >
      {isFollowing ? '追蹤中' : '追蹤'}
    </Button>
  );
}
