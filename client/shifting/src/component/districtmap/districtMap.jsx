import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

// Marker icon fix (standard React/Leaflet bundler fix)
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const DEFAULT_CENTER = [23.685, 90.3563];
const DEFAULT_ZOOM = 7;

function FlyTo({ target }) {
  const map = useMap();
  if (!target) return null;

  // smooth fly
  map.flyTo([target.latitude, target.longitude], 11, { duration: 1.2 });
  return null;
}

export default function DistrictMap({ branches = [], flyTarget = null }) {
  return (
    <div className="w-full h-[70vh] rounded-box overflow-hidden border border-base-300">
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FlyTo target={flyTarget} />

        {branches.map((b, idx) => (
          <Marker
            key={`${b.district}-${b.city}-${idx}`}
            position={[b.latitude, b.longitude]}
          >
            <Popup>
              <div className="space-y-1">
                <div className="font-bold text-base">{b.district}</div>
                <div className="text-sm opacity-80">
                  Region: <span className="font-medium">{b.region}</span>
                </div>
                <div className="text-sm opacity-80">
                  City: <span className="font-medium">{b.city}</span>
                </div>
                <div className="text-sm">
                  Status:{" "}
                  <span
                    className={
                      b.status === "active"
                        ? "badge badge-success badge-sm"
                        : "badge badge-ghost badge-sm"
                    }
                  >
                    {b.status}
                  </span>
                </div>

                <div className="text-sm">
                  Covered:{" "}
                  <span className="opacity-80">
                    {Array.isArray(b.covered_area) ? b.covered_area.join(", ") : "-"}
                  </span>
                </div>

                {b.flowchart ? (
                  <a
                    className="link link-primary text-sm"
                    href={b.flowchart}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View flowchart
                  </a>
                ) : null}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
