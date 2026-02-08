import { useEffect, useState } from "react";
import { getAllItems } from "../api/items.api";
import Loader from "../components/common/Loader";
import toast from "react-hot-toast";

import HeroCarousel from "../components/home/HeroCarousel";
import Features from "../components/home/Features";
import Categories from "../components/home/Categories";
import LatestListingsRow from "../components/home/LatestListingsRow";
import { useAuth } from "../hooks/useAuth";

const Home = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const data = await getAllItems();
        setItems(data.items || []);
      } catch {
        toast.error("Failed to load items");
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  if (loading) return <Loader />;

  // 🔥 TAKE ONLY LATEST 5 ITEMS
  const latestItems = [...items]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 6);

  return (
    <div>
      <HeroCarousel />
      <Features />
      <Categories />

      {/*  HORIZONTAL ROW */}
      {/* 🔥 LATEST LISTINGS SECTION */}
      {latestItems.length === 0 ? (
        <div className="text-center py-12 border rounded-xl bg-gray-50">
          <h3 className="text-xl font-semibold mb-2">No listings yet</h3>
          <p className="text-gray-600 mb-4">
            Be the first to post an item and help other students.
          </p>

          <a
            href={user ? "/add-item" : "/register"}
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition"
          >
            {user ? "Add Your First Item" : "Register to Add Your First Item"}
          </a>
        </div>
      ) : (
        <LatestListingsRow items={latestItems} />
      )}
    </div>
  );
};

export default Home;
