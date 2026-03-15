let currentSession = null;

export function getAuthSession() {
  return currentSession;
}

export function setAuthSession(session) {
  currentSession = {
    accessToken: String(session?.accessToken || ''),
    user: session?.user || null,
    expiresIn: Number(session?.expiresIn || 0),
    savedAt: Date.now(),
  };
}

export function clearAuthSession() {
  currentSession = null;
}
