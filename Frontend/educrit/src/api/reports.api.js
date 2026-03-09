import axios from "axios";

export const submitReport = async (reportData) => {
  // 1. Get the token (Required for your 'protect' middleware)
  const token = localStorage.getItem("token");

  // 2. Define the Full URL (Required for Production)
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3002";

  // 3. Send the request with headers and WITHOUT the 'n;' typo
  return await axios.post(`${API_URL}/reports`, reportData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
