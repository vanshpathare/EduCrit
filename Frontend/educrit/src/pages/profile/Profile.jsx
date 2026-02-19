// import { useState } from "react";
// import { useAuth } from "../../hooks/useAuth";
// import toast from "react-hot-toast";
// import { sendOtp, verifyOtp } from "../../api/otp.api";
// import AvatarUpload from "../../components/profile/AvatarUpload";
// import ProfileForm from "../../components/profile/ProfileForm";
// import Loader from "../../components/common/Loader";

// const Profile = () => {
//   const { loading } = useAuth();
//   const [phone, setPhone] = useState("");
//   const [otp, setOtp] = useState("");
//   const [step, setStep] = useState("PHONE"); // PHONE → OTP

//   const handleSendOtp = async () => {
//     try {
//       await sendOtp({ phone });
//       toast.success("OTP sent to WhatsApp");
//       setStep("OTP");
//     } catch {
//       toast.error("Failed to send OTP");
//     }
//   };

//   const handleVerifyOtp = async () => {
//     try {
//       await verifyOtp({ otp });
//       toast.success("WhatsApp verified successfully");
//       setStep("PHONE");
//       setPhone("");
//       setOtp("");
//     } catch {
//       toast.error("Invalid OTP");
//     }
//   };

//   if (loading) return <Loader />;

//   return (
//     <div className="max-w-xl mx-auto space-y-8">
//       <h1 className="text-2xl font-bold">My Profile</h1>

//       {/* Existing profile features */}
//       <AvatarUpload />
//       <ProfileForm />

//       {/* 📱 WHATSAPP VERIFICATION */}
//       <div className="border-t pt-6">
//         <h2 className="text-xl font-semibold mb-2">Verify WhatsApp Number</h2>

//         {step === "PHONE" ? (
//           <>
//             <input
//               value={phone}
//               onChange={(e) => setPhone(e.target.value)}
//               placeholder="Currently this feature is unavailable"
//               className="border p-2 rounded w-full mb-2"
//             />
//             <button
//               onClick={handleSendOtp}
//               className="bg-green-600 text-white px-4 py-2 rounded"
//             >
//               Send OTP
//             </button>
//           </>
//         ) : (
//           <>
//             <input
//               value={otp}
//               onChange={(e) => setOtp(e.target.value)}
//               placeholder="Enter OTP"
//               className="border p-2 rounded w-full mb-2"
//             />
//             <button
//               onClick={handleVerifyOtp}
//               className="bg-blue-600 text-white px-4 py-2 rounded"
//             >
//               Verify OTP
//             </button>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Profile;

import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AvatarUpload from "../../components/profile/AvatarUpload";
import ProfileForm from "../../components/profile/ProfileForm";
import Loader from "../../components/common/Loader";

