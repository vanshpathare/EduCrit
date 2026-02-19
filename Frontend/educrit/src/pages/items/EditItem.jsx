import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getItemById, updateItem } from "../../api/items.api";
import Loader from "../../components/common/Loader";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";
import axios from "axios";

const EditItem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form Data State
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "books",
    institute: "",
    videoLink: "",
    sell: { enabled: false, price: "" },
    rent: { enabled: false, price: "", period: "day", deposit: "" },
  });

  // Image
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [deletedImageIds, setDeletedImageIds] = useState([]);
  const [instituteList, setInstituteList] = useState([]);

  // Load Data
  useEffect(() => {
    const fetchItem = async () => {
      try {
        const item = await getItemById(id);

        const itemOwnerId = item.owner?._id || item.owner;
        const currentUserId = user?._id || user?.id;

        if (String(itemOwnerId) !== String(currentUserId)) {
          toast.error("You are not authorized to edit this item 🚫");
          navigate("/items"); // ✅ Fixed route (was /all-items)
          return;
        }

        setForm({
          title: item.title,
          description: item.description,
          category: item.category,
          videoLink: item.videoLink || "",
          institute: user?.institution || item.institution || "",
          sell: item.sell || { enabled: false, price: "" },
          rent: {
            enabled: item.rent?.enabled || false,
            price: item.rent?.price || "",
            period: item.rent?.period || "day",
            deposit: item.rent?.deposit || "",
          },
        });
        setExistingImages(item.images || []);
      } catch {
        toast.error("Failed to load item");
        navigate("/my-listings");
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchItem();
  }, [id, navigate, user]);

  const handleInstituteChange = async (e) => {
    const userInput = e.target.value.toUpperCase();

    // 1. Update the form display immediately
    setForm((prev) => ({ ...prev, institute: userInput }));

    // 2. Clear list if input is short (optimization)
    if (userInput.length < 2) {
      setInstituteList([]);
      return;
    }

    // 3. Call the Search API
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3002";
      const { data } = await axios.get(
        `${apiUrl}/api/institutes/search?query=${userInput}`,
      );
      setInstituteList(data); // Returns top 10 matches
    } catch (error) {
      console.error("Search error", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleOptionChange = (type, field, value) => {
    setForm((prev) => ({
      ...prev,
      [type]: { ...prev[type], [field]: value },
    }));
  };

  const handleDeleteExisting = (publicId) => {
    setDeletedImageIds((prev) => [...prev, publicId]);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (existingImages.length - deletedImageIds.length + files.length > 4) {
      toast.error("Maximum 4 images allowed total");
      return;
    }
    setNewImages(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("description", form.description);
      fd.append("category", form.category);
      fd.append("institute", form.institute);
      fd.append("videoLink", form.videoLink);
      fd.append("sell", JSON.stringify(form.sell));
      fd.append("rent", JSON.stringify(form.rent));

      if (deletedImageIds.length > 0) {
        fd.append("imagesToDelete", JSON.stringify(deletedImageIds));
      }

      newImages.forEach((file) => {
        fd.append("images", file);
      });

      await updateItem(id, fd);

      toast.success("Item updated successfully");
      navigate("/my-listings");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Edit Listing
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Update the details of your item below.
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
          >
            ← Cancel
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
            {/* --- SECTION 1: BASIC DETAILS --- */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Basic Details
              </h2>

              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                {/* Title */}
                <div className="sm:col-span-4">
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    value={form.title}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border p-3"
                    placeholder="e.g. Engineering Mathematics Vol. 1"
                    required
                  />
                </div>

                {/* Category */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor="category"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border p-3 bg-white"
                  >
                    <option value="books">Books</option>
                    <option value="hardware-projects">Hardware</option>
                    <option value="software-projects">Software</option>
                    <option value="electronics">Electronics</option>
                    <option value="stationery">Stationery</option>
                    <option value="lab-equipment">Lab Equip</option>
                    <option value="others">Others</option>
                  </select>
                </div>

                {/* Institute / College */}
                <div className="sm:col-span-6">
                  <label className="block text-sm font-medium text-gray-700">
                    Institute / College
                  </label>
                  <input
                    list="institute-options"
                    type="text"
                    name="institute"
                    value={form.institute}
                    onChange={handleInstituteChange}
                    autoComplete="off" //to prevent browser history
                    className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border p-3 uppercase"
                    placeholder="Search or type your college full name..."
                    required
                    readOnly
                  />
                  <datalist id="institute-options">
                    {instituteList.map((item, index) => {
                      // Safety Check: If item is an object, use item.name. If it's a string, use item.
                      const instituteName =
                        typeof item === "object" ? item.name : item;
                      return <option key={index} value={instituteName} />;
                    })}
                  </datalist>
                </div>

                {/* Description */}
                <div className="sm:col-span-6">
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    value={form.description}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border p-3"
                    placeholder="Describe the condition, edition, or key features..."
                    required
                  />
                </div>

                {/* Video Link */}
                <div className="sm:col-span-6">
                  <label
                    htmlFor="videoLink"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Video Demo Link{" "}
                    <span className="font-normal text-gray-400">
                      (Optional)
                    </span>
                  </label>
                  <input
                    type="url"
                    name="videoLink"
                    id="videoLink"
                    placeholder="https://...   (eg. YouTube, Drive or Vimeo link)"
                    value={form.videoLink}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border p-3"
                  />
                </div>
              </div>
            </div>

            {/* --- SECTION 2: IMAGES --- */}
            <div className="space-y-6">
              <div className="flex justify-between items-end border-b pb-2">
                <h2 className="text-lg font-semibold text-gray-900">Images</h2>
                <span className="text-xs text-gray-500">Max 4 images</span>
              </div>

              {/* Image Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {/* Existing Images */}
                {existingImages.map(
                  (img) =>
                    !deletedImageIds.includes(img.public_id) && (
                      <div
                        key={img.public_id}
                        className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200"
                      >
                        <img
                          src={img.url}
                          alt="Item"
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteExisting(img.public_id)}
                            className="bg-white/90 text-red-600 p-2 rounded-full hover:bg-white transition-colors"
                            title="Delete image"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
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
                        </div>
                      </div>
                    ),
                )}

                {/* Upload New Button (The "Dashed" Box) */}
                {existingImages.length -
                  deletedImageIds.length +
                  newImages.length <
                  4 && (
                  <label className="relative block border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-blue-500 hover:bg-blue-50 transition-colors cursor-pointer aspect-square flex flex-col items-center justify-center">
                    <svg
                      className="mx-auto h-8 w-8 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="mt-2 block text-xs font-medium text-gray-900">
                      Add Image
                    </span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {newImages.length > 0 && (
                <div className="text-sm text-green-600 bg-green-50 p-3 rounded-lg border border-green-100 flex items-center">
                  <span className="mr-2">✓</span> {newImages.length} new file(s)
                  selected
                </div>
              )}
            </div>

            {/* --- SECTION 3: PRICING OPTIONS --- */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Pricing Options
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* SELL CARD */}
                <div
                  className={`border rounded-xl p-5 transition-all duration-200 ${form.sell.enabled ? "border-blue-500 bg-blue-50/50 shadow-md ring-1 ring-blue-500" : "border-gray-200 hover:border-gray-300"}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${form.sell.enabled ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"}`}
                      >
                        <span className="font-bold text-lg">₹</span>
                      </div>
                      <span
                        className={`font-semibold ${form.sell.enabled ? "text-gray-900" : "text-gray-500"}`}
                      >
                        Sell Item
                      </span>
                    </div>
                    {/* Toggle Switch */}
                    <button
                      type="button"
                      onClick={() =>
                        handleOptionChange(
                          "sell",
                          "enabled",
                          !form.sell.enabled,
                        )
                      }
                      className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none ${form.sell.enabled ? "bg-blue-600" : "bg-gray-200"}`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${form.sell.enabled ? "translate-x-5" : "translate-x-0"}`}
                      />
                    </button>
                  </div>

                  {form.sell.enabled && (
                    <div className="animate-fade-in-down">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Selling Price (₹)
                      </label>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={form.sell.price}
                        onChange={(e) =>
                          handleOptionChange("sell", "price", e.target.value)
                        }
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm border p-2"
                      />
                    </div>
                  )}
                </div>

                {/* RENT CARD */}
                <div
                  className={`border rounded-xl p-5 transition-all duration-200 ${form.rent.enabled ? "border-purple-500 bg-purple-50/50 shadow-md ring-1 ring-purple-500" : "border-gray-200 hover:border-gray-300"}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${form.rent.enabled ? "bg-purple-100 text-purple-600" : "bg-gray-100 text-gray-500"}`}
                      >
                        <span className="font-bold text-lg">🕒</span>
                      </div>
                      <span
                        className={`font-semibold ${form.rent.enabled ? "text-gray-900" : "text-gray-500"}`}
                      >
                        Rent Item
                      </span>
                    </div>
                    {/* Toggle Switch */}
                    <button
                      type="button"
                      onClick={() =>
                        handleOptionChange(
                          "rent",
                          "enabled",
                          !form.rent.enabled,
                        )
                      }
                      className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none ${form.rent.enabled ? "bg-purple-600" : "bg-gray-200"}`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${form.rent.enabled ? "translate-x-5" : "translate-x-0"}`}
                      />
                    </button>
                  </div>

                  {form.rent.enabled && (
                    <div className="grid grid-cols-2 gap-3 animate-fade-in-down">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Rent Price (₹)
                        </label>
                        <input
                          type="number"
                          placeholder="0.00"
                          value={form.rent.price}
                          onChange={(e) =>
                            handleOptionChange("rent", "price", e.target.value)
                          }
                          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-sm border p-2"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Period
                        </label>
                        <select
                          value={form.rent.period}
                          onChange={(e) =>
                            handleOptionChange("rent", "period", e.target.value)
                          }
                          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-sm border p-2 bg-white"
                        >
                          <option value="hour">Per Hour</option>
                          <option value="day">Per Day</option>
                          <option value="week">Per Week</option>
                          <option value="month">Per Month</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* --- ACTION BUTTON --- */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Updating Item...
                  </span>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditItem;
