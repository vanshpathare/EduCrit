import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Circle,
  Marker,
  useMapEvents,
  Popup,
  useMap,
} from "react-leaflet";
import { useMapTiles } from "../../hooks/useMapTiles";
import LocationSearch from "./LocationSearch";

import L from "leaflet";

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

L.Marker.prototype.options.icon = DefaultIcon;
//const [tileError, setTileError] = useState(false);

const INDIA_BOUNDS = [
  [-4.0, 68.1097], // Southwest corner of India
  [35.5133, 97.3953], // Northeast corner of India
];

function RecenterMap({ center }) {
  const map = useMap();
  const prevCenter = useRef(center);

  useEffect(() => {
    if (!center || center.length < 2) return;
    if (isNaN(center[0]) || isNaN(center[1])) return;

    // ✅ Only re-center if coordinates actually changed significantly
    const latDiff = Math.abs(center[1] - prevCenter.current[1]);
    const lngDiff = Math.abs(center[0] - prevCenter.current[0]);

    if (latDiff > 0.0001 || lngDiff > 0.0001) {
      map.setView([center[1], center[0]], 14, { animate: true });
      prevCenter.current = center;
    }
  }, [center[0], center[1], map]);
  return null;
}

const DiscoveryMap = ({ center, radius, onCenterChange, items = [] }) => {
  const navigate = useNavigate();
  const { tileUrl, attribution, handleTileError, handleTileLoad } =
    useMapTiles();

  function MapEvents() {
    useMapEvents({
      // moveend(e) {
      //   const map = e.target;
      //   const newCenter = map.getCenter();
      //   onCenterChange([newCenter.lng, newCenter.lat]);
      // },

      click(e) {
        const { lat, lng } = e.latlng;
        onCenterChange([lng, lat]); // Re-center search on click
      },
    });
    return null;
  }

  return (
    <div className="relative h-full w-full">
      <div className="absolute top-4 left-0 right-0 px-4 z-[999] pointer-events-none">
        <div className="pointer-events-auto">
          <LocationSearch onLocationSelect={onCenterChange} />
        </div>
      </div>

      <MapContainer
        center={[center[1], center[0]]}
        zoom={5}
        zoomControl={true}
        maxBounds={INDIA_BOUNDS} // ✅ Can't scroll outside India
        maxBoundsViscosity={1.0} // ✅ Hard stop at boundary
        minZoom={4} // ✅ Can't zoom out too far
        className="h-[400px] w-full rounded-2xl shadow-inner z-0"
      >
        <RecenterMap center={center} />
        {/* <TileLayer
          url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
          attribution="&copy; Google"
        /> */}
        <TileLayer
          url={tileUrl}
          attribution={attribution}
          maxZoom={18}
          minZoom={4}
          eventHandlers={{
            tileerror: handleTileError, // ✅ only switches after 3 failures
            tileload: handleTileLoad, // ✅ resets count on success
          }}
        />
        <MapEvents />

        {/* 🔵 The Visual Radius Area */}
        <Circle
          center={[center[1], center[0]]}
          radius={radius * 1000} // radius is in km, Circle needs meters
          pathOptions={{
            fillColor: "#3b82f6",
            fillOpacity: 0.2,
            color: "#3b82f6",
            weight: 1,
          }}
        />

        {/* 🔴 The Search Center Marker */}
        <Marker position={[center[1], center[0]]} />

        {/* 📍 Item Pins (Teasers) */}
        {items.map((item) => (
          <Marker
            key={item._id}
            position={[
              item.location.coordinates[1],
              item.location.coordinates[0],
            ]}
          >
            {/* 🟢 STEP 3: ADDING THE POPUP (Startup UX) */}
            <Popup>
              {/* 3. Wrap the content in a clickable div with a hover effect */}
              <div
                className="p-1 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => navigate(`/items/${item._id}`)} // 4. Direct navigation
              >
                <img
                  src={item.images?.[0]?.url || item.image} // Ensure you're using the correct image array
                  alt={item.title}
                  className="w-full h-20 object-cover rounded-md mb-2"
                />
                <h4 className="font-bold text-gray-900 text-sm leading-tight">
                  {item.title}
                </h4>
                <p className="text-blue-600 font-bold text-xs mt-1">
                  {item.sell?.enabled
                    ? `₹${item.sell.price}`
                    : `Rent: ₹${item.rent?.price}`}
                </p>
                <button className="w-full mt-2 bg-blue-600 text-white text-[10px] py-1 rounded font-bold">
                  View Details
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default DiscoveryMap;
