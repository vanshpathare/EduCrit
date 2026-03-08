import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, //  VERY IMPORTANT (cookies / JWT)
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    // Grab the token from storage (make sure 'token' matches your key name)
    const token = localStorage.getItem("token");

    if (token) {
      // Standard JWT format: "Bearer <token>"
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Optional: response interceptor (future-proof)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Centralized error handling
    if (error.response?.status === 401) {
      console.warn("Unauthorized – login required");
    }
    return Promise.reject(error);
  },
);

export default api;
