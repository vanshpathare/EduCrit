import api from "./axios";

// 1. Initiate a Buy/Rent request
export const createOrder = (orderData) => api.post("/orders", orderData);

// 2. Fetch history for the logged-in user
export const getMyOrderHistory = () => api.get("/orders/history/me");

// 3. Verify Pickup (Owner enters the OTP provided by the Buyer)
export const verifyPickup = (orderId, otp) =>
  api.post(`/orders/${orderId}/verify-pickup`, { otp });

// 4. Verify Return (Buyer enters the OTP provided by the Owner)
export const verifyReturn = (orderId, otp) =>
  api.post(`/orders/${orderId}/verify-return`, { otp });

export const cancelOrder = (id) => api.delete(`/orders/${id}/cancel`);

export const resendOrderOTP = (orderId) =>
  api.post(`/orders/${orderId}/resend-otp`);
