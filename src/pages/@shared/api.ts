import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_API || import.meta.env.REACT_APP_BACKEND_API,
  timeout: 20_000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth-token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem('user');
      localStorage.removeItem('auth-token');
      localStorage.removeItem('branding');
      if (window.location.pathname !== '/login') {
        const returnTo = `${window.location.pathname}${window.location.search}`;
        window.location.replace(`/login?returnTo=${encodeURIComponent(returnTo)}`);
      }
    }
    return Promise.reject(error);
  },
);

export default api;
