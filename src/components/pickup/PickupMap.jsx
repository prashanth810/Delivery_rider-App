import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import { RIDER_LOCATION } from "./demoOrders";

const RIDER_ICON = L.divIcon({
    className: "pickup-leaflet-icon",
    html: '<span class="pickup-map-pin rider-map-pin" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="6" cy="17" r="3.2"/><circle cx="18" cy="17" r="3.2"/><path d="m6 17 4-7h4l4 7m-8-7-2-3m6 3 2-3m-7 6h7"/></svg></span>',
    iconSize: [42, 42],
    iconAnchor: [21, 21],
});

const createPickupIcon = (status) => L.divIcon({
    className: "pickup-leaflet-icon",
    html: `<span class="pickup-map-pin order-map-pin${status === "Accepted" ? " accepted-map-pin" : ""}${status === "Rejected" ? " rejected-map-pin" : ""}" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3 9.5 12 4l9 5.5M5.5 10v9.5h13V10M9 19.5v-6h6v6"/></svg></span>`,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
});

function SelectedOrderCamera({ selectedOrder }) {
    const map = useMap();
    const lat = selectedOrder?.pickup?.lat;
    const lng = selectedOrder?.pickup?.lng;

    useEffect(() => {
        if (lat != null && lng != null) {
            map.flyTo([lat, lng], 13, { duration: 0.5 });
        }
    }, [map, selectedOrder?.id, lat, lng]);

    return null;
}

export default function PickupMap({ orders, selectedOrder, onSelect }) {
    return (
        <div className="city-map" aria-label="OpenStreetMap showing the rider and pickup requests in Hyderabad">
            <MapContainer
                center={[RIDER_LOCATION.lat, RIDER_LOCATION.lng]}
                zoom={12}
                scrollWheelZoom
                className="pickup-leaflet-map"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <SelectedOrderCamera selectedOrder={selectedOrder} />
                <Marker
                    position={[RIDER_LOCATION.lat, RIDER_LOCATION.lng]}
                    icon={RIDER_ICON}
                    title="Sample rider location"
                    zIndexOffset={1000}
                />
                {orders.map((order) => (
                    <Marker
                        key={order.id}
                        position={[order.pickup.lat, order.pickup.lng]}
                        icon={createPickupIcon(order.status)}
                        title={`${order.store} pickup, ${order.status}`}
                        eventHandlers={{ click: () => onSelect(order.id) }}
                    />
                ))}
            </MapContainer>
        </div>
    );
}
