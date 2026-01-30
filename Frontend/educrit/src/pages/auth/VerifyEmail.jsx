import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import toast from "react-hot-toast";
import { verifyEmail, resendVerificationOTP } from "../../api/auth.api";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  if (!email) {
    return <p className="text-center mt-10">Email not found</p>;
  }

  const handleVerify = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      await verifyEmail({ email, otp });

      toast.success("Email verified successfully");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await resendVerificationOTP({ email });
      toast.success("OTP resent");
    } catch {
      toast.error("Failed to resend OTP");
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-10 p-6 border rounded">
      <h2 className="text-xl font-bold mb-4">Verify Email</h2>

      <p className="text-sm mb-3">
        OTP sent to <b>{email}</b>
      </p>

      <form onSubmit={handleVerify} className="space-y-3">
        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
          className="w-full border p-2"
        />

        <button
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 rounded"
        >
          {loading ? "Verifying..." : "Verify"}
        </button>
      </form>

      <button onClick={handleResend} className="mt-3 text-sm text-blue-600">
        Resend OTP
      </button>
    </div>
  );
};

export default VerifyEmail;
