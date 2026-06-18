import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

const TOKEN_KEY = 'sport_app_token';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request interceptor: inject JWT ────────────────────────────────────────
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config; 
  },
  (error) => Promise.reject(error),
);

// ─── Response interceptor: unified error handling ───────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (!error.response) {
      // Network / timeout error
      return Promise.reject(new Error('Нет соединения с сервером. Проверьте интернет или попробуйте позже.'));
    }

    const { status, data } = error.response as { status: number; data: any };

    switch (status) {
      case 400:
        return Promise.reject(new Error((data?.message as string) ?? 'Неверный запрос'));
      case 401:
        // Clear stale token and redirect to login
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem('sport_app_current_user');
        window.dispatchEvent(new Event('auth:unauthorized'));
        return Promise.reject(new Error('Сессия истекла. Пожалуйста, войдите снова.'));
      case 403:
        return Promise.reject(new Error('Доступ запрещён.'));
      case 404:
        return Promise.reject(new Error((data?.message as string) ?? 'Ресурс не найден.'));
      case 409:
        return Promise.reject(new Error((data?.message as string) ?? 'Конфликт данных.'));
      case 422:
        return Promise.reject(new Error((data?.message as string) ?? 'Ошибка валидации.'));
      case 500:
      case 502:
      case 503:
        return Promise.reject(new Error('Ошибка сервера. Попробуйте позже.'));
      default:
        return Promise.reject(new Error((data?.message as string) ?? `Ошибка ${status}`));
    }
  },
);

export default api;
