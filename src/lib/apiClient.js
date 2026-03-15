import {
  clearAuthSession,
  getAuthSession,
  getAuthSource,
  setAuthSession,
} from '@/lib/authStorage';

const RAW_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4200';
const RAW_SSO_PORTAL_URL = import.meta.env.VITE_SSO_PORTAL_URL || 'http://localhost:9000';


const SSO_API_BASE_URL = `${SSO_PORTAL_URL}/api`;

async function ssoRequest(path, options = {}) {
  const hasFormDataBody = options.body instanceof FormData;
  const baseHeaders = hasFormDataBody ? {} : { 'Content-Type': 'application/json' };

  let response;
  try {
    response = await fetch(`${SSO_API_BASE_URL}${path}`, {
      ...options,
      headers: {
        ...baseHeaders,
        ...(options.headers || {}),
      },
      credentials: 'include',
    });
  } catch (error) {
    throw networkError(
      `Tidak dapat terhubung ke SSO Portal (${SSO_API_BASE_URL}).`,
      error,
    );
  }

  return parseResponse(response);
}




function normalizeBaseUrl(baseUrl) {
  return String(baseUrl || '').trim().replace(/\/+$/, '');
}

export const SSO_PORTAL_URL = normalizeBaseUrl(RAW_SSO_PORTAL_URL);

const normalizedBase = normalizeBaseUrl(RAW_API_BASE_URL);
const API_BASE_URL = normalizedBase.endsWith('/api')
  ? normalizedBase
  : `${normalizedBase}/api`;

let refreshPromise = null;
const COOKIE_AUTH_HEADERS = {
  'X-Auth-Mode': 'cookie',
};

function extractErrorMessage(body, statusCode) {
  return (
    (body && typeof body === 'object' && body.message) ||
    `Request failed (${statusCode})`
  );
}

function networkError(message, cause) {
  const detail = cause instanceof Error ? cause.message : '';
  return new Error(detail ? `${message} (${detail})` : message);
}

function toRequestBody(payload) {
  if (payload instanceof FormData) return payload;
  return JSON.stringify(payload);
}

function toQuery(params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    searchParams.set(key, value);
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

function persistSession(authPayload) {
  if (!authPayload || typeof authPayload !== 'object') {
    throw new Error('Session auth tidak valid.');
  }

  const session = {
    accessToken: authPayload.accessToken,
    user: authPayload.user || null,
    expiresIn: authPayload.expiresIn || 0,
    authSource: String(authPayload.authSource || getAuthSource() || '').trim() || null,
  };

  if (!session.accessToken) {
    throw new Error('Access token autentikasi tidak tersedia.');
  }

  setAuthSession(session);
  return session;
}

async function parseResponse(response) {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type') || '';
  const body = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    throw new Error(extractErrorMessage(body, response.status));
  }

  return body;
}

async function refreshAccessToken() {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    let response;
    try {
      response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...COOKIE_AUTH_HEADERS,
        },
        credentials: 'include',
      });
    } catch (error) {
      throw networkError(
        `Tidak dapat terhubung ke API untuk refresh sesi: ${API_BASE_URL}`,
        error,
      );
    }

    const parsed = await parseResponse(response);
    return persistSession(parsed);
  })();

  try {
    return await refreshPromise;
  } catch (error) {
    clearAuthSession();
    throw error;
  } finally {
    refreshPromise = null;
  }
}

async function request(path, options = {}) {
  const {
    auth = true,
    retryOnAuthError = true,
    ...fetchOptions
  } = options;

  const hasFormDataBody = fetchOptions.body instanceof FormData;
  const baseHeaders = hasFormDataBody ? {} : { 'Content-Type': 'application/json' };

  const session = getAuthSession();
  const accessToken = session?.accessToken;

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...fetchOptions,
      headers: {
        ...baseHeaders,
        ...(auth && accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...(fetchOptions.headers || {}),
      },
      credentials: 'include',
    });
  } catch (error) {
    throw networkError(
      `Tidak dapat terhubung ke API (${API_BASE_URL}). Pastikan backend aktif.`,
      error,
    );
  }

  if (response.status === 401 && auth && retryOnAuthError) {
    await refreshAccessToken();
    return request(path, {
      ...options,
      retryOnAuthError: false,
    });
  }

  return parseResponse(response);
}

