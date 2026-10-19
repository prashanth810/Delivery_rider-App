import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, Polyline, TileLayer, useMap } from "react-leaflet";

const icon = (cls, emoji) =>
    L.divIcon({ className: "", html: `<div class="qr-pin ${cls}"><span>${emoji}</span></div>`, iconSize: [36, 36], iconAnchor: [18, 18] });
const ICONS = { rider: icon("qr-rider", "🛵"), pickup: icon("qr-pickup", "🏪"), drop: icon("qr-drop", "🏠") };

// moves the camera when the selected order (or rider position) changes
const Camera = ({ rider, selected }) => {
    const map = useMap();
    useEffect(() => {
        if (selected) {
            const pts = [[selected.pickup.lat, selected.pickup.lng], [selected.drop.lat, selected.drop.lng], [rider.lat, rider.lng]];
            map.fitBounds(pts, { paddingTopLeft: [40, 90], paddingBottomRight: [40, 330], maxZoom: 15, animate: true });
        } else {
            map.flyTo([rider.lat, rider.lng], 14, { duration: 0.8 });
        }
    }, [selected?.id, rider.lat, rider.lng]); // eslint-disable-line react-hooks/exhaustive-deps
    return null;
};

const RiderMap = ({ rider, orders, selected, onSelect }) => (
    <MapContainer center={[rider.lat, rider.lng]} zoom={14} zoomControl={false} className="h-full w-full">
        <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Camera rider={rider} selected={selected} />
        <Marker position={[rider.lat, rider.lng]} icon={ICONS.rider} zIndexOffset={1000} />

        {orders.map((o) => (
            <Marker key={o.id} position={[o.pickup.lat, o.pickup.lng]} icon={ICONS.pickup}
                eventHandlers={{ click: () => onSelect(o.id) }} />
        ))}

        {selected && (
            <>
                <Marker position={[selected.drop.lat, selected.drop.lng]} icon={ICONS.drop} />
                <Polyline positions={[[selected.pickup.lat, selected.pickup.lng], [selected.drop.lat, selected.drop.lng]]}
                    pathOptions={{ color: "#12804a", weight: 5, dashArray: "2 10", lineCap: "round" }} />
                <Polyline positions={[[rider.lat, rider.lng], [selected.pickup.lat, selected.pickup.lng]]}
                    pathOptions={{ color: "#0f172a", weight: 3, opacity: 0.5 }} />
            </>
        )}
    </MapContainer>
);
export default RiderMap;