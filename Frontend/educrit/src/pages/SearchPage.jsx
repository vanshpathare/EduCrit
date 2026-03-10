// import { useState, useEffect } from "react";
// import { useSearchParams, useNavigate } from "react-router-dom";
// import { Link } from "react-router-dom";
// import axios from "axios";
// import DiscoveryMap from "../components/search/DiscoveryMap";
// import RadiusFilter from "../components/search/RadiusFilter";
// import Loader from "../components/common/Loader";
// import { fetchNearbyItems } from "../api/items.api";

// const normalizeLng = (lng) => {
//   return ((((parseFloat(lng) + 180) % 360) + 360) % 360) - 180;
// };

// const SearchPage = () => {
//   const navigate = useNavigate();
//   const [items, setItems] = useState([]);
//   const [searchParams, setSearchParams] = useSearchParams();
//   const [loading, setLoading] = useState(false);
//   const [page, setPage] = useState(1);
//   const [hasMore, setHasMore] = useState(false);

//   const urlLat = parseFloat(searchParams.get("lat")) || 19.076;
//   const urlLng = parseFloat(searchParams.get("lng")) || 72.8777;
//   const urlRadius = parseInt(searchParams.get("radius")) || 2;

//   const [radius, setRadius] = useState(urlRadius);
//   const [center, setCenter] = useState([urlLng, urlLat]);

//   useEffect(() => {
//     // Create the base params object
//     const params = {
//       lat: center[1],
//       lng: center[0],
//       radius: radius,
//     };

//     // Safely append existing filters from searchParams to the new URL
//     const filterKeys = [
//       "category",
//       "minPrice",
//       "maxPrice",
//       "institution",
//       "sell",
//       "rent",
//     ];
//     filterKeys.forEach((key) => {
//       const val = searchParams.get(key);
//       if (val) params[key] = val;
//     });

//     setSearchParams(params, { replace: true });
//   }, [center, radius]);

//   // 🟢 1. Reset logic for new searches (Map move, Radius change, Filters)
//   useEffect(() => {
//     const fetchItems = async () => {
//       console.log("Current Institution Filter:", searchParams.get("institution"));
//       try {
//         setLoading(true);
//         const queryParams = {
//           lng: normalizeLng(center[0]),
//           lat: parseFloat(center[1]),
//           radiusKm: radius,
//           page: 1, // Always start at 1
//           category: searchParams.get("category"),
//           minPrice: searchParams.get("minPrice"),
//           maxPrice: searchParams.get("maxPrice"),
//           institution: searchParams.get("institution"),
//           sell: searchParams.get("sell"),
//           rent: searchParams.get("rent"),
//         };

//         const data = await fetchNearbyItems(queryParams);

//         // IMPORTANT: Replace the entire list and sync states
//         setItems(data.items || []);
//         setHasMore(data.hasMore);
//         setPage(1); // Explicitly reset page to 1
//       } catch (err) {
//         console.error("Search failed", err);
//         setHasMore(false);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchItems();
//   }, [center, radius, searchParams]); // Triggers fresh fetch

//   // 🟢 2. Append logic for pagination
//   const handleLoadMore = async () => {
//     if (loading || !hasMore) return;

//     const nextPage = page + 1;
//     setLoading(true);

//     try {
//       const data = await fetchNearbyItems({
//         lng: normalizeLng(center[0]),
//         lat: parseFloat(center[1]),
//         radiusKm: radius,
//         page: nextPage,
//         category: searchParams.get("category"),
//         minPrice: searchParams.get("minPrice"),
//         maxPrice: searchParams.get("maxPrice"),
//         institution: searchParams.get("institution"),
//         sell: searchParams.get("sell"),
//         rent: searchParams.get("rent"),
//       });

//       if (data.items && data.items.length > 0) {
//         setItems((prev) => [...prev, ...data.items]);
//         setPage(nextPage);
//       }

//       // Update hasMore based on the NEW result
//       setHasMore(data.hasMore);
//     } catch (err) {
//       console.error("Load more failed", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filterKeys = [
//     "category",
//     "minPrice",
//     "maxPrice",
//     "institution",
//     "sell",
//     "rent",
//   ];

//   const activeFilterCount = filterKeys.reduce((count, key) => {
//     return searchParams.get(key) ? count + 1 : count;
//   }, 0);

//   const hasActiveFilters = filterKeys.some((key) => !!searchParams.get(key));

