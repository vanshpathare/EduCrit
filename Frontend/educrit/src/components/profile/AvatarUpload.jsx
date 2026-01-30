import { useState, useRef } from "react";
import { updateAvatar, deleteAvatar } from "../../api/user.api";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";

const AvatarUpload = () => {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  // 1. Default SVG Avatar (WhatsApp Style)
  const DefaultAvatar = () => (
    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-20 h-20">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    </div>
  );

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size (e.g., max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      setLoading(true);
      await updateAvatar(formData);
      await refreshUser(); // Refresh context to show new image
      toast.success("Profile photo updated");
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload avatar");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to remove your profile photo?"))
      return;

    try {
      setLoading(true);
      await deleteAvatar();
      await refreshUser();
      toast.success("Avatar removed");
    } catch {
      toast.error("Failed to delete avatar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative group">
        {/* 2. Main Avatar Circle */}
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg ring-2 ring-gray-100 relative bg-white">
          {user?.avatar?.url ? (
            <img
              src={user.avatar.url}
              alt={user.name}
              className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-90"
            />
          ) : (
            <DefaultAvatar />
          )}

          {/* Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20 backdrop-blur-sm">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        {/* 3. Action Buttons (Edit / Delete) */}
        <div className="absolute -bottom-2 right-0 flex gap-2 z-10">
          {/* Delete Button (Only if avatar exists) */}
          {user?.avatar?.url && (
            <button
              onClick={handleDelete}
              disabled={loading}
              className="p-2 bg-white text-red-500 rounded-full shadow-md border border-gray-100 hover:bg-red-50 hover:scale-105 transition-all"
              title="Remove Photo"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}

          {/* Upload Button (Camera) */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="p-2 bg-blue-600 text-white rounded-full shadow-md border-2 border-white hover:bg-blue-700 hover:scale-105 transition-all"
            title="Change Photo"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
        </div>

        {/* Hidden File Input */}
        <input
          type="file"
          hidden
          accept="image/*"
          ref={fileInputRef}
          onChange={handleUpload}
        />
      </div>

      {/* User Details Text */}
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
        <p className="text-sm text-gray-500">{user?.email}</p>
      </div>
    </div>
  );
};

export default AvatarUpload;
