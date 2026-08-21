import axios from 'axios';

const API_BASE_URL = '/api';

// The backend server origin — used to resolve uploaded file paths
// like /api/files/xyz.pdf so they point to backend instead of React dev server
export const BACKEND_ORIGIN =
  process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080';

/**
 * Converts a stored file path (e.g. "/api/files/resume.pdf")
 * into a full absolute URL pointing at the backend server.
 * External URLs (http/https) are returned unchanged.
 */
export const resolveFileUrl = (
  url: string | undefined | null
): string => {
  if (!url) return '';

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  if (url.startsWith('/api/')) {
    return `${BACKEND_ORIGIN}${url}`;
  }

  return url;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Response interceptor: handle 401 (unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;