//   const handleFilterAction = () => {
//     // Navigate to all-items page
//     navigate("/items");
//   };

//   return (
//     <div className="flex flex-col lg:flex-row min-h-screen lg:h-[calc(100vh-64px)] bg-gray-50 lg:overflow-hidden">
//       {/* 🟢 MAP SECTION */}
//       <div className="w-full h-[40vh] lg:h-full lg:w-3/5 border-b lg:border-r border-gray-200 flex-shrink-0 sticky top-0 lg:relative z-0">
//         <DiscoveryMap
//           center={center}
//           radius={radius}
//           onCenterChange={setCenter}
//           items={items}
//           initialZoom={5}
//         />

//         {/* 📍 DESKTOP-ONLY RADIUS FILTER (Floating) */}
//         <div className="hidden lg:block absolute bottom-10 left-10 z-[1000]">
//           <RadiusFilter radius={radius} setRadius={setRadius} />
//         </div>
//       </div>

//       {/* 🟢 MOBILE FILTER & LIST SECTION */}
//       <div className="relative z-10 flex flex-col bg-white lg:bg-transparent lg:flex-1 lg:min-h-0">
//         {/* 📍 MOBILE-ONLY RADIUS FILTER (Inline - Hidden on Desktop) */}
//         <div className="lg:hidden bg-white p-4 border-b border-gray-200 shadow-sm z-10">
//           <RadiusFilter radius={radius} setRadius={setRadius} />
//         </div>

//         {/* 📍 SCROLLABLE LIST (Shared by both) */}
//         <div className="flex-1 overflow-y-visible lg:overflow-y-auto p-4 lg:p-6 bg-white">
//           <div className="flex justify-between items-center mb-6">
//             <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
//               Nearby Deals
//             </h1>

//             <button
//               onClick={handleFilterAction}
//               className={`flex items-center gap-2 px-3 py-1.5 transition-all duration-200 rounded-full border shadow-sm group mx-2 ${
//                 hasActiveFilters
//                   ? "bg-blue-50 border-blue-200 hover:bg-blue-100"
//                   : "bg-gray-50 border-gray-100 hover:bg-white hover:border-blue-200"
//               }`}
//             >
//               {/* Filter Icon */}
//               <svg
//                 className={`w-3.5 h-3.5 ${hasActiveFilters ? "text-blue-600" : "text-gray-400 group-hover:text-blue-500"}`}
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth="2.5"
//                   d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
//                 />
//               </svg>

//               {/* Constant Label: "Filters" */}
//               <span
//                 className={`text-[10px] font-bold uppercase tracking-wider ${hasActiveFilters ? "text-blue-700" : "text-gray-500"}`}
//               >
//                 Filters
//               </span>

//               {/* Divider */}
//               <div
//                 className={`h-3 w-[1px] ${hasActiveFilters ? "bg-blue-200" : "bg-gray-300"}`}
//               ></div>

//               {/* Dynamic Value: Shows Number if active, else shows "Set" */}
//               <span className="text-[10px] font-black uppercase tracking-wider text-blue-600">
//                 {hasActiveFilters ? activeFilterCount : "Set"}
//               </span>
//             </button>

//             <span className="text-xs lg:text-sm text-gray-500">
//               {hasMore
//                 ? `${items.length}+ items found`
//                 : `${items.length} items found`}
//             </span>
//           </div>

