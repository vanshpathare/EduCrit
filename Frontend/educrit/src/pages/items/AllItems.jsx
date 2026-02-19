import { useEffect, useState, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getAllItems } from "../../api/items.api";
import ItemGrid from "../../components/items/ItemGrid";
import Loader from "../../components/common/Loader";
import toast from "react-hot-toast";
import axios from "axios";

const CATEGORIES = [
  "books",
  "hardware-projects",
  "software-projects",
  "electronics",
  "stationery",
  "lab-equipment",
  "others",
];

const AllItems = () => {
  const { user, loading: authLoading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL-driven filters
  const page = Number(searchParams.get("page")) || 1;
  const category = searchParams.get("category") || "";
  const institution = searchParams.get("institution") || "";
  const search = searchParams.get("search") || "";
  const sell = searchParams.get("sell") === "true";
  const rent = searchParams.get("rent") === "true";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";

  const [items, setItems] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const [localSearch, setLocalSearch] = useState(search);
  const [localInst, setLocalInst] = useState(institution);
  const [localMin, setLocalMin] = useState(minPrice);
  const [localMax, setLocalMax] = useState(maxPrice);

  const [instituteList, setInstituteList] = useState([]);

  useEffect(() => {
    setLocalSearch(search);
    setLocalInst(institution);
    setLocalMin(minPrice);
    setLocalMax(maxPrice);
  }, [search, institution, minPrice, maxPrice]);

  useEffect(() => {
    if (authLoading) return; // Wait until we know if the user is logged in

    // Check if we have already auto-applied the filter in this session
    const hasAutoApplied = sessionStorage.getItem("hasAutoAppliedInstitute");
    const savedPage = sessionStorage.getItem("lastBrowsedPage");

    // ONLY apply user institution on the VERY FIRST load of the component
    // If the user manually clears it later, isAuthReady stays true, preventing the loop
    if (!isAuthReady) {
      const urlInst = searchParams.get("institution");
      const urlPage = searchParams.get("page");
      let newParams = {};

      if (user?.institution && !urlInst && !hasAutoApplied) {
        newParams.institution = user.institution;
        sessionStorage.setItem("hasAutoAppliedInstitute", "true");
      }

      if (!urlPage && savedPage && savedPage !== "1") {
        newParams.page = savedPage;
      }

      if (Object.keys(newParams).length > 0) {
        updateFilters(newParams);
      }
      setIsAuthReady(true); // Now we allow fetchItems to run
    }
  }, [user, authLoading, isAuthReady, searchParams]);

  /* ---------------- 2. FETCH ITEMS ---------------- */
  const fetchItems = useCallback(async () => {
    if (!isAuthReady) return; // 🛑 Prevents fetching "All Colleges" while Auth is loading

    setLoading(true);
    try {
      const params = {};
      if (category) params.category = category;
      if (institution) params.institution = institution; // USES URL VALUE
      if (search) params.search = search;
      if (sell) params.sell = true;
      if (rent) params.rent = true;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;

      const data = await getAllItems(params);

      setItems(data.items || []);
      setTotalPages(data.totalPages || 1);
      setTotalItems(data.totalItems || 0);
    } catch (error) {
      toast.error("Failed to load items");
    } finally {
      setLoading(false);
    }
  }, [
    isAuthReady,
    category,
    institution,
    search,
    sell,
    rent,
    minPrice,
    maxPrice,
  ]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleInstituteChange = async (e) => {
    const userInput = e.target.value.toUpperCase();
    setLocalInst(userInput);

    if (userInput.length < 2) {
      setInstituteList([]);
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3002";
      const { data } = await axios.get(
        `${apiUrl}/institutes/search?query=${userInput}`,
      );
      setInstituteList(data);
    } catch (error) {
      console.error("Suggestion error", error);
    }
  };

  const handleSelectInstitute = (e) => {
    const val = e.target.value.toUpperCase();
    setLocalInst(val); // Update the input box immediately on selection or typing

    // 🟢 work: Check if the value matches a real institute from the database list
    const exists = instituteList.some((inst) => {
      const name = typeof inst === "object" ? inst.name : inst;
      return name.toUpperCase() === val;
    });

    if (exists || val === "") {
      updateFilters({ institution: val });
    }
  };

  const handleInstituteFocus = async () => {
    if (instituteList.length > 0) return;
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3002";
      const { data } = await axios.get(`${apiUrl}/institutes/search?query=A`);
      setInstituteList(data);
    } catch (error) {
      console.error("Focus error", error);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      if (
        localSearch !== search ||
        localMin !== minPrice ||
        localMax !== maxPrice
      ) {
        updateFilters({
          search: localSearch,
          minPrice: localMin,
          maxPrice: localMax,
          page: "1",
        });
      }
    }, 900);

    return () => clearTimeout(handler);
  }, [localSearch, localMin, localMax, search, minPrice, maxPrice]);

  /* ---------------- FILTER HELPERS ---------------- */
  const updateFilters = (updates) => {
    setSearchParams((prev) => {
      const params = Object.fromEntries(prev);

      Object.entries(updates).forEach(([key, value]) => {
        if (!value) delete params[key];
        else params[key] = value;

        if (key === "page") sessionStorage.setItem("lastBrowsedPage", value);
      });

      //CRITICAL: Reset to Page 1 if any filter OTHER than page is changed
      if (!updates.page && params.page) {
        params.page = "1";
        sessionStorage.setItem("lastBrowsedPage", "1");
      }

      return params;
    });
  };

  const resetFilters = () => {
    setSearchParams({});
    setInstituteList([]);
    sessionStorage.removeItem("lastBrowsedPage");
    sessionStorage.setItem("hasAutoAppliedInstitute", "true");
    setIsFilterOpen(false);
  };

  if (authLoading || (loading && items.length === 0)) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-0.5 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* --- PAGE HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              All Listings
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {totalItems > 0
                ? `Showing ${items.length} of ${totalItems} items matching your filters`
                : "Browse items available for sale and rent across campuses."}
            </p>
          </div>

          {institution && (
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm">
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                ></path>
              </svg>
              Filtering by:{" "}
              <span className="font-semibold ml-1">{institution}</span>
              <button
                onClick={resetFilters}
                className="ml-3 text-blue-400 hover:text-blue-600 font-bold"
                title="Clear Filters"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* --- MODERN FILTER BAR --- */}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-8 top-4 z-30 transition-shadow hover:shadow-md">
          <div className="md:col-span-5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.75 mt-1 block ml-1">
              Search Items
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Books, projects, electronics..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
              <svg
                className="absolute left-3 top-3 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
          <div className="flex flex-col lg:flex-row gap-5 items-start lg:items-end">
            {/* Search Input */}
            <div className="md:col-span-4">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.75 mt-1 block ml-1">
                Institution
              </label>
              <div className="relative">
                <input
                  id="institution-filter-input"
                  name="institution"
                  list="institute-options"
                  type="text"
                  placeholder="Select or Type Institution"
                  value={localInst}
                  onChange={handleInstituteChange}
                  onInput={handleSelectInstitute}
                  onFocus={handleInstituteFocus}
                  autoComplete="off"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl uppercase focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
                <datalist id="institute-options">
                  {instituteList.map((item, index) => (
                    <option
                      key={index}
                      value={typeof item === "object" ? item.name : item}
                    />
                  ))}
                </datalist>
                <svg
                  className="absolute left-3 top-3 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
            </div>

            {/* Category Dropdown */}
            <div className="w-full lg:w-64">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.75 mt-1 ml-1">
                Category
              </label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => updateFilters({ category: e.target.value })}
                  className="block w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all appearance-none cursor-pointer"
                >
                  <option value="">All Categories</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat
                        .replace("-", " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full lg:w-auto">
              <div className="relative w-full lg:w-32">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.75 mt-1 ml-1">
                  Min Price
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400 text-sm">
                    ₹
                  </span>
                  <input
                    type="number"
                    placeholder="0"
                    value={localMin}
                    onChange={(e) => setLocalMin(e.target.value)}
                    className="block w-full pl-7 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <span className="text-gray-300 mt-6 hidden sm:block">—</span>

              <div className="relative w-full lg:w-32">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.75 mt-1 ml-1">
                  Max Price
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400 text-sm">
                    ₹
                  </span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={localMax}
                    onChange={(e) => setLocalMax(e.target.value)}
                    className="block w-full pl-7 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Toggles Group */}
            <div className="flex items-center gap-3 w-full lg:w-auto pb-1">
              <label
                className={`flex items-center justify-center px-4 py-2.5 rounded-xl border cursor-pointer transition-all select-none flex-1 lg:flex-none ${sell ? "bg-blue-50 border-blue-200 text-blue-700 shadow-sm" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}`}
              >
                <input
                  type="checkbox"
                  className="hidden"
                  checked={sell}
                  onChange={(e) =>
                    updateFilters({ sell: e.target.checked ? "true" : "" })
                  }
                />
                <span className="text-sm font-semibold flex items-center gap-2">
                  {sell && (
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  )}
                  For Sale
                </span>
              </label>

              <label
                className={`flex items-center justify-center px-4 py-2.5 rounded-xl border cursor-pointer transition-all select-none flex-1 lg:flex-none ${rent ? "bg-purple-50 border-purple-200 text-purple-700 shadow-sm" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}`}
              >
                <input
                  type="checkbox"
                  className="hidden"
                  checked={rent}
                  onChange={(e) =>
                    updateFilters({ rent: e.target.checked ? "true" : "" })
                  }
                />
                <span className="text-sm font-semibold flex items-center gap-2">
                  {rent && (
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  )}
                  For Rent
                </span>
              </label>
            </div>

            {/* Clear Button (Mobile only usually, or if space permits) */}
            <div className="hidden lg:block pb-1">
              <button
                onClick={resetFilters}
                className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                title="Reset All Filters"
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
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  ></path>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* --- LISTINGS GRID --- */}
        {items.length === 0 ? (
          institution ? (
            // EMPTY STATE: INSTITUTION SPECIFIC
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm text-center">
              <div className="bg-blue-50 p-4 rounded-full mb-4">
                <svg
                  className="w-10 h-10 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  ></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No listings from {institution} yet
              </h3>
              <p className="text-gray-500 max-w-md mx-auto mb-8">
                Be the first to list an item from your institute, or browse
                items from other colleges nearby.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={resetFilters}
                  className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                >
                  Browse All Institutes
                </button>
                <Link
                  to="/add-item"
                  className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-200"
                >
                  Post First Item
                </Link>
              </div>
            </div>
          ) : (
            // EMPTY STATE: GENERIC
            <div className="text-center py-20">
              <div className="inline-block p-4 rounded-full bg-gray-50 mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  ></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                No items found
              </h3>
              <p className="text-gray-500 mt-1">
                Try adjusting your search or filters.
              </p>
              <button
                onClick={resetFilters}
                className="mt-4 text-blue-600 font-medium hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )
        ) : (
          <div className="animate-fade-in-up">
            <ItemGrid items={items} variant="list" />
          </div>
        )}

        {/* 🟢 ADD THE CONTROLS HERE - OUTSIDE the animated div */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-6 mt-12 mb-10 pb-6">
            <button
              disabled={Number(searchParams.get("page") || 1) <= 1}
              onClick={() =>
                updateFilters({
                  page: Number(searchParams.get("page") || 1) - 1,
                })
              }
              className="flex items-center px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              ← Previous
            </button>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400 uppercase tracking-widest font-bold">
                Page
              </span>
              <span className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-lg font-bold shadow-md shadow-blue-100">
                {searchParams.get("page") || 1}
              </span>
              <span className="text-sm text-gray-400 font-bold">
                of {totalPages}
              </span>
            </div>

            <button
              disabled={Number(searchParams.get("page") || 1) >= totalPages}
              onClick={() =>
                updateFilters({
                  page: Number(searchParams.get("page") || 1) + 1,
                })
              }
              className="flex items-center px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllItems;
