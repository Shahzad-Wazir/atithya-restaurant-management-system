import api from "./api";

export const createOrder = (payload) => api.post("/orders", payload).then((r) => r.data);
export const getMyOrders = () => api.get("/orders/my").then((r) => r.data);
export const getOrderById = (id) => api.get(`/orders/${id}`).then((r) => r.data);
export const cancelMyOrder = (id, reason) => api.patch(`/orders/${id}/cancel`, { reason }).then((r) => r.data);
export const getAllOrders = (params = {}) => api.get("/orders", { params }).then((r) => r.data);
export const getKitchenQueue = () => api.get("/orders/kitchen").then((r) => r.data);
export const updateOrderStatus = (id, payload) => api.patch(`/orders/${id}/status`, payload).then((r) => r.data);
