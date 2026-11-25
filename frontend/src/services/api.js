import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { storage } from '../utils/storage';

export const AUTH_TOKEN_KEY = 'bellezza_jwt_token';

/**
 * Determine the API base URL dynamically:
 * - Reads EXPO_PUBLIC_API_URL from environment when provided
 * - On Mobile (Expo Go / Dev Client): automatically derives the development PC's IP from hostUri
 * - On Android Emulator: fallback to 10.0.2.2:5000/api
 * - On Web: defaults to localhost:5000/api or LAN IP
 */
const resolveBaseUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;

  // On Web
  if (Platform.OS === 'web') {
    return envUrl ? envUrl.replace(/\/+$/, '') : 'http://localhost:5000/api';
  }

  // If envUrl is explicitly provided and doesn't point to localhost, use it
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl.replace(/\/+$/, '');
  }

  // On mobile (physical device or emulator running Expo)
  const hostUri = Constants.expoConfig?.hostUri || Constants.manifest2?.extra?.expoGo?.debuggerHost;
  if (hostUri) {
    const hostIp = hostUri.split(':')[0];
    if (hostIp && hostIp !== 'localhost' && hostIp !== '127.0.0.1') {
      return `http://${hostIp}:5000/api`;
    }
  }

  // Fallbacks for native
  if (Platform.OS === 'android') {
    return 'http://192.168.29.245:5000/api';
  }

  return 'http://192.168.29.245:5000/api';
};

export const BASE_URL = resolveBaseUrl();

/**
 * Core HTTP fetch wrapper with authorization header injection & error normalizer
 * @param {string} endpoint - API path, e.g. '/auth/login'
 * @param {RequestInit} options - fetch options
 * @returns {Promise<any>}
 */
export const request = async (endpoint, options = {}) => {
  const token = await storage.get(AUTH_TOKEN_KEY);
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${BASE_URL}${cleanEndpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeout || 20000);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: options.signal || controller.signal,
    });
    clearTimeout(timeoutId);

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      // If 401 Unauthorized or expired token on a protected endpoint
      if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
        await storage.remove(AUTH_TOKEN_KEY);
      }

      const error = new Error(
        data?.message || data?.error || `Request failed with status ${response.status}`
      );
      error.status = response.status;
      error.statusCode = response.status;
      error.errors = data?.errors || null;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    if (!err.status) {
      err.isNetworkError = true;
      err.message = err.message || 'Unable to reach Bellezza server. Check your network connection.';
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
};

export const api = {
  get: (endpoint, params = {}, customOptions = {}) => {
    const query = new URLSearchParams(params).toString();
    const path = query ? `${endpoint}?${query}` : endpoint;
    return request(path, { method: 'GET', ...customOptions });
  },
  post: (endpoint, body = {}, customOptions = {}) => {
    return request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
      ...customOptions,
    });
  },
  put: (endpoint, body = {}, customOptions = {}) => {
    return request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
      ...customOptions,
    });
  },
  patch: (endpoint, body = {}, customOptions = {}) => {
    return request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
      ...customOptions,
    });
  },
  delete: (endpoint, body = null, customOptions = {}) => {
    return request(endpoint, {
      method: 'DELETE',
      ...(body ? { body: JSON.stringify(body) } : {}),
      ...customOptions,
    });
  },
};

export default api;

