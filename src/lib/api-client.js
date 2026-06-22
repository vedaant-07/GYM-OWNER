const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://se7enfit-original.onrender.com').replace(/\/$/, '');
const TOKEN_KEY = 'se7enfit_owner_token';
const USER_KEY = 'se7enfit_owner_user';

export class ApiError extends Error {
  constructor(message, status = 0, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export const tokenStore = {
  get() {
    return localStorage.getItem(TOKEN_KEY) || '';
  },
  set(token) {
    if (token) localStorage.setItem(TOKEN_KEY, token);
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
  },
};

export const userStore = {
  get() {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
    } catch {
      return null;
    }
  },
  set(user) {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clear() {
    localStorage.removeItem(USER_KEY);
  },
};

function normalizeResponsePayload(payload) {
  if (Array.isArray(payload)) return payload;

  // Auth endpoints return { success, message, token, user }. Preserve the full
  // object so login/register/Google login can store the JWT token.
  if (payload?.token || payload?.access_token) return payload;

  if (payload?.data) return payload.data;
  if (payload?.items) return payload.items;
  if (payload?.results) return payload.results;
  if (payload?.members) return payload.members;
  if (payload?.payments) return payload.payments;
  if (payload?.leads) return payload.leads;
  if (payload?.records) return payload.records;
  if (payload?.profile) return payload.profile;
  if (payload?.user) return payload.user;
  return payload;
}

export async function apiRequest(path, options = {}) {
  const token = tokenStore.get();
  const headers = {
    Accept: 'application/json',
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    body: options.body && typeof options.body !== 'string' ? JSON.stringify(options.body) : options.body,
  });

  const contentType = response.headers.get('content-type') || '';
  const text = await response.text();

  if (!contentType.includes('application/json')) {
    const message = response.status === 404
      ? 'API route is not available yet.'
      : 'Server returned an invalid HTML/text response.';
    throw new ApiError(message, response.status, text.slice(0, 200));
  }

  const payload = text ? JSON.parse(text) : null;

  if (!response.ok || payload?.success === false) {
    throw new ApiError(payload?.message || payload?.error || 'Request failed', response.status, payload);
  }

  return normalizeResponsePayload(payload);
}

export async function safeList(paths) {
  const candidates = Array.isArray(paths) ? paths : [paths];
  for (const path of candidates) {
    try {
      const result = await apiRequest(path);
      return Array.isArray(result) ? result : result ? [result] : [];
    } catch (error) {
      if (error instanceof ApiError && [0, 404, 405].includes(error.status)) continue;
      if (error instanceof ApiError && typeof error.data === 'string') continue;
      console.warn(`SE7EN FIT API fallback for ${path}:`, error.message);
      return [];
    }
  }
  return [];
}

export async function safeOne(paths) {
  const list = await safeList(paths);
  return Array.isArray(list) ? list[0] || null : list;
}

export const API_CONFIG = { baseUrl: API_BASE_URL };
