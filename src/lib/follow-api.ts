import type { FollowResponse, FollowUserResponse } from '@/types/follow';
import type { ApiEnvelope } from '@/types/image';
import type { PagedResponse } from '@/types/points';

export async function followUser(targetUserId: string): Promise<ApiEnvelope<FollowResponse>> {
  const res = await fetch(`/api/users/me/follow/${targetUserId}`, { method: 'POST' });
  return (await res.json()) as ApiEnvelope<FollowResponse>;
}

export async function unfollowUser(targetUserId: string): Promise<ApiEnvelope<FollowResponse>> {
  const res = await fetch(`/api/users/me/follow/${targetUserId}`, { method: 'DELETE' });
  return (await res.json()) as ApiEnvelope<FollowResponse>;
}

export async function getMyFollowing(
  page = 1,
  pageSize = 20,
): Promise<ApiEnvelope<PagedResponse<FollowUserResponse>>> {
  const res = await fetch(`/api/users/me/following?Page=${page}&PageSize=${pageSize}`);
  return (await res.json()) as ApiEnvelope<PagedResponse<FollowUserResponse>>;
}

export async function getFollowers(
  targetUserId: string,
  page = 1,
  pageSize = 20,
): Promise<ApiEnvelope<PagedResponse<FollowUserResponse>>> {
  const res = await fetch(`/api/users/${targetUserId}/followers?Page=${page}&PageSize=${pageSize}`);
  return (await res.json()) as ApiEnvelope<PagedResponse<FollowUserResponse>>;
}
