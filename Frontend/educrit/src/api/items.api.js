import api from "./axios";

export const getAllItems = async (params = {}) => {
  const res = await api.get("/items", { params });
  return res.data;
};

export const getItemById = async (id) => {
  const res = await api.get(`/items/${id}`);
  return res.data;
};

export const getMyListings = async () => {
  const res = await api.get("/items/my-listings/me");
  return res.data;
};

export const createItem = (formData) =>
  api.post("/items", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

//export const updateItem = (id, data) => api.put(`/api/items/${id}`, data);

export const updateItem = (id, formData) =>
  api.put(`/items/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const deleteItem = (id) => api.delete(`/items/${id}`);
