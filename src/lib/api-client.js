const DEFAULT_API_BASE_URL = 'https://se7en-fit-api.onrender.com/api';

function normalizeApiBaseUrl(value) {
  const raw = String(value || '').trim();
  if (!raw) return DEFAULT_API_BASE_URL;
  if (raw.includes('.supabase.co')) return DEFAULT_API_BASE_URL;
  const withoutSlash = raw.replace(/\/+$/, '');
  return withoutSlash.endsWith('/api') ? withoutSlash : `${withoutSlash}/api`;
}

const API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL);
const REQUEST_TIMEOUT_MS = Number(import.meta.env.VITE_API_TIMEOUT_MS || 15000);
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
  get() { return localStorage.getItem(TOKEN_KEY) || ''; },
  set(token) { if (token) localStorage.setItem(TOKEN_KEY, token); },
  clear() { localStorage.removeItem(TOKEN_KEY); },
};

export const userStore = {
  get() { try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null'); } catch { return null; } },
  set(user) { if (user) localStorage.setItem(USER_KEY, JSON.stringify(user)); },
  clear() { localStorage.removeItem(USER_KEY); },
};

function normalizeResponsePayload(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload?.token || payload?.access_token || payload?.requires_otp) return payload;
  if (payload?.item !== undefined) return payload.item;
  if (payload?.items !== undefined) return payload.items;
  if (payload?.data !== undefined) return payload.data;
  if (payload?.user !== undefined) return payload.user;
  return payload;
}

function networkErrorMessage() {
  return `Could not reach SE7EN FIT backend at ${API_BASE_URL}. Check Render backend deploy and CORS settings.`;
}

export async function apiRequest(path, options = {}) {
  const token = tokenStore.get();
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timeoutId = controller ? window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS) : null;
  const headers = {
    Accept: 'application/json',
    ...(!isFormData && options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      signal: controller?.signal || options.signal,
      body: options.body && !isFormData && typeof options.body !== 'string' ? JSON.stringify(options.body) : options.body,
    });
    const contentType = response.headers.get('content-type') || '';
    const text = await response.text();
    if (!contentType.includes('application/json')) throw new ApiError('Server returned an invalid response.', response.status, text.slice(0, 300));
    const payload = text ? JSON.parse(text) : null;
    if (!response.ok || payload?.success === false) throw new ApiError(payload?.message || payload?.error || 'Request failed', response.status, payload);
    return normalizeResponsePayload(payload);
  } catch (error) {
    if (error?.name === 'AbortError') throw new ApiError('Server is taking too long to respond. Please try again in a few seconds.', 0, null);
    if (error instanceof TypeError) throw new ApiError(networkErrorMessage(), 0, null);
    throw error;
  } finally {
    if (timeoutId) window.clearTimeout(timeoutId);
  }
}

export async function safeList(paths) {
  const candidates = Array.isArray(paths) ? paths : [paths];
  for (const path of candidates) {
    try {
      const result = await apiRequest(path);
      return Array.isArray(result) ? result : result ? [result] : [];
    } catch (error) {
      if (error instanceof ApiError && [0, 404, 405].includes(error.status)) continue;
      throw error;
    }
  }
  return [];
}

export async function safeOne(paths) {
  const list = await safeList(paths);
  return Array.isArray(list) ? list[0] || null : list;
}

export const API_CONFIG = { baseUrl: API_BASE_URL };
