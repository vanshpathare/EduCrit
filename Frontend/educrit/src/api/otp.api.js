import api from "./axios";

export const sendOtp = (phone) => api.post("/otp/send", { phone });

export const verifyOtp = (otp) => api.post("/otp/verify", { otp });
