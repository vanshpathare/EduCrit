// import { useState } from "react";
// import { createItem } from "../../api/items.api";
// import toast from "react-hot-toast";
// import { useNavigate } from "react-router-dom";
// import Loader from "../../components/common/Loader";

// const AddItem = () => {
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(false);

//   const [form, setForm] = useState({
//     title: "",
//     description: "",
//     category: "books",
//     sellEnabled: false,
//     sellPrice: "",
//     rentEnabled: false,
//     rentPrice: "",
//     rentPeriod: "",
//   });

//   const [images, setImages] = useState([]);

//   /* ------------------ handlers ------------------ */

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setForm((prev) => ({
//       ...prev,
//       [name]: type === "checkbox" ? checked : value,
//     }));
//   };

//   const handleImages = (e) => {
//     // Convert FileList to Array
//     const files = Array.from(e.target.files);
//     setImages(files);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!form.title || !form.description || images.length === 0) {
//       toast.error("Please fill all required fields");
//       return;
//     }

//     if (images.length > 4) {
//       toast.error("Maximum 4 images allowed");
//       return;
//     }

//     const formData = new FormData();

//     formData.append("title", form.title);
//     formData.append("description", form.description);
//     formData.append("category", form.category);

//     formData.append(
//       "sell",
//       JSON.stringify({
//         enabled: form.sellEnabled,
//         price: form.sellEnabled ? Number(form.sellPrice) : undefined,
//       }),
//     );

//     formData.append(
//       "rent",
//       JSON.stringify({
//         enabled: form.rentEnabled,
//         price: form.rentEnabled ? Number(form.rentPrice) : undefined,
//         period: form.rentEnabled ? form.rentPeriod : undefined,
//       }),
//     );

//     images.forEach((img) => formData.append("images", img));

//     try {
//       setLoading(true);
//       await createItem(formData);
//       toast.success("Item uploaded successfully");
//       navigate("/my-listings");
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Upload failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ------------------ UI ------------------ */

//   if (loading) return <Loader />;

//   return (
//     <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-3xl mx-auto">
//         {/* HEADER */}
//         <div className="mb-10 text-center">
//           <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
//             List an Item
//           </h1>
//           <p className="mt-2 text-lg text-gray-600">
//             Share your resources with the community. Sell or rent in seconds.
//           </p>
//         </div>

//         <form
//           onSubmit={handleSubmit}
//           className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100"
//         >
//           <div className="p-8 space-y-8">
//             {/* SECTION 1: BASIC DETAILS */}
//             <div className="space-y-6">
//               <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
//                 <svg
//                   className="w-5 h-5 text-blue-500"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth="2"
//                     d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//                   ></path>
//                 </svg>
//                 Basic Details
//               </h3>

//               <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
//                 {/* Title */}
//                 <div className="sm:col-span-4">
//                   <label className="block text-sm font-bold text-gray-700 mb-1">
//                     Title
//                   </label>
//                   <input
//                     type="text"
//                     name="title"
//                     placeholder="e.g. Engineering Physics Vol 1"
//                     value={form.title}
//                     onChange={handleChange}
//                     className="block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//                     required
//                   />
//                 </div>

//                 {/* Category */}
//                 <div className="sm:col-span-2">
//                   <label className="block text-sm font-bold text-gray-700 mb-1">
//                     Category
//                   </label>
//                   <select
//                     name="category"
//                     value={form.category}
//                     onChange={handleChange}
//                     className="block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//                   >
//                     <option value="books">Books</option>
//                     <option value="electronics">Electronics</option>
//                     <option value="stationery">Stationery</option>
//                     <option value="lab-equipment">Lab Equipment</option>
//                     <option value="software-projects">Software</option>
//                     <option value="hardware-projects">Hardware</option>
//                     <option value="others">Others</option>
//                   </select>
//                 </div>

//                 {/* Description */}
//                 <div className="sm:col-span-6">
//                   <label className="block text-sm font-bold text-gray-700 mb-1">
//                     Description
//                   </label>
//                   <textarea
//                     name="description"
//                     placeholder="Describe the condition, features, or reason for selling..."
//                     value={form.description}
//                     onChange={handleChange}
//                     rows={4}
//                     className="block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
//                     required
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* SECTION 2: IMAGES */}
//             <div className="space-y-6">
//               <div className="flex justify-between items-center border-b pb-2">
//                 <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
//                   <svg
//                     className="w-5 h-5 text-purple-500"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth="2"
//                       d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
//                     ></path>
//                   </svg>
//                   Photos
//                 </h3>
//                 <span className="text-xs text-gray-500">Max 4 images</span>
//               </div>

//               <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:bg-gray-50 transition-colors cursor-pointer relative">
//                 <div className="space-y-1 text-center">
//                   <svg
//                     className="mx-auto h-12 w-12 text-gray-400"
//                     stroke="currentColor"
//                     fill="none"
//                     viewBox="0 0 48 48"
//                     aria-hidden="true"
//                   >
//                     <path
//                       d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
//                       strokeWidth={2}
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                     />
//                   </svg>
//                   <div className="flex text-sm text-gray-600 justify-center">
//                     <label
//                       htmlFor="file-upload"
//                       className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
//                     >
//                       <span>Upload files</span>
//                       <input
//                         id="file-upload"
//                         name="file-upload"
//                         type="file"
//                         className="sr-only" // Hide default ugly input
//                         multiple
//                         accept="image/*"
//                         onChange={handleImages}
//                         required
//                       />
//                     </label>
//                     <p className="pl-1">or drag and drop</p>
//                   </div>
//                   <p className="text-xs text-gray-500">
//                     PNG, JPG, GIF up to 5MB
//                   </p>
//                 </div>
//               </div>

//               {/* Show selected file count */}
//               {images.length > 0 && (
//                 <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium animate-fade-in-down">
//                   <svg
//                     className="w-5 h-5"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth="2"
//                       d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
//                     ></path>
//                   </svg>
//                   {images.length} file(s) selected
//                 </div>
//               )}
//             </div>

//             {/* SECTION 3: PRICING */}
//             <div className="space-y-6">
//               <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
//                 <svg
//                   className="w-5 h-5 text-green-500"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth="2"
//                     d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//                   ></path>
//                 </svg>
//                 Pricing Options
//               </h3>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 {/* SELL OPTION CARD */}
//                 <div
//                   className={`p-5 rounded-2xl border-2 transition-all duration-200 ${form.sellEnabled ? "border-blue-500 bg-blue-50/30" : "border-gray-200 hover:border-blue-200"}`}
//                 >
//                   <label className="flex items-center justify-between cursor-pointer mb-4">
//                     <span className="font-bold text-gray-900">
//                       Sell this item
//                     </span>
//                     <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
//                       <input
//                         type="checkbox"
//                         name="sellEnabled"
//                         checked={form.sellEnabled}
//                         onChange={handleChange}
//                         className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer transition-all duration-300"
//                         style={{
//                           right: form.sellEnabled ? "0" : "50%",
//                           borderColor: form.sellEnabled ? "#3B82F6" : "#D1D5DB",
//                         }}
//                       />
//                       <div
//                         className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${form.sellEnabled ? "bg-blue-500" : "bg-gray-300"}`}
//                       ></div>
//                     </div>
//                   </label>

//                   {form.sellEnabled && (
//                     <div className="animate-fade-in-down">
//                       <label className="block text-xs font-bold text-gray-500 mb-1">
//                         Selling Price (₹)
//                       </label>
//                       <input
//                         type="number"
//                         name="sellPrice"
//                         placeholder="0.00"
//                         value={form.sellPrice}
//                         onChange={handleChange}
//                         className="block w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                         required
//                       />
//                     </div>
//                   )}
//                 </div>

//                 {/* RENT OPTION CARD */}
//                 <div
//                   className={`p-5 rounded-2xl border-2 transition-all duration-200 ${form.rentEnabled ? "border-purple-500 bg-purple-50/30" : "border-gray-200 hover:border-purple-200"}`}
//                 >
//                   <label className="flex items-center justify-between cursor-pointer mb-4">
//                     <span className="font-bold text-gray-900">
//                       Rent this item
//                     </span>
//                     <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
//                       <input
//                         type="checkbox"
//                         name="rentEnabled"
//                         checked={form.rentEnabled}
//                         onChange={handleChange}
//                         className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer transition-all duration-300"
//                         style={{
//                           right: form.rentEnabled ? "0" : "50%",
//                           borderColor: form.rentEnabled ? "#8B5CF6" : "#D1D5DB",
//                         }}
//                       />
//                       <div
//                         className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${form.rentEnabled ? "bg-purple-500" : "bg-gray-300"}`}
//                       ></div>
//                     </div>
//                   </label>

//                   {form.rentEnabled && (
//                     <div className="space-y-3 animate-fade-in-down">
//                       <div>
//                         <label className="block text-xs font-bold text-gray-500 mb-1">
//                           Rent Price (₹)
//                         </label>
//                         <input
//                           type="number"
//                           name="rentPrice"
//                           placeholder="0.00"
//                           value={form.rentPrice}
//                           onChange={handleChange}
//                           className="block w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//                           required
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-xs font-bold text-gray-500 mb-1">
//                           Rent Period
//                         </label>
//                         <input
//                           type="text"
//                           name="rentPeriod"
//                           placeholder="e.g. Per Semester"
//                           value={form.rentPeriod}
//                           onChange={handleChange}
//                           className="block w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//                           required
//                         />
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* FOOTER ACTION */}
//           <div className="bg-gray-50 px-8 py-5 border-t border-gray-100 flex justify-end">
//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-transparent rounded-xl shadow-sm text-base font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all hover:-translate-y-0.5"
//             >
//               {loading ? (
//                 <>
//                   <svg
//                     className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
//                     xmlns="http://www.w3.org/2000/svg"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                   >
//                     <circle
//                       className="opacity-25"
//                       cx="12"
//                       cy="12"
//                       r="10"
//                       stroke="currentColor"
//                       strokeWidth="4"
//                     ></circle>
//                     <path
//                       className="opacity-75"
//                       fill="currentColor"
//                       d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                     ></path>
//                   </svg>
//                   Uploading...
//                 </>
//               ) : (
//                 "Publish Listing"
//               )}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default AddItem;

import { useState } from "react";
import { createItem } from "../../api/items.api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/common/Loader";
import { useAuth } from "../../hooks/useAuth";
//import axios from "axios";

const AddItem = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "books",
    institute: user?.institution || "",
    videoLink: "",
    sellEnabled: false,
    sellPrice: "",
    rentEnabled: false,
    rentPrice: "",
    rentPeriod: "day",
    rentDeposit: "",
  });

  const [images, setImages] = useState([]);

  /* ------------------ handlers ------------------ */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
  };

  const showVerificationNudge = () => {
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? "animate-enter" : "animate-leave"
          } max-w-md w-full bg-white shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 border border-blue-100`}
        >
          <div className="flex-1 w-0 p-5">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <svg
                    className="h-6 w-6 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-bold text-gray-900">
                  Item Published! 🎉
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Buyers contact verified sellers <strong>3x faster</strong>.
                  Verify your WhatsApp...
                </p>
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => {
                      toast.dismiss(t.id);
                      navigate("/profile");
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
                  >
                    Verify Now
                  </button>
                  <button
                    onClick={() => {
                      toast.dismiss(t.id);
                      navigate("/my-listings");
                    }}
                    className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                  >
                    Not Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
      { duration: Infinity },
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    //Must have an institution
    if (!form.institute) {
      toast.error(
        "Please add your Institution to your profile before listing.",
      );
      navigate("/profile");
      return;
    }

    if (!form.title || !form.description || images.length === 0) {
      toast.error("Please fill all required fields");
      return;
    }

    if (images.length > 4) {
      toast.error("Maximum 4 images allowed");
      return;
    }

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("category", form.category);
    formData.append("institute", form.institute);
    if (form.videoLink) {
      formData.append("videoLink", form.videoLink);
    }
    formData.append(
      "sell",
      JSON.stringify({
        enabled: form.sellEnabled,
        price: form.sellEnabled ? Number(form.sellPrice) : undefined,
      }),
    );
    formData.append(
      "rent",
      JSON.stringify({
        enabled: form.rentEnabled,
        price: form.rentEnabled ? Number(form.rentPrice) : undefined,
        period: form.rentEnabled ? form.rentPeriod : undefined,
        deposit: form.rentEnabled ? form.rentDeposit : undefined,
      }),
    );
    images.forEach((img) => formData.append("images", img));

    try {
      setLoading(true);
      await createItem(formData);

      const isWhatsAppVerified = user?.whatsapp?.isVerified;

      if (!isWhatsAppVerified) {
        showVerificationNudge();
      } else {
        toast.success("Item uploaded successfully");
        navigate("/my-listings");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
            List an Item
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Share your resources with the community. Sell or rent in seconds.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100"
        >
          <div className="p-8 space-y-8">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                Basic Details
              </h3>

              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-4">
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    placeholder="e.g. Engineering Physics Vol 1"
                    value={form.title}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="books">Books</option>
                    <option value="electronics">Electronics</option>
                    <option value="stationery">Stationery</option>
                    <option value="lab-equipment">Lab Equipment</option>
                    <option value="software-projects">Software</option>
                    <option value="hardware-projects">Hardware</option>
                    <option value="others">Others</option>
                  </select>
                </div>

                {/* ✅ UPDATED INSTITUTE FIELD */}
                <div className="sm:col-span-6">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Listing To Institution
                  </label>
                  <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 p-4 rounded-xl">
                    <div>
                      <p className="text-sm font-bold text-blue-900 uppercase">
                        {form.institute || "No Institution Set"}
                      </p>
                      <p className="text-[10px] text-blue-500 font-medium italic">
                        * Fetched from your profile. To change this, update your
                        settings.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    placeholder="Describe the condition, features..."
                    value={form.description}
                    onChange={handleChange}
                    rows={4}
                    className="block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    required
                  />
                </div>

                <div className="sm:col-span-6">
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Video Demo Link{" "}
                    <span className="font-normal text-gray-400">
                      (Optional)
                    </span>
                  </label>
                  <input
                    type="url"
                    name="videoLink"
                    placeholder="Paste a Google Drive, YouTube, or Loom link..."
                    value={form.videoLink}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            {/* IMAGES & PRICING SECTIONS (Kept Exactly as before) */}
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-purple-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    ></path>
                  </svg>
                  Photos
                </h3>
                <span className="text-xs text-gray-500">Max 4 images</span>
              </div>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:bg-gray-50 transition-colors cursor-pointer relative">
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600 justify-center">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                    >
                      <span>Upload files</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        multiple
                        accept="image/*"
                        onChange={handleImages}
                        required
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 5MB
                  </p>
                </div>
              </div>
              {images.length > 0 && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium animate-fade-in-down">
                  ✓ {images.length} file(s) selected
                </div>
              )}
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                Pricing Options
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div
                  className={`p-5 rounded-2xl border-2 transition-all duration-200 ${form.sellEnabled ? "border-blue-500 bg-blue-50/30" : "border-gray-200 hover:border-blue-200"}`}
                >
                  <label className="flex items-center justify-between cursor-pointer mb-4">
                    <span className="font-bold text-gray-900">
                      Sell this item
                    </span>
                    <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                      <input
                        type="checkbox"
                        name="sellEnabled"
                        checked={form.sellEnabled}
                        onChange={handleChange}
                        className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer transition-all duration-300"
                        style={{
                          right: form.sellEnabled ? "0" : "50%",
                          borderColor: form.sellEnabled ? "#3B82F6" : "#D1D5DB",
                        }}
                      />
                      <div
                        className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${form.sellEnabled ? "bg-blue-500" : "bg-gray-300"}`}
                      ></div>
                    </div>
                  </label>
                  {form.sellEnabled && (
                    <div className="animate-fade-in-down">
                      <label className="block text-xs font-bold text-gray-500 mb-1">
                        Selling Price (₹)
                      </label>
                      <input
                        type="number"
                        name="sellPrice"
                        placeholder="0.00"
                        value={form.sellPrice}
                        onChange={handleChange}
                        className="block w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  )}
                </div>
                <div
                  className={`p-5 rounded-2xl border-2 transition-all duration-200 ${form.rentEnabled ? "border-purple-500 bg-purple-50/30" : "border-gray-200 hover:border-purple-200"}`}
                >
                  <label className="flex items-center justify-between cursor-pointer mb-4">
                    <span className="font-bold text-gray-900">
                      Rent this item
                    </span>
                    <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                      <input
                        type="checkbox"
                        name="rentEnabled"
                        checked={form.rentEnabled}
                        onChange={handleChange}
                        className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer transition-all duration-300"
                        style={{
                          right: form.rentEnabled ? "0" : "50%",
                          borderColor: form.rentEnabled ? "#8B5CF6" : "#D1D5DB",
                        }}
                      />
                      <div
                        className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${form.rentEnabled ? "bg-purple-500" : "bg-gray-300"}`}
                      ></div>
                    </div>
                  </label>
                  {form.rentEnabled && (
                    <div className="space-y-3 animate-fade-in-down">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">
                          Rent Price (₹)
                        </label>
                        <input
                          type="number"
                          name="rentPrice"
                          placeholder="0.00"
                          value={form.rentPrice}
                          onChange={handleChange}
                          className="block w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">
                          Rent Period
                        </label>
                        <select
                          name="rentPeriod"
                          value={form.rentPeriod}
                          onChange={handleChange}
                          className="block w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                          required
                        >
                          <option value="hour">Per Hour</option>
                          <option value="day">Per Day</option>
                          <option value="week">Per Week</option>
                          <option value="month">Per Month</option>
                        </select>
                      </div>

                      <div className="pt-2">
                        <label className="block text-xs font-bold text-gray-500 mb-1">
                          Security Deposit / Collateral
                        </label>
                        <input
                          type="text"
                          name="rentDeposit"
                          placeholder="e.g. ₹500 or College ID Card"
                          value={form.rentDeposit}
                          onChange={handleChange}
                          className="block w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        <p className="text-[10px] text-gray-400 mt-1 italic">
                          * This deposit or collateral will be returned to you
                          once the item is handed back to the owner in its
                          original condition.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-8 py-5 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-transparent rounded-xl shadow-sm text-base font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all hover:-translate-y-0.5"
            >
              {loading ? "Uploading..." : "Publish Listing"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddItem;
