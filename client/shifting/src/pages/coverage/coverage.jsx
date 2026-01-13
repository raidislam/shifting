import { useMemo, useState } from "react";
import DistrictMap from "../../component/districtmap/districtMap";
import { useLoaderData } from "react-router";

function normalize(s) {
  return String(s || "").toLowerCase().trim();
}

export default function CoveragePage() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const ALL_BRANCHES = useLoaderData();

  const filtered = useMemo(() => {
    const q = normalize(query);
    if (!q) return ALL_BRANCHES;

    return ALL_BRANCHES.filter((b) => {
      const haystack = [
        b.district,
        b.city,
        b.region,
        ...(Array.isArray(b.covered_area) ? b.covered_area : []),
      ]
        .map(normalize)
        .join(" ");

      return haystack.includes(q);
    });
  }, [query]);

  const suggestions = useMemo(() => {
    const q = normalize(query);
    if (!q) return [];
    return filtered.slice(0, 8);
  }, [query, filtered]);

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="card bg-base-100 border border-base-300">
        <div className="card-body gap-3">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <h2 className="card-title">Our Branches Map</h2>
              <p className="text-sm opacity-70">
                Search districts/cities/regions/covered areas. Click suggestion to zoom.
              </p>
            </div>
            <div className="badge badge-outline">
              Showing: {filtered.length}
            </div>
          </div>

          {/* Search Bar (TOP OF MAP) */}
          <div className="relative">
            <input
              type="text"
              className="input input-bordered w-full"
              placeholder="Search district, city, region, covered area..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelected(null);
              }}
            />

            {/* Suggestions dropdown */}
            {suggestions.length > 0 ? (
              <div className="absolute z-[999] mt-2 w-full rounded-box border border-base-300 bg-base-100 shadow">
                {suggestions.map((b, i) => (
                  <button
                    key={`${b.district}-${i}`}
                    className="w-full text-left px-4 py-3 hover:bg-base-200 flex items-center justify-between"
                    onClick={() => {
                      setSelected(b);
                      setQuery(b.district);
                    }}
                  >
                    <span className="font-medium">{b.district}</span>
                    <span className="text-sm opacity-70">
                      {b.region} · {b.city}
                    </span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <DistrictMap branches={filtered} flyTarget={selected} />
    </div>
  );
}
