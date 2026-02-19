import api from "./axios";

export const registerUser = (data) => api.post("/auth/register", data);

export const loginUser = (data) => api.post("/auth/login", data);

export const logoutUser = () => api.post("/auth/logout");

export const getMe = () => api.get("/auth/me");

/* ======================
   EMAIL VERIFICATION APIs
====================== */

export const verifyEmail = (data) => api.post("/auth/verify-email", data);
/*
  data = {
    email,
    otp
  }
*/

export const resendVerificationOTP = (data) =>
  api.post("/auth/resend-verification-otp", data);
/*
  data = {
    email
  }
*/

export const verifyWhatsAppOtpless = async (token) => {
  const response = await api.post("/auth/whatsapp/otpless", { token });
  return response.data;
};

/* ======================
    ACCOUNT MANAGEMENT
====================== */

// 🟢 NEW: Delete/Deactivate Account
// Note: We use { data } because axios.delete requires the body to be wrapped in a data object
export const deleteAccount = (password) =>
  api.delete("/auth/delete-account", { data: { password } });

// 🟢 NEW: Reactivate Account
export const reactivateAccount = (data) => api.post("/auth/reactivate", data);
/* data = { email, password }
 */
