import api from "./api";

export const login = (payload) => api.post("/auth/login", payload).then((r) => r.data);
export const register = (payload) => api.post("/auth/register", payload).then((r) => r.data);
export const getMe = () => api.get("/auth/me").then((r) => r.data);
export const updateProfile = (payload) => api.put("/auth/profile", payload).then((r) => r.data);
export const changePassword = (payload) => api.put("/auth/change-password", payload).then((r) => r.data);
export const toggleFavorite = (menuItemId) => api.post(`/auth/favorites/${menuItemId}`).then((r) => r.data);
