import React from "react";
import { FiTarget, FiInfo } from "react-icons/fi";

const RadiusFilter = ({ radius, setRadius }) => {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-lg border border-gray-100 w-full max-w-xs animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">
          Search Distance
        </label>
        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-black">
          {radius} KM
        </span>
      </div>

      <input
        type="range"
        min="0.5" // Minimum distance (500 meters)
        max="10" // Maximum distance (10 kilometers)
        step="0.5" // Intervals (0.5, 1.0, 1.5, etc.)
        value={radius}
        onChange={(e) => setRadius(parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 mb-2"
      />

      <div className="flex justify-between text-[10px] text-gray-400 font-bold px-1">
        <span>0.5 KM</span>
        <span>5 KM</span>
        <span>10 KM</span>
      </div>

      <p className="text-[10px] text-gray-500 mt-3 italic border-t pt-2">
        * Showing items within a {radius}km radius of your selected point.
      </p>
    </div>
  );
};

export default RadiusFilter;
