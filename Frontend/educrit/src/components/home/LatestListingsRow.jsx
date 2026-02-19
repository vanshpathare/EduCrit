import { Link } from "react-router-dom";
import ItemCard from "../items/ItemCard";

const LatestListingsRow = ({ items }) => {
  if (!items || items.length === 0) return null;

  return (
    <section className="mb-12 animate-fade-in-up">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="text-xl font-bold text-gray-800">Latest Listings</h2>
        {/* Simple text link in header */}
        <Link
          to="/items"
          className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
        >
          View All
        </Link>
      </div>

      {/* HORIZONTAL SCROLLER */}
      <div
        className="
          flex gap-4
          overflow-x-auto
          pb-6 pt-2
          -mx-4 px-4 sm:mx-0 sm:px-0 /* Full bleed on mobile */
          scroll-smooth
          snap-x snap-mandatory
          hide-scrollbar
        "
      >
        {/* 1. Map through the 6 items passed from Home.jsx */}
        {items.map((item) => (
          <div
            key={item._id}
            className="
              min-w-[220px] max-w-[220px]
              sm:min-w-[260px] sm:max-w-[260px]
              snap-start
              flex-shrink-0
              h-full
            "
          >
            <ItemCard item={item} variant="grid" />
          </div>
        ))}

        {/* 2. ✅ THE "VIEW ALL" CARD AT THE END */}
        <div
          className="
            min-w-[150px] max-w-[150px]
            sm:min-w-[180px] sm:max-w-[180px]
            snap-start
            flex-shrink-0
            flex flex-col
          "
        >
          <Link
            to="/items" // 👈 Redirects to All Items page
            className="
              h-full min-h-[250px]
              flex flex-col items-center justify-center
              bg-white border-2 border-dashed border-gray-300 rounded-xl
              text-gray-500 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50
              transition-all duration-300 group
              cursor-pointer shadow-sm hover:shadow-md
            "
          >
            <div className="p-4 bg-gray-100 rounded-full group-hover:bg-blue-200 transition-colors mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-gray-500 group-hover:text-blue-600 transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </div>
            <span className="font-bold text-sm">View All Items</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default LatestListingsRow;
