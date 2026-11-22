import api from "./api";

export const getTables = (params = {}) => api.get("/tables", { params }).then((r) => r.data);
export const checkTableAvailability = (params) => api.get("/tables/availability", { params }).then((r) => r.data);
export const createTable = (payload) => api.post("/tables", payload).then((r) => r.data);
export const updateTable = (id, payload) => api.put(`/tables/${id}`, payload).then((r) => r.data);
export const deleteTable = (id) => api.delete(`/tables/${id}`).then((r) => r.data);

export const createReservation = (payload) => api.post("/reservations", payload).then((r) => r.data);
export const getMyReservations = () => api.get("/reservations/my").then((r) => r.data);
export const cancelReservation = (id) => api.patch(`/reservations/${id}/cancel`).then((r) => r.data);
export const getAllReservations = (params = {}) => api.get("/reservations", { params }).then((r) => r.data);
export const updateReservationStatus = (id, status) =>
  api.patch(`/reservations/${id}/status`, { status }).then((r) => r.data);
