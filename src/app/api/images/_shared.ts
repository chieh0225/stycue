import { cookies } from 'next/headers';

const ACCESS_TOKEN_COOKIE = 'stycue_access_token';

export async function getAuthHeader(): Promise<{ Authorization: string } | null> {
  const store = await cookies();
  const token = store.get(ACCESS_TOKEN_COOKIE)?.value;
  return token ? { Authorization: `Bearer ${token}` } : null;
}
