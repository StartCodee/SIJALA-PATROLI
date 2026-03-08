const RAW_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4100';

function normalizeBaseUrl(baseUrl) {
  return String(baseUrl || '').trim().replace(/\/+$/, '');
}

const normalizedBase = normalizeBaseUrl(RAW_API_BASE_URL);
const API_BASE_URL = normalizedBase.endsWith('/api')
  ? normalizedBase
  : `${normalizedBase}/api`;

function extractErrorMessage(body, statusCode) {
  return (
    (body && typeof body === 'object' && body.message) ||
    `Request failed (${statusCode})`
  );
}

async function request(path, options = {}) {
  const hasFormDataBody = options.body instanceof FormData;
  const baseHeaders = hasFormDataBody ? {} : { 'Content-Type': 'application/json' };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...baseHeaders,
      ...(options.headers || {}),
    },
  });

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

export const apiClient = {
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
