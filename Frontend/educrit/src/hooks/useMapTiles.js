// src/hooks/useMapTiles.js

import { useState, useRef } from "react";

const MMI_KEY = import.meta.env.VITE_MMI_KEY;

export const useMapTiles = () => {
  const [tileError, setTileError] = useState(false);
  const errorCount = useRef(0);

  const tileUrl = tileError
    ? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    : `https://apis.mapmyindia.com/advancedmaps/v1/${MMI_KEY}/still_map/{z}/{x}/{y}.png`;

  const attribution = tileError
    ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    : '&copy; <a href="https://www.mapmyindia.com">MapmyIndia</a>';

  const handleTileError = () => {
    errorCount.current += 1;
    // ✅ Only switch after 5 consecutive failures — ignore occasional blips
    if (errorCount.current >= 4) {
      console.warn("MapmyIndia tiles failed — switching to OpenStreetMap");
      setTileError(true);
    }
  };

  const handleTileLoad = () => {
    // ✅ Reset error count on successful load
    errorCount.current = 0;
  };

  return { tileUrl, attribution, handleTileError, handleTileLoad };
};
