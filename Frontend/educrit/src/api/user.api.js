import api from "./axios";

export const updateProfile = (data) => api.put("/users/profile", data);

export const updateAvatar = (formData) => {
  return api.put("/users/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data", // We explicitly allow this
      // Important: We do NOT set the boundary manually; browser does it.
    },
    transformRequest: [(data) => data], // Prevent Axios from stringifying the FormData
  });
};

export const deleteAvatar = () => api.delete("/users/avatar");

export const changePassword = (data) => api.put("/users/change-password", data);

export const deleteAccount = (data) => api.delete("/users/account", { data });
