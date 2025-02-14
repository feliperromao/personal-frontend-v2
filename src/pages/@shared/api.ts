import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_API, // Define a URL base automaticamente
});

// Interceptor para adicionar o token automaticamente
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

export default api;
