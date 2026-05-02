import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://team-task-manager-production-1150.up.railway.app/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ttm_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;