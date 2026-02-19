import { useEffect, useState } from "react";
import {
  getMyOrderHistory,
  verifyPickup,
  verifyReturn,
  cancelOrder,
  resendOrderOTP,
} from "../../api/orders.api";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";
import Loader from "../../components/common/Loader";
import { Link } from "react-router-dom";

const History = () => {
  const { user: currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [otpInputs, setOtpInputs] = useState({}); // Stores local typing for each order

  const fetchHistory = async () => {
    try {
      const response = await getMyOrderHistory();

      // 🟢 FIX: Access the .data property from the Axios response
      const actualData = response.data;

      if (Array.isArray(actualData)) {
        setOrders(actualData);
      } else if (actualData && Array.isArray(actualData.orders)) {
        setOrders(actualData.orders);
      } else {
        setOrders([]);
      }
    } catch (err) {
      toast.error("Failed to load transaction history");
      setOrders([]); // Set to empty array on error to prevent mapping crash
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleInputChange = (orderId, value) => {
    setOtpInputs((prev) => ({ ...prev, [orderId]: value }));
  };

  const handleVerify = async (orderId, type) => {
    try {
      const otp = otpInputs[orderId];
      if (!otp || otp.length !== 6)
        return toast.error("Please enter a 6-digit OTP");

      if (type === "pickup") {
        await verifyPickup(orderId, otp);
      } else {
        await verifyReturn(orderId, otp);
      }

      toast.success("Transaction verified! 🎉");
      fetchHistory(); // Refresh to update status
    } catch (err) {
      toast.error(err.response?.data?.message || "Verification failed");
    }
  };

  const handleResendOTP = async (orderId) => {
    try {
      await resendOrderOTP(orderId);
      toast.success("OTP re-sent to your email! 📧");
    } catch (err) {
      toast.error("Failed to resend OTP");
    }
  };

  const handleCancel = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this request?"))
      return;
    try {
      await cancelOrder(orderId);
      toast.success("Request cancelled");
      fetchHistory();
    } catch (err) {
      toast.error("Failed to cancel request");
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Transaction History
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Track your active handovers and past deals.
          </p>
        </div>

        {/* THE HANDSHAKE GUIDE */}
        <div className="bg-blue-600 rounded-3xl p-6 mb-8 text-white shadow-xl shadow-blue-100 flex flex-col md:flex-row items-center gap-6">
          <div className="text-4xl">🤝</div>
          <div>
            <h2 className="text-lg font-bold">The Handshake System</h2>
            <p className="text-blue-100 text-xs mt-1">
              Follow these steps to complete your deal safely:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="bg-blue-700/50 p-3 rounded-xl border border-blue-400/30">
                <p className="font-bold text-[10px] uppercase opacity-80 underline underline-offset-4">
                  1. Pickup (Handover)
                </p>
                <p className="text-[11px] mt-1">
                  Meet the seller. Provide the OTP from your{" "}
                  <strong>Email</strong>. They enter it here.
                </p>
              </div>
              <div className="bg-blue-700/50 p-3 rounded-xl border border-blue-400/30">
                <p className="font-bold text-[10px] uppercase opacity-80 underline underline-offset-4">
                  2. Return (Rental Only)
                </p>
                <p className="text-[11px] mt-1">
                  Return the item. The owner gives you the OTP from their{" "}
                  <strong>Email</strong>. You enter it here.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
              <div className="text-5xl mb-4">📦</div>
              <h2 className="text-xl font-bold text-gray-800">
                No activity yet
              </h2>
              <p className="text-gray-500 mt-2">
                When you buy or rent items, they will appear here.
              </p>
              <Link
                to="/items"
                className="mt-6 inline-block text-blue-600 font-bold hover:underline"
              >
                Explore Marketplace →
              </Link>
            </div>
          ) : (
            orders?.map((order) => {
              const isSeller =
                order.seller._id?.toString() === currentUser?._id?.toString() ||
                order.seller?.toString() === currentUser?._id?.toString();
              const isRent = order.transactionType === "rent";
              const itemExists = !!order.item;
              const partnerName = isSeller
                ? order.user?.name
                : order.seller?.name;

              return (
                <div
                  key={order._id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-visible transition-all hover:shadow-md"
                >
                  <div className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 items-center">
                    {/* 1. Item Image */}
                    <div className="relative w-20 h-20 flex-shrink-0 bg-gray-50 rounded-xl overflow-visible border border-gray-100">
                      {itemExists ? (
                        <img
                          src={order.item.images?.[0]?.url}
                          className="w-full h-full object-cover"
                          alt={order.item.title}
                        />
                      ) : order.itemImage ? (
                        <img
                          src={order.itemImage}
                          className="w-full h-full object-cover grayscale opacity-80"
                          alt={order.itemTitle}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-100">
                          <svg
                            className="w-6 h-6 mb-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                          <span className="text-[8px] font-bold uppercase">
                            Deleted
                          </span>
                        </div>
                      )}
                      <div
                        className={`absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase text-white shadow-md z-50 whitespace-nowrap border-2 border-white ${isRent ? "bg-purple-600" : "bg-blue-600"}`}
                      >
                        {order.transactionType}
                      </div>
                    </div>

                    {/* 2. Order Info */}
                    {/* <div className="flex-1 text-center sm:text-left">
                      <h3 className="font-bold text-gray-900 line-clamp-1">
                        {order.item.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {isSeller
                          ? isRent
                            ? "Rented to"
                            : "Sold to"
                          : isRent
                            ? "Rented from"
                            : "Bought from"}
                        :
                        <span className="ml-1 font-bold text-gray-700">
                          {partnerName}
                        </span>
                      </p>

                      <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-2">
                        <span
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                            order.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : order.status === "cancelled"
                                ? "bg-red-100 text-red-700"
                                : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {order.status}
                        </span>
                        {isRent && (
                          <span className="px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-500">
                            Deposit: {order.deposit}
                          </span>
                        )}
                      </div>
                    </div> */}
                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="font-bold text-gray-900 line-clamp-1">
                        {itemExists
                          ? order.item.title
                          : order.itemTitle || "Original Listing Removed"}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {isSeller
                          ? isRent
                            ? "Rented to"
                            : "Sold to"
                          : isRent
                            ? "Rented from"
                            : "Bought from"}
                        <span className="ml-1 font-bold text-gray-700">
                          {partnerName || "Unknown User"}
                        </span>
                      </p>

                      <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-2">
                        <span
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${
                            order.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : order.status === "cancelled"
                                ? "bg-red-100 text-red-700"
                                : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {order.status}
                        </span>
                        {/* 🟢 IMPORTANT: Always use order.amount, not item.price, so history stays accurate */}
                        <span className="px-2 py-1 rounded-lg text-[10px] font-bold uppercase bg-gray-100 text-gray-600">
                          Price: ₹{order.amount || 0}
                        </span>

                        {isRent && (
                          <span className="px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-500">
                            Deposit: {order.deposit}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 3. Handshake Logic Area */}
                    <div className="w-full sm:w-60">
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        {/* CASE 1: HANDOVER PENDING */}
                        {order.status === "pending" &&
                          (isSeller ? (
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-gray-400 uppercase">
                                Verify Pickup
                              </label>
                              <input
                                type="text"
                                maxLength="6"
                                placeholder="Enter Buyer's OTP"
                                className="w-full p-2 rounded-lg border border-gray-200 text-center font-mono tracking-widest text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                value={otpInputs[order._id] || ""} // Connect to state
                                onChange={(e) =>
                                  handleInputChange(order._id, e.target.value)
                                }
                              />
                              <button
                                onClick={() =>
                                  handleVerify(order._id, "pickup")
                                }
                                className="w-full bg-blue-600 text-white text-xs py-2.5 rounded-lg font-bold shadow-lg shadow-blue-100 hover:bg-blue-700"
                              >
                                Confirm Pickup
                              </button>
                            </div>
                          ) : (
                            <div className="text-center">
                              <p className="text-[10px] font-black text-blue-500 uppercase">
                                Your Pickup OTP
                              </p>
                              <p className="text-xs text-gray-500 mt-2 italic leading-tight">
                                Check your email. Share the code with the seller
                                during handover.
                              </p>
                              <button
                                onClick={() => handleResendOTP(order._id)}
                                className="mt-2 text-[10px] text-blue-500 underline"
                              >
                                Resend OTP Email
                              </button>
                            </div>
                          ))}

                        {/* CASE 2: RETURN PENDING (Rent only) */}
                        {order.status === "active" &&
                          isRent &&
                          (!isSeller ? (
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-purple-400 uppercase">
                                Verify Return
                              </label>
                              <input
                                type="text"
                                maxLength="6"
                                placeholder="Enter Owner's OTP"
                                className="w-full p-2 rounded-lg border border-gray-200 text-center font-mono tracking-widest text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                                value={otpInputs[order._id] || ""} // Connect to state
                                onChange={(e) =>
                                  handleInputChange(order._id, e.target.value)
                                }
                              />
                              <button
                                onClick={() =>
                                  handleVerify(order._id, "return")
                                }
                                className="w-full bg-purple-600 text-white text-xs py-2.5 rounded-lg font-bold shadow-lg shadow-purple-100"
                              >
                                Confirm Return
                              </button>
                            </div>
                          ) : (
                            <div className="text-center">
                              <p className="text-[10px] font-black text-purple-500 uppercase">
                                Item Return
                              </p>
                              <p className="text-xs text-gray-500 mt-2 italic leading-tight">
                                Provide the Return OTP (sent to your email) to
                                the buyer ONLY after you get your item back.
                              </p>
                            </div>
                          ))}

                        {/* CASE 3: COMPLETED */}
                        {order.status === "completed" && (
                          <div className="text-center flex flex-col items-center gap-1">
                            <div className="h-8 w-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                              ✓
                            </div>
                            <p className="text-xs font-bold text-green-700">
                              Deal Closed
                            </p>
                          </div>
                        )}

                        {/* CASE 4: CANCELLED */}
                        {order.status === "cancelled" && (
                          <p className="text-center text-xs font-bold text-gray-400 py-2">
                            Cancelled
                          </p>
                        )}
                      </div>

                      {/* Cancel Button Only for Pending */}
                      {order.status === "pending" && (
                        <button
                          onClick={() => handleCancel(order._id)}
                          className="w-full text-center text-[10px] font-bold text-red-400 hover:text-red-600 mt-3 transition-colors"
                        >
                          Cancel Request
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default History;
