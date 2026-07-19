import type { ApiEnvelope } from '@/types/image';
import type { MyUserProfileResponse } from '@/types/user';

export async function getMyProfile(): Promise<ApiEnvelope<MyUserProfileResponse>> {
  const res = await fetch('/api/users/me/profile');
  return (await res.json()) as ApiEnvelope<MyUserProfileResponse>;
}
