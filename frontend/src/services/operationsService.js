import api from "./api";

// Coupons
export const getActiveCoupons = () => api.get("/coupons/active").then((r) => r.data);
export const validateCoupon = (code, subtotal) =>
  api.post("/coupons/validate", { code, subtotal }).then((r) => r.data);
export const getAllCoupons = () => api.get("/coupons").then((r) => r.data);
export const createCoupon = (payload) => api.post("/coupons", payload).then((r) => r.data);
export const updateCoupon = (id, payload) => api.put(`/coupons/${id}`, payload).then((r) => r.data);
export const deleteCoupon = (id) => api.delete(`/coupons/${id}`).then((r) => r.data);

// Reviews
export const getItemReviews = (menuItemId) => api.get(`/reviews/${menuItemId}`).then((r) => r.data);
export const submitReview = (menuItemId, payload) =>
  api.post(`/reviews/${menuItemId}`, payload).then((r) => r.data);
export const deleteReview = (id) => api.delete(`/reviews/${id}`).then((r) => r.data);

// Contact Inquiries
export const submitContactInquiry = (payload) => api.post("/contact", payload).then((r) => r.data);
export const getAllInquiries = (params = {}) => api.get("/contact", { params }).then((r) => r.data);
export const updateInquiry = (id, payload) => api.patch(`/contact/${id}`, payload).then((r) => r.data);
export const deleteInquiry = (id) => api.delete(`/contact/${id}`).then((r) => r.data);

// Billing Config & Sales Reports
export const getBillingConfig = () => api.get("/billing/config").then((r) => r.data);
export const updateBillingConfig = (payload) => api.put("/billing/config", payload).then((r) => r.data);
export const getSalesReport = (params = {}) => api.get("/billing/sales-report", { params }).then((r) => r.data);
