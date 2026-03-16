const SSO_RETURN_TO_STORAGE_KEY = 'sijala-patroli-sso-return-to';

function canUseSessionStorage() {
  return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined';
}

function normalizeReturnTo(returnTo) {
  const normalized = String(returnTo || '').trim();

  if (!normalized.startsWith('/') || normalized.startsWith('//')) {
    return '/';
  }

  if (normalized.startsWith('/auth/callback')) {
    return '/';
  }

  return normalized;
}

export function buildReturnToPath(location) {
  if (!location) return '/';

  return normalizeReturnTo(
    `${location.pathname || '/'}${location.search || ''}${location.hash || ''}`,
  );
}

export function rememberSsoReturnTo(returnTo) {
  if (!canUseSessionStorage()) return;

  try {
    window.sessionStorage.setItem(
      SSO_RETURN_TO_STORAGE_KEY,
      normalizeReturnTo(returnTo),
    );
  } catch {
    // Ignore storage failures and fall back to dashboard root.
  }
}

export function consumeSsoReturnTo(fallback = '/') {
  const normalizedFallback = normalizeReturnTo(fallback);
  if (!canUseSessionStorage()) return normalizedFallback;

  try {
    const stored = window.sessionStorage.getItem(SSO_RETURN_TO_STORAGE_KEY);
    window.sessionStorage.removeItem(SSO_RETURN_TO_STORAGE_KEY);
    return normalizeReturnTo(stored || normalizedFallback);
  } catch {
    return normalizedFallback;
  }
}
