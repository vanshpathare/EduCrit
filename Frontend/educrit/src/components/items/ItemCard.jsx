import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { deleteItem } from "../../api/items.api";

const ItemCard = ({ item, showActions = false, onDelete }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const images = item.images || [];
  const hasMultipleImages = images.length > 1;

  // Auto-Scroll Effect
  useEffect(() => {
    if (!hasMultipleImages || isHovered) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [hasMultipleImages, isHovered, images.length]);

  // Carousel Logic (Manual)
  const nextImage = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // 🔗 SHARE LOGIC (New Feature)
  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const shareData = {
      title: item.title,
      text: `Check out "${item.title}" on EduCrit!`,
      url: `${window.location.origin}/items/${item._id}`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log("Share skipped");
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareData.url);
        toast.success("Link copied! 📋");
      } catch (err) {
        toast.error("Failed to copy");
      }
    }
  };

  // Delete Logic
  const handleDelete = async (e) => {
    e.preventDefault();
    if (!window.confirm("Delete this item?")) return;
    try {
      setIsDeleting(true);
      await deleteItem(item._id);
      toast.success("Deleted");
      if (onDelete) onDelete(item._id);
    } catch {
      toast.error("Failed");
      setIsDeleting(false);
    }
  };

  return (
    <div className="group relative flex flex-col bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 overflow-hidden h-full">
      {/* --- IMAGE SECTION --- */}
      <div
        className="relative w-full aspect-[4/3] bg-gray-100 overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {images.length > 0 ? (
          <img
            src={images[currentImageIndex]?.url}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50 text-xs">
            No Image
          </div>
        )}

        {/* 1. Category Badge (Top Left) */}
        <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-sm uppercase tracking-wide z-10">
          {item.category}
        </span>

        {/* 2. 🔗 SHARE BUTTON (Top Right - NEW) */}
        <button
          onClick={handleShare}
          className="absolute top-2 right-2 bg-white/90 hover:bg-white text-gray-700 p-1.5 rounded-full shadow-sm z-30 transition-all transform hover:scale-110 active:scale-95"
          title="Share this item"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
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

        {/* 3. 🎥 VIDEO BADGE (Moved to Bottom Right) */}
        {item.videoLink && (
          <span className="absolute bottom-2 right-2 bg-red-600/90 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-sm flex items-center gap-1 z-10 animate-pulse">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            VIDEO
          </span>
        )}

        {/* Carousel Controls (Only show if multiple images) */}
        {hasMultipleImages && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-1 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-1 rounded-full z-20 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                ></path>
              </svg>
            </button>
            <button
              onClick={nextImage}
              className="absolute right-1 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-1 rounded-full z-20 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                ></path>
              </svg>
            </button>

            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-20">
              {images.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1 rounded-full transition-all duration-300 ${idx === currentImageIndex ? "w-4 bg-white" : "w-1.5 bg-white/50"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* --- CONTENT SECTION --- */}
      <div className="p-3 flex flex-col flex-grow">
        <h3
          className="font-bold text-gray-900 text-sm sm:text-base mb-1 line-clamp-1 h-5 overflow-hidden"
          title={item.title}
        >
          {item.title}
        </h3>

        <p className="text-gray-500 text-xs mb-3 line-clamp-2 h-9 overflow-hidden leading-tight">
          {item.description}
        </p>

        <div className="flex flex-wrap gap-2 mt-auto h-6 overflow-hidden">
          {item.sell?.enabled && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-green-50 text-green-700 border border-green-100">
              Buy: ₹{item.sell.price}
            </span>
          )}
          {item.rent?.enabled && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-purple-50 text-purple-700 border border-purple-100">
              Rent: ₹{item.rent.price}
            </span>
          )}
        </div>
      </div>

      {/* --- FOOTER BUTTONS --- */}
      <div className="px-3 pb-3 pt-0 bg-white">
        {showActions ? (
          <div className="flex gap-2 text-xs font-medium">
            <Link
              to={`/items/${item._id}/edit`}
              className="flex-1 text-center py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Edit
            </Link>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
            >
              {isDeleting ? "..." : "Delete"}
            </button>
          </div>
        ) : (
          <Link
            to={`/items/${item._id}`}
            className="block w-full text-center py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition-colors shadow-sm shadow-blue-100"
          >
            View Details
          </Link>
        )}
      </div>
    </div>
  );
};

export default ItemCard;
