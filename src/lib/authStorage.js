let currentSession = null;
const AUTH_SOURCE_STORAGE_KEY = 'sijala-patroli-auth-source';

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readStoredAuthSource() {
  if (!canUseStorage()) return '';

  try {
    return String(window.localStorage.getItem(AUTH_SOURCE_STORAGE_KEY) || '').trim();
  } catch {
    return '';
  }
}

function writeStoredAuthSource(authSource) {
  if (!canUseStorage()) return;

  try {
    if (authSource) {
      window.localStorage.setItem(AUTH_SOURCE_STORAGE_KEY, authSource);
      return;
    }

    window.localStorage.removeItem(AUTH_SOURCE_STORAGE_KEY);
  } catch {
    // Ignore storage failures and keep session in memory.
  }
}

export function getAuthSession() {
  return currentSession;
}

export function getAuthSource() {
  return readStoredAuthSource();
}

export function setAuthSession(session) {
  const authSource = String(session?.authSource || readStoredAuthSource() || '').trim();

  currentSession = {
    accessToken: String(session?.accessToken || ''),
    user: session?.user || null,
    expiresIn: Number(session?.expiresIn || 0),
    savedAt: Date.now(),
    authSource: authSource || null,
  };

  writeStoredAuthSource(authSource);
}

export function clearAuthSession() {
  currentSession = null;
  writeStoredAuthSource('');
}
