import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import { useMapTiles } from "../../hooks/useMapTiles";
import { useEffect, useRef, useMemo } from "react";
import LocationSearch from "../search/LocationSearch";

/**
 * MapController handles moving the map's "camera" view
 * whenever the coordinates change (e.g., after a search).
 */

//const [tileError, setTileError] = useState(false);
const INDIA_BOUNDS = [
  [-4.0, 68.1097], // Southwest corner of India
  [35.5133, 97.3953], // Northeast corner of India
];

function MapController({ center }) {
  const map = useMap();
  useEffect(() => {
    if (!center || center.length < 2) return;
    if (isNaN(center[0]) || isNaN(center[1])) return; // ✅ guard NaN

    map.setView([center[1], center[0]], 14, { animate: true }); // ✅ zoom 14
  }, [center, map]);
  return null;
}

const LocationPicker = ({ onLocationSelect, initialCoords }) => {
  const markerRef = useRef(null);
  const { tileUrl, attribution, handleTileError, handleTileLoad } =
    useMapTiles();

  /**
   * eventHandlers handles updating the coordinates
   * when the user finishes dragging the marker.
   */
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const { lat, lng } = marker.getLatLng();
          onLocationSelect([lng, lat]);
        }
      },
    }),
    [onLocationSelect],
  );

  /**
   * ClickHandler allows the user to click anywhere
   * on the map to drop a pin.
   */
  function ClickHandler() {
    useMapEvents({
      click(e) {
        onLocationSelect([e.latlng.lng, e.latlng.lat]);
      },
    });
    return null;
  }

  return (
    <div className="space-y-4 p-2 bg-white rounded-xl">
      {/* Search Input UI */}
      <LocationSearch onLocationSelect={onLocationSelect} />

      {/* Map Container */}
      <div className="h-[300px] w-full relative z-0 border border-gray-200 rounded-xl overflow-hidden shadow-inner">
        <MapContainer
          center={
            initialCoords
              ? [initialCoords[1], initialCoords[0]]
              : [20.5937, 78.9629]
          }
          maxBounds={INDIA_BOUNDS} // ✅ Can't scroll outside India
          maxBoundsViscosity={1.0} // ✅ Hard stop at boundary
          minZoom={4} // ✅ Can't zoom out too far
          zoom={initialCoords ? 16 : 5}
          className="h-full w-full"
        >
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

          <MapController center={initialCoords} />
          <ClickHandler />

          {initialCoords && (
            <Marker
              draggable={true}
              eventHandlers={eventHandlers}
              position={[initialCoords[1], initialCoords[0]]}
              ref={markerRef}
            />
          )}
        </MapContainer>
      </div>

      <p className="text-xs text-gray-400 text-center">
        📍 Click on the map or drag the pin to set your location
      </p>
    </div>
  );
};

export default LocationPicker;
