import axios from "axios";

export const AUTH_KEY = "dealerflow_auth";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  // Free hosting tiers can take a while to wake up
  timeout: 45000,
});

// Attach the JWT to every request
api.interceptors.request.use((config) => {
  try {
    const saved = JSON.parse(localStorage.getItem(AUTH_KEY));
    if (saved?.token) config.headers.Authorization = `Bearer ${saved.token}`;
  } catch {
    /* corrupt storage: ignore */
  }
  return config;
});

// If the token is rejected, tell the app to log the user out
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLogin = error.config?.url?.includes("/api/auth/login");
    if (error.response?.status === 401 && !isLogin) {
      window.dispatchEvent(new Event("auth:expired"));
    }
    return Promise.reject(error);
  }
);

export function getErrorMessage(error) {
  if (error.response) {
    return error.response.data?.message || `Request failed (${error.response.status})`;
  }
  if (error.request) {
    return "Cannot reach the server. It may be waking up, please try again in a moment.";
  }
  return error.message || "Something went wrong";
}

export default api;
