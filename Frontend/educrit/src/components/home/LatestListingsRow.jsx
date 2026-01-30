import ItemCard from "../items/ItemCard";

const LatestListingsRow = ({ items }) => {
  if (!items || items.length === 0) return null;

  return (
    <section className="mb-12">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="text-xl font-bold text-gray-800">Latest Listings</h2>
        {/* Optional: Add a 'View All' link here if you want */}
      </div>

      {/* HORIZONTAL SCROLLER */}
      <div
        className="
          flex gap-4
          overflow-x-auto
          pb-6 pt-2
          -mx-4 px-4 sm:mx-0 sm:px-0 /* Full bleed on mobile, constrained on desktop */
          scroll-smooth
          snap-x snap-mandatory
          hide-scrollbar /* Optional: Add a CSS utility to hide scrollbar if preferred */
        "
      >
        {items.map((item) => (
          <div
            key={item._id}
            className="
              /* Mobile: 220px (Compact) */
              min-w-[220px]
              max-w-[220px]
              
              /* Desktop: 260px (Standard) */
              sm:min-w-[260px]
              sm:max-w-[260px]
              
              snap-start
              flex-shrink-0
              h-full
            "
          >
            <ItemCard item={item} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default LatestListingsRow;
