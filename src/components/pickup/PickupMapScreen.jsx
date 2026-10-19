import { useState } from "react";
import { FiMapPin, FiShield } from "react-icons/fi";
import PickupMap from "./PickupMap";
import PickupRequestPanel from "./PickupRequestPanel";

export default function PickupMapScreen({ orders, onAccept, onReject, online, setOnline }) {
    const [selectedId, setSelectedId] = useState(orders[0]?.id);
    const selectedOrder = orders.find((order) => order.id === selectedId) || orders[0];

    const accept = (id) => {
        onAccept(id);
        setSelectedId(id);
    };
    const reject = (id) => {
        onReject(id);
        setSelectedId(id);
    };

    return (
        <>
            <section className="page-title-row pickup-title-row">
                <div><span className="eyebrow">PICKUP MAP</span><h1>Pickup requests</h1><p>See nearby requests and choose your next delivery.</p></div>
                <button className={`availability-button${online ? " is-online" : ""}`} onClick={() => setOnline((value) => !value)} aria-pressed={online}>
                    <span className="availability-dot" /><span><strong>{online ? "You’re online" : "You’re offline"}</strong><small>{online ? "Available for requests" : "Tap to start receiving orders"}</small></span><span className="switch-track"><span /></span>
                </button>
            </section>
            <section className="pickup-layout">
                <div className="pickup-map-card">
                    <div className="map-toolbar">
                        <span className="map-location"><FiMapPin aria-hidden="true" /><span><strong>Hyderabad, Telangana</strong><small>Sample rider location · not GPS tracking</small></span></span>
                        <span className="map-legend"><span className="legend-rider" />Rider <span className="legend-pickup" />Pickup</span>
                    </div>
                    <PickupMap orders={orders} selectedOrder={selectedOrder} onSelect={setSelectedId} />
                    <div className="map-footer">
                        <span><FiShield aria-hidden="true" /> Map tiles by OpenStreetMap contributors</span>
                        <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">Map attribution</a>
                    </div>
                </div>
                <PickupRequestPanel
                    orders={orders}
                    selectedOrder={selectedOrder}
                    onSelect={setSelectedId}
                    onAccept={accept}
                    onReject={reject}
                />
            </section>
            <p className="sample-note"><FiShield aria-hidden="true" /> Order and rider locations are sample data for this preview.</p>
        </>
    );
}