const Profile = () => {
  const { user, loading, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const [whatsapp, setWhatsapp] = useState("");
  const [saving, setSaving] = useState(false);

  // 👇 REPLACE THIS WITH YOUR ADMIN WHATSAPP NUMBER (No + sign, just country code + number)
  const ADMIN_WHATSAPP_NUMBER = "918788871221";

  useEffect(() => {
    if (user?.whatsapp?.number) {
      const cleanNumber = user.whatsapp.number.startsWith("91")
        ? user.whatsapp.number.slice(2)
        : user.whatsapp.number;
      setWhatsapp(cleanNumber);
    }
  }, [user]);

  // 1. FIRST SAVE THE NUMBER TO DB
  const handleSaveNumber = async () => {
    if (!/^\d{10}$/.test(whatsapp)) {
      return toast.error("Please enter a valid 10-digit number");
    }

    setSaving(true);
    try {
      const fullNumber = `91${whatsapp}`;
      const { data } = await api.put("/users/whatsapp", {
        whatsapp: fullNumber,
      });

      // Update local state
      setUser({ ...user, whatsapp: data.whatsapp });
      toast.success("Number saved! Now click the button to verify.");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to save number");
    } finally {
      setSaving(false);
    }
  };

  // 2. THEN OPEN WHATSAPP WITH TEMPLATE
  const handleRequestVerification = () => {
    if (!whatsapp) {
      return toast.error("Please save your number first.");
    }

    // This template ensures you get all the info you need to check manually
    const message =
      `*EduCrit Verification Request* \n\n` +
      `Hi Admin, I want to verify my account.\n` +
      `Email: ${user.email}\n` +
      `My WhatsApp: 91${whatsapp}\n\n` +
      `Please verify me!`;

    const url = `https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const handleDeleteAccount = async () => {
    const password = prompt(
      "Type your password to confirm account deactivation:",
    );
    if (!password) return;

    try {
      const { data } = await api.delete("/auth/delete-account", {
        data: { password },
      });
      toast.success(data.message);
      logout(); // This clears your local user state
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Deactivation failed");
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-xl mx-auto space-y-8 pb-12">
      <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>

      <AvatarUpload />
      <ProfileForm />

      {/* 📱 WHATSAPP MANUAL VERIFICATION SECTION */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`p-2 rounded-full ${user?.whatsapp?.isVerified ? "bg-green-100" : "bg-yellow-100"}`}
          >
            <svg
              className={`w-5 h-5 ${user?.whatsapp?.isVerified ? "text-green-600" : "text-yellow-600"}`}
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">
            WhatsApp Contact
          </h2>
        </div>

        {user?.whatsapp?.isVerified ? (
          // ✅ STATE 1: ALREADY VERIFIED
          <div className="bg-green-50 text-green-800 p-4 rounded-lg border border-green-200">
            <p className="font-bold mb-1">✅ Verified Successfully</p>
            <p className="text-sm">
              Your number <strong>+91 {user?.whatsapp?.number}</strong> is
              verified and trusted.
            </p>
          </div>
        ) : (
          // ❌ STATE 2: NOT VERIFIED
          <>
            <p className="text-gray-500 text-sm mb-4">
              Step 1: Save your number.
              <br />
              Step 2: Message Admin to get the <strong>Verified Badge</strong>.
            </p>

            {/* INPUT FIELD */}
            <div className="flex gap-2 mb-4">
              <div className="flex items-center justify-center border border-gray-300 rounded-lg px-3 bg-gray-50 text-gray-600 font-medium select-none">
                🇮🇳 +91
              </div>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) =>
                  setWhatsapp(e.target.value.replace(/\D/g, "").slice(0, 10))
                }
                placeholder="9876543210"
                className="flex-1 border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              />
              <button
                onClick={handleSaveNumber}
                disabled={saving}
                className="bg-gray-900 hover:bg-black text-white px-4 rounded-lg font-medium disabled:opacity-50"
              >
                {saving ? "..." : "Save"}
              </button>
            </div>

            {/* VERIFY BUTTON (Only visible if number matches saved number) */}
            {whatsapp && `91${whatsapp}` === user?.whatsapp?.number && (
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg text-center mt-4">
                <p className="text-sm text-blue-800 mb-3 font-medium">
                  Ready to verify? Click below to message Admin.
                </p>
                <button
                  onClick={handleRequestVerification}
                  className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                  </svg>
                  Verify with Admin
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <div className="bg-red-50 border border-red-100 rounded-xl p-6 mt-12">
        <h2 className="text-lg font-bold text-red-800 mb-1">Danger Zone</h2>
        <p className="text-sm text-red-600 mb-4">
          Deactivating your account will hide all your listings from the
          marketplace. You can restore your account anytime by logging back in.
        </p>
        <button
          onClick={handleDeleteAccount}
          className="bg-white border border-red-200 text-red-600 px-4 py-2 rounded-lg font-semibold hover:bg-red-600 hover:text-white transition-all shadow-sm"
        >
          Deactivate My Account
        </button>
      </div>
    </div>
  );
};

export default Profile;
