import { useEffect, useState } from "react";
import { Link } from "react-router-dom"; // Import Link for the 'Add Item' button
import { getMyListings, deleteItem } from "../../api/items.api";
import ItemGrid from "../../components/items/ItemGrid";
import Loader from "../../components/common/Loader";
import Modal from "../../components/common/Modal";
import toast from "react-hot-toast";

const MyListings = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // State for button loading
  const [deleting, setDeleting] = useState(false);

  const [showDelete, setShowDelete] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const fetchMyItems = async () => {
      try {
        const data = await getMyListings();
        setItems(data || []);
      } catch {
        toast.error("Failed to load your listings");
      } finally {
        setLoading(false);
      }
    };

    fetchMyItems();
  }, []);

  const openDeleteModal = (item) => {
    setSelectedItem(item);
    setShowDelete(true);
  };

  const confirmDelete = async () => {
    if (deleting) return;

    try {
      setDeleting(true);
      await deleteItem(selectedItem._id);

      // Update UI immediately
      setItems((prev) => prev.filter((item) => item._id !== selectedItem._id));

      toast.success("Item deleted successfully");
      setShowDelete(false);
      setSelectedItem(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete item");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* --- HEADER SECTION --- */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              My Listings
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage your items for sale and rent.
            </p>
          </div>

          <Link
            to="/add-item" // Assuming this is your route
            className="inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all transform hover:-translate-y-0.5"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Post New Item
          </Link>
        </div>

        {/* --- CONTENT SECTION --- */}
        {items.length === 0 ? (
          // ✨ BEAUTIFUL EMPTY STATE
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100 text-center">
            <div className="bg-blue-50 p-4 rounded-full mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              No items listed yet
            </h3>
            <p className="text-gray-500 mt-1 max-w-sm mb-6">
              You haven't uploaded any books, tools, or projects yet. Start
              earning by posting your first item!
            </p>
            <Link
              to="/add-item"
              className="px-6 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Create Listing
            </Link>
          </div>
        ) : (
          // ✨ GRID LISTING
          <div className="animate-fade-in-up">
            <ItemGrid
              items={items}
              showActions
              onDeleteClick={openDeleteModal}
              // onEditClick logic is handled inside ItemGrid or passed here if needed
            />
          </div>
        )}

        {/* --- DELETE CONFIRMATION MODAL --- */}
        <Modal
          isOpen={showDelete}
          onClose={() => setShowDelete(false)}
          title="Delete Item"
        >
          <div className="text-center sm:text-left">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4 sm:mx-0 sm:h-10 sm:w-10">
              <svg
                className="h-6 w-6 text-red-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">
              Are you sure?
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              You are about to delete <strong>"{selectedItem?.title}"</strong>.
              This action cannot be undone and the item will be removed
              permanently.
            </p>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
              <button
                onClick={() => setShowDelete(false)}
                disabled={deleting}
                className="w-full sm:w-auto inline-flex justify-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 bg-red-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {deleting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                    Deleting...
                  </>
                ) : (
                  "Delete Permanently"
                )}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default MyListings;
