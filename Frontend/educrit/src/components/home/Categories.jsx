import { useNavigate } from "react-router-dom";

// Based on your allowedCategories list
const categories = [
  {
    name: "Books",
    value: "books",
    image: "/categories/books.png",
  },
  {
    name: "Hardware Projects",
    value: "hardware-projects",
    image: "/categories/hardware-projects.png",
  },
  {
    name: "Software Projects",
    value: "software-projects",
    image: "/categories/software-projects.png",
  },
  {
    name: "Electronics & Hardware",
    value: "electronics",
    image: "/categories/electronics-and-hardware.png",
  },
  {
    name: "Stationery & Geometry",
    value: "stationery",
    image: "/categories/stationary-and-geometry.png",
  },
  {
    name: "Lab Equipment",
    value: "lab-equipment",
    image: "/categories/lab-equipments.png",
  },
  {
    name: "Others",
    value: "others",
    image: "/categories/other.png",
  },
  {
    name: "All Items",
    value: "all",
    image: "/categories/all-items.png",
  },
];

const Categories = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (cat) => {
    if (cat.value === "all") {
      // If they click 'All Items', go to the main listings page directly
      navigate("/items");
    } else {
      // Otherwise, go to the page with the specific filter
      navigate(`/items?category=${cat.value}`);
    }
  };

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Browse by Category
      </h2>

      {/* Adjusted grid to handle more items gracefully (sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
        {categories.map((cat) => (
          <div
            key={cat.value}
            onClick={() => handleCategoryClick(cat)}
            className="cursor-pointer rounded-xl overflow-hidden group shadow-sm hover:shadow-md transition bg-white border border-gray-100"
            // onClick={() => navigate(`/items?category=${cat.value}`)}
            // className="cursor-pointer rounded-xl overflow-hidden group shadow-sm hover:shadow-md transition bg-white border border-gray-100"
          >
            <div className="h-48 overflow-hidden">
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />
            </div>
            <div className="p-3">
              <h3 className="font-semibold text-gray-800">{cat.name}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Categories;
