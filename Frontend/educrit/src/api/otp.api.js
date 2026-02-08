import api from "./axios";

export const sendOtp = (phone) => api.post("/api/otp/send", { phone });

export const verifyOtp = (otp) => api.post("/api/otp/verify", { otp });
