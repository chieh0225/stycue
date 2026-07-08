const AUTH_STORAGE_KEY = 'stycue:authed';
const USER_STORAGE_KEY = 'stycue:user';

export type AuthedUser = {
  email: string;
  nickName: string;
  role: string;
};

// The real accessToken lives in an httpOnly cookie set by our own /api/auth/*
// routes, never in localStorage. This flag + user info is only a client-side
// display/gating convenience.
export function isAuthed(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(AUTH_STORAGE_KEY) === 'true';
}

export function setAuthed(user: AuthedUser): void {
  localStorage.setItem(AUTH_STORAGE_KEY, 'true');
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

export function getAuthedUser(): AuthedUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthedUser;
  } catch {
    return null;
  }
}

export function clearAuthed(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
}
