const AUTH_STORAGE_KEY = 'stycue:authed';

// Mock auth: no real backend session, just a localStorage flag standing in
// for "is there a logged-in user". Swap for real session/cookie checks once
// the auth API exists.
export function isAuthed(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(AUTH_STORAGE_KEY) === 'true';
}

export function setAuthed(): void {
  localStorage.setItem(AUTH_STORAGE_KEY, 'true');
}

export function clearAuthed(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}
