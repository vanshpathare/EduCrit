import api from "./axios";

export const updateProfile = (data) => api.put("/api/users/profile", data);

export const updateAvatar = (formData) => {
  return api.put("/api/users/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data", // We explicitly allow this
      // Important: We do NOT set the boundary manually; browser does it.
    },
    transformRequest: [(data) => data], // Prevent Axios from stringifying the FormData
  });
};

export const deleteAvatar = () => api.delete("/api/users/avatar");

export const changePassword = (data) =>
  api.put("/api/users/change-password", data);

export const deleteAccount = (data) =>
  api.delete("/api/users/account", { data });
