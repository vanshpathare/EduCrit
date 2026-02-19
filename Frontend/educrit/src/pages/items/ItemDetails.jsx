import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom"; // 1. Import useNavigate
import { getItemById } from "../../api/items.api";
import { createOrder } from "../../api/orders.api";
import Loader from "../../components/common/Loader";
import ItemImages from "../../components/items/ItemImages";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth"; // 2. Import useAuth

const formatName = (fullName) => {
  if (!fullName) return "Unknown Seller";
  const parts = fullName.split(" ");
  if (parts.length === 1) return parts[0]; // Just "First Name"

  // Returns "Name + First Initial."
  return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
};

const ItemDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate(); // 3. Initialize navigation
  const { user } = useAuth(); // 4. Get current user status

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [selectedType, setSelectedType] = useState(null); // 'sale' or 'rent'
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await getItemById(id);
        setItem(res.data || res);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load item");
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  /* ------------------ HANDLERS ------------------ */

  const checkLogin = () => {
    if (!user) {
      toast.error("Please login to contact the seller 🔒");
      // Optional: Redirect them to login page after a small delay
      navigate("/login");
      return false;
    }
    return true;
  };

  const openEmail = (email, title) => {
    if (!checkLogin()) return; // 🛑 Stop if not logged in

    const subject = encodeURIComponent(`Interested in: ${title}`);
    window.location.href = `mailto:${email}?subject=${subject}`;
  };

  const openWhatsApp = (number, title) => {
    if (!checkLogin()) return; // 🛑 Stop if not logged in

    const message = encodeURIComponent(
      `Hi, I'm interested in your item: "${title}" listed on EduCrit. Can we discuss the meetup and negotiations? I'll confirm on the app once we agree so we can get our security OTPs! 🤝`,
    );
    window.open(`https://wa.me/${number}?text=${message}`, "_blank");
  };

  /* CONFIRM TRANSACTION HANDLER */
  const handleConfirmOrder = async () => {
    try {
      setIsProcessing(true);
      const orderData = {
        itemId: item._id,
        type: selectedType,
        amount: selectedType === "rent" ? item.rent.price : item.sell.price,
      };

      await createOrder(orderData);
      toast.success(
        "Order initiated! Pickup OTP sent to email 📧. Head to History page to manage the deal",
      );
      setShowModal(false);
      navigate("/history", { state: { newOrder: true } }); // Redirect to history to see the code
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to start transaction");
    } finally {
      setIsProcessing(false);
    }
  };

  // Add this helper function inside your component
  const handleShare = async () => {
    const shareData = {
      title: item.title,
      text: `Check out "${item.title}" on EduCrit!`,
      url: window.location.href, // Captures current page URL
    };

    // 1. Try Native Sharing (Mobile)
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log("Share cancelled", err);
      }
    } else {
      // 2. Fallback: Copy to Clipboard (Desktop)
      try {
        await navigator.clipboard.writeText(shareData.url);
        toast.success("Link copied to clipboard! 📋");
      } catch (err) {
        toast.error("Failed to copy link");
      }
    }
  };

  /* ------------------ RENDER ------------------ */

  if (loading) return <Loader />;

  if (!item) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-2xl font-bold text-gray-800">Item Not Found</h2>
        <p className="text-gray-500 mt-2">
          The item you are looking for has been removed or does not exist.
        </p>
        <Link to="/all-items" className="mt-4 text-blue-600 hover:underline">
          ← Back to listings
        </Link>
      </div>
    );
  }

  const {
    title,
    description,
    images,
    sell,
    rent,
    owner,
    category,
    institution,
    videoLink,
  } = item;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center text-sm text-gray-500">
          <Link to="/all-items" className="hover:text-blue-600 transition">
            All Items
          </Link>
          <span className="mx-2">/</span>
          <span className="capitalize text-gray-700 font-medium">
            {category}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* --- LEFT COL: IMAGES --- */}
          <div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-8">
              <ItemImages images={images} />
            </div>
          </div>

          {/* --- RIGHT COL: INFO --- */}
          <div className="flex flex-col h-full space-y-8">
            {/* Header Info */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gray-200 text-gray-700">
                  {category}
                </span>
                {institution && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700">
                    {institution}
                  </span>
                )}
              </div>

              <div className="flex justify-between items-start gap-4">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
                  {title}
                </h1>

                {/* 🔗 SHARE BUTTON */}
                <button
                  onClick={handleShare}
                  className="p-3 rounded-full bg-gray-100 hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-colors shadow-sm flex-shrink-0"
                  title="Share this item"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Pricing Card */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
              {sell?.enabled && (
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-1">
                    Selling Price
                  </p>
                  <p className="text-3xl font-bold text-blue-600">
                    ₹{sell.price}
                  </p>
                </div>
              )}
              {rent?.enabled && (
                <div
                  className={
                    sell?.enabled ? "sm:border-l sm:pl-6 border-gray-200" : ""
                  }
                >
                  <p className="text-sm text-gray-500 font-medium mb-1">
                    Rent Price
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    ₹{rent.price}{" "}
                    <span className="text-sm text-gray-400 font-normal">
                      / {rent.period}
                    </span>
                  </p>

                  <div className="mt-3 pt-3 border-t border-purple-100">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">
                        Security Deposit / Collateral
                      </span>
                      <p className="text-sm font-semibold text-gray-800 mt-0.5">
                        {rent.deposit || "No deposit required"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {rent?.enabled && (
              <div className="flex items-start gap-2 p-3 bg-purple-50 rounded-lg border border-purple-100">
                <svg
                  className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-[11px] text-purple-700 leading-tight">
                  <strong>Note:</strong> Collateral is refundable upon returning
                  item in original condition.
                </p>
              </div>
            )}

            {videoLink && (
              <a
                href={videoLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-red-50 text-red-600 font-bold rounded-xl border border-red-100 hover:bg-red-100 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                </svg>
                Watch Video Demo
              </a>
            )}
            {/* Description */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                Description
              </h3>
              <div className="prose prose-blue text-gray-600 leading-relaxed whitespace-pre-wrap">
                {description || "No description provided."}
              </div>
            </div>

            {/* Seller & Contact - Sticky at bottom on mobile/desktop */}
            <div className="mt-auto pt-8 border-t border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Sold by</h3>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
                  {owner?.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-lg">
                    {formatName(owner?.name)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {owner?.institution || "Institution not listed"}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* WhatsApp */}
                {owner?.whatsapp?.isVerified ? (
                  <button
                    onClick={() => openWhatsApp(owner.whatsapp.number, title)}
                    className="flex items-center justify-center gap-2 w-full py-3.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-green-200 transform hover:-translate-y-0.5"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                    </svg>
                    WhatsApp
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full py-3.5 bg-gray-100 text-gray-400 font-medium rounded-xl cursor-not-allowed border border-gray-200"
                  >
                    WhatsApp Not Available
                  </button>
                )}

                {/* Email */}
                <button
                  onClick={() => openEmail(owner?.email, title)}
                  className="flex items-center justify-center gap-2 w-full py-3.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold rounded-xl transition-all"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    ></path>
                  </svg>
                  Email Seller
                </button>
              </div>
            </div>

            <div className="p-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200 shadow-inner">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 text-center">
                Step 2: Finalize Handshake
              </h3>
              <div className="flex flex-col gap-3">
                {rent?.enabled && (
                  <button
                    onClick={() => {
                      if (checkLogin()) {
                        setSelectedType("rent");
                        setShowModal(true);
                      }
                    }}
                    className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-extrabold rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 active:scale-95"
                  >
                    Rent Now & Get OTP
                  </button>
                )}
                {sell?.enabled && (
                  <button
                    onClick={() => {
                      if (checkLogin()) {
                        setSelectedType("sale");
                        setShowModal(true);
                      }
                    }}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 active:scale-95"
                  >
                    Buy Now & Get OTP
                  </button>
                )}
              </div>
              <p className="text-[10px] text-gray-400 text-center mt-3 leading-tight italic">
                * Only confirm after you've finalized the meetup on WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in duration-200">
            <div className="text-center">
              <div
                className={`mx-auto flex items-center justify-center h-14 w-14 rounded-full mb-4 ${selectedType === "rent" ? "bg-purple-100" : "bg-blue-100"}`}
              >
                <span className="text-2xl">
                  {selectedType === "rent" ? "🕒" : "💰"}
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Confirm Request?
              </h3>
              <p className="text-sm text-gray-500 mt-2">
                Initiating transaction for{" "}
                <span className="font-semibold text-gray-800">"{title}"</span>.
              </p>
            </div>
            <div className="mt-6 p-4 bg-gray-50 rounded-2xl space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Price:</span>
                <span className="font-bold text-gray-900">
                  ₹{selectedType === "rent" ? rent.price : sell.price}
                </span>
              </div>
              {selectedType === "rent" && (
                <div className="pt-2 border-t border-gray-200">
                  <span className="text-[10px] font-bold text-purple-600 uppercase">
                    Deposit Required:
                  </span>
                  <p className="text-sm font-semibold text-gray-800">
                    {rent.deposit || "None"}
                  </p>
                </div>
              )}
            </div>
            <div className="mt-6 flex flex-col gap-2">
              <button
                disabled={isProcessing}
                onClick={handleConfirmOrder}
                className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transition-all ${selectedType === "rent" ? "bg-purple-600" : "bg-blue-600"} disabled:opacity-50`}
              >
                {isProcessing ? "Processing..." : "Confirm & Get OTP"}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="w-full py-3 text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemDetails;
