import type { ApiEnvelope } from '@/types/image';
import type {
  MyUserProfileResponse,
  PublicUserProfileResponse,
  UpdateUserProfileRequest,
} from '@/types/user';

export async function getMyProfile(): Promise<ApiEnvelope<MyUserProfileResponse>> {
  const res = await fetch('/api/users/me/profile');
  return (await res.json()) as ApiEnvelope<MyUserProfileResponse>;
}

export async function updateMyProfile(
  payload: UpdateUserProfileRequest,
): Promise<ApiEnvelope<MyUserProfileResponse>> {
  const res = await fetch('/api/users/me/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return (await res.json()) as ApiEnvelope<MyUserProfileResponse>;
}

export async function getPublicProfile(
  userId: number,
): Promise<ApiEnvelope<PublicUserProfileResponse>> {
  const res = await fetch(`/api/users/${userId}/profile`);
  return (await res.json()) as ApiEnvelope<PublicUserProfileResponse>;
}
