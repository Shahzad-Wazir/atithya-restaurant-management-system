import api from "./api";

export const getUsers = (params = {}) => api.get("/users", { params }).then((r) => r.data);
export const updateUser = (id, payload) => api.put(`/users/${id}`, payload).then((r) => r.data);
export const deleteUser = (id) => api.delete(`/users/${id}`).then((r) => r.data);
export const getDashboardStats = () => api.get("/dashboard").then((r) => r.data);