//           {loading ? (
//             <div className="flex justify-center py-10">
//               <Loader />
//             </div>
//           ) : items.length > 0 ? (
//             <>
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 {items.map((item) => (
//                   <Link
//                     key={item._id}
//                     to={`/items/${item._id}`}
//                     className="group block bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden"
//                   >
//                     <div className="relative h-32 lg:h-40 overflow-hidden bg-gray-50">
//                       <img
//                         src={item.image || item.images?.[0]?.url}
//                         alt={item.title}
//                         className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
//                       />
//                     </div>

//                     <h3 className="font-bold text-gray-800 truncate text-sm lg:text-base p-2 ">
//                       {item.title || "Untitled Item"}
//                     </h3>

//                     <div className="flex justify-between items-center mt-0.5  border-t border-gray-100 gap-2 p-2">
//                       {/* Left Side: View Details */}
//                       <span className="text-blue-600 font-bold text-[10px] whitespace-nowrap">
//                         VIEW DETAILS →
//                       </span>

//                       {/* Right Side: Inline Prices */}
//                       <div className="flex items-center gap-2 overflow-hidden">
//                         {/* Sell Price */}
//                         {item.sell?.enabled && (
//                           <div className="flex items-center gap-1">
//                             <span className="text-gray-900 font-extrabold text-xs lg:text-sm">
//                               ₹{item.sell.price}
//                             </span>
//                             <span className="text-[7px] bg-gray-100 text-gray-500 px-1 rounded uppercase font-medium">
//                               Buy
//                             </span>
//                           </div>
//                         )}

//                         {/* Rent Price */}
//                         {item.rent?.enabled && (
//                           <div className="flex items-center gap-1">
//                             <span className="text-blue-600 font-extrabold text-xs lg:text-sm">
//                               ₹{item.rent.price}
//                             </span>
//                             <span className="text-[7px] bg-blue-50 text-blue-500 px-1 rounded uppercase font-medium">
//                               Rent
//                             </span>
//                           </div>
//                         )}

//                         {/* Fallback */}
//                         {!item.sell?.enabled && !item.rent?.enabled && (
//                           <span className="text-gray-400 text-[9px] italic">
//                             Contact
//                           </span>
//                         )}
//                       </div>
//                     </div>
//                   </Link>
//                 ))}
//               </div>

//               {hasMore && (
//                 <div className="mt-8 mb-10 text-center">
//                   <button
//                     onClick={handleLoadMore}
//                     disabled={loading}
//                     className="px-8 py-3 bg-white border-2 border-blue-600 text-blue-600 font-bold rounded-xl hover:bg-blue-600 hover:text-white transition-all disabled:opacity-50 flex items-center gap-2 mx-auto"
//                   >
//                     {loading ? "Loading..." : "Load More Deals"}
//                   </button>
//                 </div>
//               )}

//               {!hasMore && (
//                 <div className="py-10 text-center">
//                   <p className="text-gray-400 italic text-sm">
//                     ✨ You've reached the end
//                   </p>
//                 </div>
//               )}
//             </>
//           ) : (
//             <div className="text-center py-20 text-gray-400">
//               <p>No items found in this area.</p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SearchPage;

import { useState, useEffect } from "react";
import {
  useSearchParams,
  useNavigate,
  Link,
  useLocation,
} from "react-router-dom";
import DiscoveryMap from "../components/search/DiscoveryMap";
import RadiusFilter from "../components/search/RadiusFilter";
import Loader from "../components/common/Loader";
import { fetchNearbyItems } from "../api/items.api";

const normalizeLng = (lng) =>
  ((((parseFloat(lng) + 180) % 360) + 360) % 360) - 180;

const SearchPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [items, setItems] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Default values
  const urlLat = parseFloat(searchParams.get("lat")) || 19.076;
  const urlLng = parseFloat(searchParams.get("lng")) || 72.8777;
  const urlRadius = parseInt(searchParams.get("radius")) || 2;

  const [radius, setRadius] = useState(urlRadius);
  const [center, setCenter] = useState([urlLng, urlLat]);

  const filterKeys = [
    "category",
    "minPrice",
    "maxPrice",
    "institution",
    "sell",
    "rent",
  ];

  // 1. Calculate active filters for the UI
  const activeFilterCount = filterKeys.reduce((count, key) => {
    return searchParams.get(key) ? count + 1 : count;
  }, 0);
  const hasActiveFilters = activeFilterCount > 0;

  // 🔴 HIGHLIGHT 1: SYNC MAP TO URL (The "Mobile Wipe" Fix)
  useEffect(() => {
    const currentParams = Object.fromEntries(searchParams.entries());

    // We spread currentParams so 'rent=true' isn't deleted when the map moves
    const newParams = {
      ...currentParams,
      lat: center[1],
      lng: center[0],
      radius: radius,
    };

    if (
      parseFloat(currentParams.lat) !== center[1] ||
      parseFloat(currentParams.lng) !== center[0] ||
      parseInt(currentParams.radius) !== radius
    ) {
      setSearchParams(newParams, { replace: true });
    }
    // We keep the dependency array stable here
  }, [center[0], center[1], radius]);

  // 🔴 HIGHLIGHT 2: THE "EFFECT SIZE" ERROR FIX
  // Instead of passing the whole searchParams object (which React sees as a collection),
  // we pass searchParams.toString(). This is a single string. It never changes "size."
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const queryParams = {
          lng: normalizeLng(center[0]),
          lat: parseFloat(center[1]),
          radiusKm: radius,
          page: 1,
          category: searchParams.get("category"),
          minPrice: searchParams.get("minPrice"),
          maxPrice: searchParams.get("maxPrice"),
          institution: searchParams.get("institution"),
          sell: searchParams.get("sell"),
          rent: searchParams.get("rent"),
        };

        const data = await fetchNearbyItems(queryParams);
        setItems(data.items || []);
        setHasMore(data.hasMore);
        setPage(1);
      } catch (err) {
        console.error("Fetch error:", err);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
    // Using .toString() keeps the dependency array size constant at 1
  }, [searchParams.toString()]);

  const handleLoadMore = async () => {
    if (loading || !hasMore) return;
    const nextPage = page + 1;
    setLoading(true);
    try {
      const data = await fetchNearbyItems({
        lng: normalizeLng(center[0]),
        lat: parseFloat(center[1]),
        radiusKm: radius,
        page: nextPage,
        category: searchParams.get("category"),
        minPrice: searchParams.get("minPrice"),
        maxPrice: searchParams.get("maxPrice"),
        institution: searchParams.get("institution"),
        sell: searchParams.get("sell"),
        rent: searchParams.get("rent"),
      });
      if (data.items) {
        setItems((prev) => [...prev, ...data.items]);
        setPage(nextPage);
        setHasMore(data.hasMore);
      }
    } catch (err) {
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen lg:h-[calc(100vh-64px)] bg-gray-50 lg:overflow-hidden">
      <div className="w-full h-[40vh] lg:h-full lg:w-3/5 border-b lg:border-r border-gray-200 flex-shrink-0 sticky top-0 lg:relative z-0">
        <DiscoveryMap
          center={center}
          radius={radius}
          onCenterChange={setCenter}
          items={items}
          initialZoom={5}
        />
        <div className="hidden lg:block absolute bottom-10 left-10 z-[1000]">
          <RadiusFilter radius={radius} setRadius={setRadius} />
        </div>
      </div>

      <div className="relative z-10 flex flex-col bg-white lg:bg-transparent lg:flex-1 lg:min-h-0">
        <div className="lg:hidden bg-white p-4 border-b border-gray-200 shadow-sm z-10">
          <RadiusFilter radius={radius} setRadius={setRadius} />
        </div>

        <div className="flex-1 overflow-y-auto p-4 lg:p-6 bg-white">
          <div className="flex justify-between items-center mb-6 w-full">
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900 shrink-0">
              Nearby Deals
            </h1>

            <button
              onClick={() => navigate(`/items${location.search}`)}
              className={`flex items-center gap-2 px-3 py-1.5 transition-all duration-200 rounded-full border shadow-sm ${
                hasActiveFilters
                  ? "bg-blue-50 border-blue-200"
                  : "bg-gray-50 border-gray-100"
              }`}
            >
              <svg
                className={`w-3.5 h-3.5 ${hasActiveFilters ? "text-blue-600" : "text-gray-400"}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider ${hasActiveFilters ? "text-blue-700" : "text-gray-500"}`}
              >
                Filters
              </span>
              <div className="h-3 w-[1px] bg-gray-300"></div>
              <span className="text-[10px] font-black text-blue-600">
                {hasActiveFilters ? activeFilterCount : "Set"}
              </span>
            </button>

            <span className="text-[10px] lg:text-sm text-gray-400 font-bold uppercase shrink-0">
              {items.length}
              {hasMore ? "+" : ""} items
            </span>
          </div>

          {loading && items.length === 0 ? (
            <div className="flex justify-center py-10">
              <Loader />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {items.map((item) => (
                <Link
                  key={item._id}
                  to={`/items/${item._id}`}
                  className="group block bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden"
                >
                  <div className="relative h-32 lg:h-40 overflow-hidden bg-gray-50">
                    <img
                      src={item.image || item.images?.[0]?.url}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="p-2">
                    <h3 className="font-bold text-gray-800 truncate text-sm">
                      {item.title}
                    </h3>
                    <div className="flex justify-between items-center mt-2 border-t pt-2 border-gray-50">
                      <span className="text-blue-600 font-bold text-[10px]">
                        VIEW DETAILS →
                      </span>
                      <div className="flex gap-2">
                        {item.rent?.enabled && (
                          <span className="text-xs font-bold text-blue-600">
                            ₹{item.rent.price}
                          </span>
                        )}
                        {item.sell?.enabled && (
                          <span className="text-xs font-bold text-gray-900">
                            ₹{item.sell.price}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
