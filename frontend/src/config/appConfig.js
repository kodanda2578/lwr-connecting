/**
 * LWR Connecting — Centralized Frontend Configuration Module
 * 
 * Manages dynamic backend API URLs and public frontend application URLs
 * across local development (Vite dev proxy) and cloud production (Vercel + Render).
 * 
 * SECURITY NOTE:
 * Only public VITE_ variables are read here.
 * Never expose JWT secrets, SMTP passwords, or DB credentials in frontend code.
 */

// 1. Raw API Base URL from Vite environment (e.g. Render backend URL)
const rawApiBaseUrl = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL)
  ? String(import.meta.env.VITE_API_BASE_URL).trim()
  : '';

// 2. Raw Public Application URL from Vite environment (e.g. Vercel deployment URL)
const rawPublicAppUrl = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_PUBLIC_APP_URL)
  ? String(import.meta.env.VITE_PUBLIC_APP_URL).trim()
  : '';

/**
 * Returns the normalized API base URL including the /api context path.
 * 
 * - In local development (empty VITE_API_BASE_URL): returns '/api'
 *   (which Vite's dev server proxies to http://localhost:8080/api).
 * - In production: returns 'https://your-backend.onrender.com/api'.
 * - Guarantees that '/api' is never duplicated even if VITE_API_BASE_URL
 *   already contains '/api' or trailing slashes.
 */
export const getApiBaseUrl = () => {
  if (!rawApiBaseUrl) {
    return '/api';
  }

  // Strip all trailing slashes
  let clean = rawApiBaseUrl.replace(/\/+$/, '');

  // Ensure /api context path is present exactly once
  if (!clean.endsWith('/api')) {
    clean = `${clean}/api`;
  }

  return clean;
};

export const API_BASE_URL = getApiBaseUrl();

/**
 * Builds a complete, normalized API URL for any given path or endpoint.
 * Handles endpoints with or without leading '/api', leading '/', or query parameters.
 * 
 * Examples:
 * buildApiUrl('/colleges')           -> '/api/colleges' (dev) or 'https://render.../api/colleges' (prod)
 * buildApiUrl('/api/colleges')       -> '/api/colleges' (dev) or 'https://render.../api/colleges' (prod)
 * buildApiUrl('auth/login')          -> '/api/auth/login' (dev) or 'https://render.../api/auth/login' (prod)
 * buildApiUrl('/api/auth/login')     -> '/api/auth/login' (dev) or 'https://render.../api/auth/login' (prod)
 * buildApiUrl('https://other.com/x') -> 'https://other.com/x' (unchanged)
 */
export const buildApiUrl = (endpoint = '') => {
  if (!endpoint) return getApiBaseUrl();

  let path = String(endpoint).trim();

  // Return absolute external URLs as-is
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  // Strip leading '/api' or 'api' from endpoint to prevent duplicating /api
  if (path.startsWith('/api/')) {
    path = path.substring(4); // leaves '/...'
  } else if (path === '/api' || path === 'api') {
    path = '';
  } else if (path.startsWith('api/')) {
    path = path.substring(3); // leaves '/...'
  }

  // Ensure path begins with '/' if not empty
  if (path && !path.startsWith('/')) {
    path = `/${path}`;
  }

  return `${getApiBaseUrl()}${path}`;
};

/**
 * Returns the public frontend URL for constructing student-facing links,
 * invitation links, and redirect destinations.
 * 
 * - In cloud production: uses VITE_PUBLIC_APP_URL (e.g. 'https://lwr-connecting.vercel.app').
 * - In local development: defaults to window.location.origin (e.g. 'http://localhost:5173').
 */
export const getPublicAppUrl = () => {
  if (rawPublicAppUrl) {
    return rawPublicAppUrl.replace(/\/+$/, '');
  }

  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    return window.location.origin;
  }

  return 'http://localhost:5173';
};

export const PUBLIC_APP_URL = getPublicAppUrl();

/**
 * Builds a public frontend URL for a specific route.
 * 
 * Example:
 * buildPublicUrl('/register?code=LWR-W1-ABC123')
 * -> 'https://lwr-connecting.vercel.app/register?code=LWR-W1-ABC123' (prod)
 * -> 'http://localhost:5173/register?code=LWR-W1-ABC123' (local dev)
 */
export const buildPublicUrl = (route = '') => {
  let cleanRoute = String(route).trim();
  if (cleanRoute && !cleanRoute.startsWith('/')) {
    cleanRoute = `/${cleanRoute}`;
  }
  return `${getPublicAppUrl()}${cleanRoute}`;
};