export const apiClient = {
  getStoredSession() {
    return getAuthSession();
  },

  getStoredAuthSource() {
    return getAuthSource();
  },

  clearSession() {
    clearAuthSession();
  },

  async login({ usernameOrEmail, password }) {
    const payload = await request('/auth/login', {
      method: 'POST',
      auth: false,
      headers: {
        ...COOKIE_AUTH_HEADERS,
      },
      body: JSON.stringify({
        usernameOrEmail,
        password,
      }),
    });
    return persistSession({
      ...payload,
      authSource: 'password',
    });
  },

  async exchangeSsoCode({ code, state }) {
    const payload = await request('/auth/sso/exchange', {
      method: 'POST',
      auth: false,
      headers: {
        ...COOKIE_AUTH_HEADERS,
      },
      body: JSON.stringify({ code, state }),
    });
    return persistSession({
      ...payload,
      authSource: 'sso',
    });
  },

  getSsoLoginUrl() {
    return ssoRequest('/auth/sso/login-url', {
      auth: false,
    });
  },

  getSsoLogoutUrl() {
    return ssoRequest('/auth/sso/logout-url', {
      auth: false,
    });
  },

 async prepareSsoAuthorizeUrl() {
  // logout lokal app dulu, bukan SSO
  try {
    await request('/auth/logout', {
      method: 'POST',
      auth: false,
      headers: {
        ...COOKIE_AUTH_HEADERS,
      },
    });
  } catch {
    // best effort
  } finally {
    clearAuthSession();
  }

  const payload = await ssoRequest('/auth/login-url');

  const authorizeUrl = String(payload?.authorizeUrl || '').trim();
  if (!authorizeUrl) {
    throw new Error('URL login SSO tidak tersedia.');
  }

  return authorizeUrl;
},



 async logout(options = {}) {
  const {
    global = true,
    redirect = true,
  } = options;

  let logoutUrl = null;

  if (global) {
    try {
      const payload = await ssoRequest('/auth/logout-url');
      const candidate = String(payload?.logoutUrl || '').trim();
      if (candidate) {
        logoutUrl = candidate;
      }
    } catch {
      // best effort
    }
  }

  // logout lokal app API
  try {
    await request('/auth/logout', {
      method: 'POST',
      auth: false,
      headers: {
        ...COOKIE_AUTH_HEADERS,
      },
    });
  } finally {
    clearAuthSession();
  }

  if (global && redirect && logoutUrl) {
    window.location.assign(logoutUrl);
  }

  return { logoutUrl };
},

  async hasActiveSsoPortalSession() {
    try {
      const response = await fetch(`${SSO_PORTAL_URL}/api/session`, {
        credentials: 'include',
      });

      if (!response.ok) {
        return null;
      }

      const payload = await response.json();
      return payload?.authenticated === true;
    } catch {
      return null;
    }
  },

  async restoreSessionFromCookie() {
    try {
      await refreshAccessToken();
      return true;
    } catch {
      clearAuthSession();
      return false;
    }
  },

  getMe() {
    return request('/auth/me');
  },

  updateMyProfile(payload) {
    return request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  uploadMyProfilePhoto(file) {
    const formData = new FormData();
    formData.append('photo', file);
    return request('/auth/profile/photo', {
      method: 'POST',
      body: formData,
    });
  },

  deleteMyProfilePhoto() {
    return request('/auth/profile/photo', {
      method: 'DELETE',
    });
  },

  getHealth() {
    return request('/health');
  },

  getReports(params = {}) {
    return request(`/reports${toQuery(params)}`);
  },

  getReportById(id) {
    return request(`/reports/${id}`);
  },

  reviewReport(id, payload) {
    return request(`/reports/${id}/review`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  deleteReport(id) {
    return request(`/reports/${id}`, {
      method: 'DELETE',
    });
  },

  getDashboardSummary() {
    return request('/dashboard/summary');
  },

  getPatrolAreas() {
    return request('/patrol-areas');
  },

  getPatrolAreaById(id) {
    return request(`/patrol-areas/${id}`);
  },

  createPatrolArea(payload) {
    return request('/patrol-areas', {
      method: 'POST',
      body: toRequestBody(payload),
    });
  },

  updatePatrolArea(id, payload) {
    return request(`/patrol-areas/${id}`, {
      method: 'PUT',
      body: toRequestBody(payload),
    });
  },

  deletePatrolArea(id) {
    return request(`/patrol-areas/${id}`, {
      method: 'DELETE',
    });
  },

  getGuardPosts(params = {}) {
    return request(`/guard-posts${toQuery(params)}`);
  },

  createGuardPost(payload) {
    return request('/guard-posts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateGuardPost(id, payload) {
    return request(`/guard-posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  deleteGuardPost(id) {
    return request(`/guard-posts/${id}`, {
      method: 'DELETE',
    });
  },

  getCrew() {
    return request('/crew');
  },

  getCrewById(id) {
    return request(`/crew/${id}`);
  },

  createCrew(payload) {
    return request('/crew', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateCrew(id, payload) {
    return request(`/crew/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  deleteCrew(id) {
    return request(`/crew/${id}`, {
      method: 'DELETE',
    });
  },

  getSpeedboats(params = {}) {
    return request(`/speedboats${toQuery(params)}`);
  },

  getSpeedboatById(id) {
    return request(`/speedboats/${id}`);
  },

  createSpeedboat(payload) {
    return request('/speedboats', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateSpeedboat(id, payload) {
    return request(`/speedboats/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  deleteSpeedboat(id) {
    return request(`/speedboats/${id}`, {
      method: 'DELETE',
    });
  },
};

export const reviewLabelMap = {
  pending: 'Menunggu',
  validated: 'Diterima',
  rejected: 'Dikembalikan',
};

export const reviewClassMap = {
  pending: 'bg-warning/15 text-warning border-warning/30',
  validated: 'bg-success/15 text-success border-success/30',
  rejected: 'bg-destructive/15 text-destructive border-destructive/30',
};

export function formatDate(isoString) {
  if (!isoString) return '-';
  const dt = new Date(isoString);
  if (Number.isNaN(dt.getTime())) return '-';
  return dt.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(isoString) {
  if (!isoString) return '-';
  const dt = new Date(isoString);
  if (Number.isNaN(dt.getTime())) return '-';
  return dt.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
