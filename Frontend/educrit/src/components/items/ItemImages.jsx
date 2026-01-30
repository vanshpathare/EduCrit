import { useState } from "react";

const ItemImages = ({ images }) => {
  const [index, setIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const next = () => setIndex((prev) => (prev + 1) % images.length);

  const prev = () =>
    setIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className="relative w-full h-72 sm:h-96">
      <img
        src={images[index].url}
        alt="Item"
        loading="lazy"
        className="w-full h-full object-cover rounded"
      />

      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white px-2 py-1 rounded"
          >
            ◀
          </button>

          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white px-2 py-1 rounded"
          >
            ▶
          </button>
        </>
      )}
    </div>
  );
};

export default ItemImages;
