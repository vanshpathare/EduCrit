import React, { useState, useEffect, useRef } from "react";

const LocationSearch = ({
  onLocationSelect,
  placeholder = "Search location...",
}) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [resultType, setResultType] = useState("mmi"); // "mmi" or "nominatim"
  const dropdownRef = useRef(null);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.length > 4) {
        performSearch(query);
      } else {
        setResults([]);
        setShowDropdown(false);
      }
    }, 700);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const performSearch = async (searchTerm) => {
    try {
      // ✅ Try MapmyIndia first
      const res = await fetch(
        `/api/mmi-search?query=${encodeURIComponent(searchTerm)}`,
      );

      if (!res.ok) throw new Error("MMI search failed");

      const data = await res.json();
      const locations = data.suggestedLocations || [];

      if (locations.length > 0) {
        setResults(locations);
        setResultType("mmi");
        setShowDropdown(true);
        return;
      }

      throw new Error("No MMI results");
    } catch (err) {
      // ✅ Fallback to Nominatim
      console.warn("Falling back to Nominatim search");
      try {
        const res = await fetch(
          `/api/nominatim-search?query=${encodeURIComponent(searchTerm)}`,
        );
        const data = await res.json();
        if (data?.length > 0) {
          setResults(data);
          setResultType("nominatim");
          setShowDropdown(true);
        }
      } catch (fallbackErr) {
        console.error("Both search APIs failed:", fallbackErr);
      }
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = async (item) => {
    try {
      setShowDropdown(false);

      // ✅ Nominatim result — coordinates already available
      if (resultType === "nominatim") {
        const lat = parseFloat(item.lat);
        const lng = parseFloat(item.lon);
        setQuery(item.display_name);
        if (!isNaN(lat) && !isNaN(lng)) {
          onLocationSelect([lng, lat]);
        }
        return;
      }

      // ✅ MMI result — need to geocode
      const fullAddress = `${item.placeName}, ${item.placeAddress}`;
      setQuery(fullAddress);

      let lat = null;
      let lng = null;

      // STEP 1 — Try MapmyIndia geocode first
      try {
        const mmiRes = await fetch(
          `/api/mmi-geocode?address=${encodeURIComponent(fullAddress)}`,
        );
        const mmiData = await mmiRes.json();
        const loc = mmiData.copResults;

        if (loc?.latitude && loc?.longitude) {
          lat = parseFloat(loc.latitude);
          lng = parseFloat(loc.longitude);
        }
      } catch (e) {
        console.warn("MMI geocode failed, trying Nominatim");
      }

      // STEP 2 — Nominatim with state context always included
      if (isNaN(lat) || isNaN(lng) || lat === null) {
        const parts = item.placeAddress
          ? item.placeAddress
              .split(",")
              .map((p) => p.trim())
              .filter(Boolean)
          : [];

        const nonNumericParts = parts.filter((p) => isNaN(p));
        const lastPart = nonNumericParts[nonNumericParts.length - 1];

        const variants = [
          fullAddress,
          `${item.placeName}, ${lastPart}`,
          `${item.placeName}, ${parts.slice(-2).join(", ")}`,
          item.placeAddress,
          lastPart,
        ].filter(Boolean);

        for (const address of variants) {
          try {
            const res = await fetch(
              `/api/nominatim-search?query=${encodeURIComponent(address)}`,
            );
            const data = await res.json();

            if (data?.length > 0) {
              lat = parseFloat(data[0].lat);
              lng = parseFloat(data[0].lon);
              if (!isNaN(lat) && !isNaN(lng)) {
                break;
              }
            }
          } catch (e) {
            continue;
          }
        }
      }

      // STEP 3 — Last resort: placeName + first part of address
      if (isNaN(lat) || isNaN(lng) || lat === null) {
        const cityOnly = item.placeAddress?.split(",")?.[0]?.trim();
        if (cityOnly) {
          try {
            const res = await fetch(
              `/api/nominatim-search?query=${encodeURIComponent(`${item.placeName} ${cityOnly}`)}`,
            );
            const data = await res.json();
            if (data?.length > 0) {
              lat = parseFloat(data[0].lat);
              lng = parseFloat(data[0].lon);
            }
          } catch (e) {}
        }
      }

      if (lat !== null && !isNaN(lat) && !isNaN(lng)) {
        onLocationSelect([lng, lat]);
      } else {
        console.warn("No coordinates found");
      }
    } catch (err) {
      console.error("handleSelect failed:", err);
    }
  };

  return (
    <div
      className="relative w-full max-w-md mx-auto z-[1000]"
      ref={dropdownRef}
    >
      <div className="relative group">
        <input
          type="text"
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-sm"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="absolute left-3 top-3.5 text-gray-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {showDropdown && results.length > 0 && (
        <ul className="absolute w-full bg-white mt-2 rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {results.map((r, index) => (
            <li
              key={r.eLoc || r.place_id || index}
              className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-sm text-gray-700 border-b border-gray-50 last:border-none flex items-start gap-3"
              onClick={() => handleSelect(r)}
            >
              <span className="mt-0.5 text-gray-400">📍</span>
              <span className="truncate">
                {resultType === "mmi"
                  ? `${r.placeName}, ${r.placeAddress}`
                  : r.display_name}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LocationSearch;
