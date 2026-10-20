import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Circle, MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap } from "react-leaflet";
import { FiCrosshair } from "react-icons/fi";

const pin = (colorClass, svg) => L.divIcon({
    className: "",
    html: `<span class="grid h-10 w-10 place-items-center rounded-full border-[3px] border-white text-white shadow-lg ${colorClass}"><svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${svg}</svg></span>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
});

const STORE_ICON = pin("bg-brand-700", '<path d="M3 9.5 12 4l9 5.5M5.5 10v9.5h13V10M9 19.5v-6h6v6"/>');
const HOME_ICON = pin("bg-orange-500", '<path d="M3 11 12 4l9 7M5.5 10v10h13V10M10 20v-5h4v5"/>');
const RIDER_ICON = L.divIcon({
    className: "",
    html: '<span class="relative block h-5 w-5"><span class="absolute inset-0 animate-ping rounded-full bg-blue-500/40"></span><span class="absolute inset-0 rounded-full border-[3px] border-white bg-blue-600 shadow-[0_0_0_6px_rgba(37,99,235,0.2)]"></span></span>',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
});

// Fits the whole route on screen when the stage changes (or the rider taps "Recenter").
// It does NOT re-fit while the rider moves, so the map doesn't jump around.
function FitRoute({ points, resetKey }) {
    const map = useMap();
    const lastKey = useRef("");
    useEffect(() => {
        if (lastKey.current === resetKey || points.length < 2) return;
        lastKey.current = resetKey;
        map.fitBounds(L.latLngBounds(points), { padding: [60, 60], maxZoom: 16 });
    }, [map, points, resetKey]);
    return null;
}

/**
 * from        -> rider's current (live) location
 * to          -> pickup store (before pickup) or customer address (after pickup)
 * destination -> "store" | "customer"
 * onRoute     -> called with { km, min, toKey } when a road route is found
 */
export default function DeliveryMap({ from, to, destination, storeName = "Pickup store", live = false, accuracy = null, onRoute }) {
    const [route, setRoute] = useState(null);
    const [recenter, setRecenter] = useState(0);
    const onRouteRef = useRef(onRoute);
    useEffect(() => { onRouteRef.current = onRoute; }, [onRoute]);

    // Re-request the road route only when the rider has moved ~100 m (3 decimals), not on every GPS tick.
    const fromKey = `${from.lat.toFixed(3)},${from.lng.toFixed(3)}`;
    const toKey = `${to.lat.toFixed(5)},${to.lng.toFixed(5)}`;
    const straight = useMemo(() => [[from.lat, from.lng], [to.lat, to.lng]], [from.lat, from.lng, to.lat, to.lng]);

    useEffect(() => {
        const [fromLat, fromLng] = fromKey.split(",");
        const [toLat, toLng] = toKey.split(",");
        const controller = new AbortController();
        const url = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`;
        fetch(url, { signal: controller.signal })
            .then((response) => response.json())
            .then((data) => {
                const found = data?.routes?.[0];
                if (!found) return;
                setRoute({ toKey, points: found.geometry.coordinates.map(([lng, lat]) => [lat, lng]) });
                onRouteRef.current?.({ km: found.distance / 1000, min: Math.max(1, Math.round(found.duration / 60)), toKey });
            })
            .catch(() => { /* fall back to the straight line */ });
        return () => controller.abort();
    }, [fromKey, toKey]);

    // A route saved for an old destination is ignored (e.g. right after pickup is confirmed).
    const line = route && route.toKey === toKey ? route.points : straight;
    const isRoad = line !== straight;
    const toIsHome = destination === "customer";

    return (
        <div className="relative z-0 h-[340px] overflow-hidden rounded-xl border border-slate-200 sm:h-[420px]">
            <MapContainer center={[from.lat, from.lng]} zoom={13} scrollWheelZoom className="h-full w-full">
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <FitRoute points={straight} resetKey={`${destination}-${live}-${recenter}`} />
                {live && accuracy > 30 && (
                    <Circle center={[from.lat, from.lng]} radius={accuracy} pathOptions={{ color: "#2563eb", weight: 1, fillColor: "#3b82f6", fillOpacity: 0.12 }} />
                )}
                <Polyline positions={line} pathOptions={{ color: "#2563eb", weight: 5, opacity: 0.9, dashArray: isRoad ? undefined : "8 10" }} />
                <Marker position={[from.lat, from.lng]} icon={RIDER_ICON} zIndexOffset={900}>
                    <Tooltip direction="bottom" offset={[0, 10]}>
                        <span className="block text-xs font-bold text-slate-900">You</span>
                        <span className="block text-[11px] text-slate-500">{live ? "live location" : "sample location"}</span>
                    </Tooltip>
                </Marker>
                <Marker position={[to.lat, to.lng]} icon={toIsHome ? HOME_ICON : STORE_ICON}>
                    <Tooltip permanent direction="top" offset={[0, -18]}>
                        <span className="block text-xs font-bold text-slate-900">{toIsHome ? "Customer" : "Pickup"}</span>
                        <span className="block text-[11px] text-slate-500">{toIsHome ? "delivery location" : storeName}</span>
                    </Tooltip>
                </Marker>
            </MapContainer>
            <button
                type="button"
                onClick={() => setRecenter((value) => value + 1)}
                className="absolute right-3 top-3 z-[500] inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow hover:bg-slate-50"
            >
                <FiCrosshair /> Recenter
            </button>
            <div className="pointer-events-none absolute bottom-3 left-3 z-[500] flex items-center gap-4 rounded-lg bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow">
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-blue-600" />You</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-brand-700" />Pickup</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-orange-500" />Customer</span>
            </div>
        </div>
    );
}