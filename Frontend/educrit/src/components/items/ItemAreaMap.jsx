import { MapContainer, TileLayer, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const ItemAreaMap = ({ coordinates }) => {
  if (!coordinates || coordinates.length !== 2) return null;

  // DB: [longitude, latitude] -> Leaflet: [latitude, longitude]
  const position = [coordinates[1], coordinates[0]];

  return (
    <div className="mt-8 border-t pt-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">
        Approximate Location
      </h3>
      <div className="h-[280px] w-full rounded-2xl overflow-hidden border border-gray-200 shadow-sm z-0">
        <MapContainer
          center={position}
          zoom={14}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <TileLayer
            url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
            attribution="&copy; Google"
          />
          <Circle
            center={position}
            radius={650}
            pathOptions={{
              color: "#3b82f6",
              fillColor: "#93c5fd",
              fillOpacity: 0.4,
              weight: 2,
              dashArray: "5, 5",
            }}
          />
        </MapContainer>
      </div>
      <p className="text-sm text-gray-500 mt-2 italic">
        * Exact location is hidden for seller privacy.
      </p>
    </div>
  );
};

export default ItemAreaMap;
