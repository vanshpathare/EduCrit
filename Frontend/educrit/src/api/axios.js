import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, //  VERY IMPORTANT (cookies / JWT)
  headers: {
    "Content-Type": "application/json",
  },
});

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
