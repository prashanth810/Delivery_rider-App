import { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { FiArrowRight, FiClock, FiMapPin, FiShield } from "react-icons/fi";
import PickupMap from "./PickupMap";
import { RIDER_LOCATION } from "./demoOrders";
import PickupRequestPanel from "./PickupRequestPanel";
import {
    formatAccuracy,
    isApproximate,
    useAddressOf,
    useRiderLocation,
} from "../../hooks/Useriderlocation";
import { makeitonlineofline } from "../../redux/Slices/OrdersSlice";


export default function PickupMapScreen({
    orders,
    onAccept,
    onReject,
    online,
    setOnline,
    activeOrder = null,
    activeOrders = [],
    ordersLoading = false,
    ordersError = null,
    onRetry,
    acceptLoading = false,
    acceptedRidesError = null,
}) {
    const dispatch = useDispatch();
    const [onlineUpdating, setOnlineUpdating] = useState(false);
    const [onlineToggleError, setOnlineToggleError] = useState("");

    // Completed orders live in "My deliveries"; the pickup list only keeps open / rejected requests.
    const requests = orders.filter((order) => order.status !== "Delivered");
    const { position, accuracy, status } = useRiderLocation();
    const live = status === "live";
    const riderPoint = position || RIDER_LOCATION;
    const riderAddress = useAddressOf(live ? position : null);
    const [selectedId, setSelectedId] = useState(requests[0]?.id);
    const selectedOrder = requests.find((order) => order.id === selectedId) || requests[0];
    const hasPickupLocations = requests.some(
        (order) => Number.isFinite(order.pickup?.lat) && Number.isFinite(order.pickup?.lng)
    );
    const formatAcceptedAt = (value) => {
        if (!value) return "Recently accepted";
        const date = new Date(value);
        return Number.isNaN(date.getTime())
            ? "Recently accepted"
            : `Accepted ${date.toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}`;
    };

    // Persist online/offline status through the API. Update the UI only after success.
    const handleAvailabilityToggle = async () => {
        if (onlineUpdating) return;

        const nextOnline = !online;
        setOnlineUpdating(true);
        setOnlineToggleError("");

        try {
            await dispatch(makeitonlineofline({
                "isOnline": nextOnline
            })).unwrap();
            setOnline(nextOnline);
        } catch (error) {
            setOnlineToggleError(
                typeof error === "string"
                    ? error
                    : error?.message || "Unable to update your availability. Please try again."
            );
        } finally {
            setOnlineUpdating(false);
        }
    };

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
                <div>
                    <span className="eyebrow">AVAILABLE DELIVERIES</span>
                    <h1>Pickup requests</h1>
                    <p>See available deliveries and choose your next order.</p>
                </div>

                <button
                    type="button"
                    className={`availability-button${online ? " is-online" : ""}`}
                    onClick={handleAvailabilityToggle}
                    aria-pressed={online}
                    disabled={onlineUpdating}
                >
                    <span className="availability-dot" />
                    <span>
                        <strong>
                            {onlineUpdating
                                ? "Updating status..."
                                : online
                                    ? "You’re online"
                                    : "You’re offline"}
                        </strong>
                        <small>
                            {onlineUpdating
                                ? "Please wait"
                                : online
                                    ? "Available for requests"
                                    : "Tap to start receiving orders"}
                        </small>
                    </span>
                    <span className="switch-track"><span /></span>
                </button>
            </section>

            {onlineToggleError && (
                <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                    {onlineToggleError}
                </p>
            )}

            {activeOrders.length > 0 && (
                <section className="mb-4 space-y-3" aria-label="Accepted deliveries">
                    {activeOrders.map((order) => (
                        <article key={order.id} className="accepted-ride-card">
                            <span className="accepted-ride-image">
                                {order.items?.[0]?.image
                                    ? <img src={order.items[0].image} alt={order.items[0].name || "Delivery item"} loading="lazy" />
                                    : <FiMapPin aria-hidden="true" />}
                            </span>
                            <div className="accepted-ride-details">
                                <span className="accepted-ride-label">Your accepted delivery</span>
                                <h2>
                                    {order.items?.[0]?.name || order.store}
                                    {order.items?.[0]?.weight ? ` (${order.items[0].weight})` : ""}
                                    {order.items?.[0]?.qty > 1 ? ` × ${order.items[0].qty}` : ""}
                                    {order.items?.length > 1 ? ` + ${order.items.length - 1} more` : ""}
                                </h2>
                                <p className="accepted-ride-pickup">
                                    <FiMapPin aria-hidden="true" />
                                    <span>{order.pickupAddress || "Pickup address unavailable"}</span>
                                </p>
                                <p className="accepted-ride-time">
                                    <FiClock aria-hidden="true" />
                                    {formatAcceptedAt(order.acceptedAt)}
                                </p>
                            </div>
                            <div className="accepted-ride-meta">
                                <strong>
                                    {order.paymentMethod === "ONLINE"
                                        ? "Paid online"
                                        : `Collect ₹${Number(order.amountToCollect || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                </strong>
                                <span>In progress</span>
                            </div>
                            <Link
                                to={`/delivery/${order.id}`}
                                className="accepted-ride-link"
                            >
                                Continue delivery <FiArrowRight aria-hidden="true" />
                            </Link>
                        </article>
                    ))}
                </section>
            )}

            {acceptedRidesError && (
                <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                    Could not refresh accepted deliveries: {acceptedRidesError}
                </p>
            )}

            <section className="pickup-layout">
                <div className="pickup-map-card">
                    <div className="map-toolbar">
                        <span className="map-location">
                            <FiMapPin aria-hidden="true" />
                            <span>
                                <strong>{live ? riderAddress || "Your live location" : "Hyderabad, Telangana"}</strong>
                                <small>
                                    {live
                                        ? `Live location · ${formatAccuracy(accuracy)}${isApproximate(accuracy) ? " (approximate)" : ""}`
                                        : "Sample location · allow location access for live tracking"}
                                </small>
                            </span>
                        </span>
                        <span className="map-legend">
                            <span className="legend-rider" />Rider
                            {hasPickupLocations && <><span className="legend-pickup" />Pickup</>}
                        </span>
                    </div>

                    <PickupMap
                        orders={requests}
                        selectedOrder={selectedOrder}
                        onSelect={setSelectedId}
                        riderPoint={riderPoint}
                        live={live}
                    />

                    <div className="map-footer">
                        <span><FiShield aria-hidden="true" /> Map tiles by OpenStreetMap contributors</span>
                        <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">
                            Map attribution
                        </a>
                    </div>
                </div>

                <PickupRequestPanel
                    orders={requests}
                    selectedOrder={selectedOrder}
                    onSelect={setSelectedId}
                    onAccept={accept}
                    onReject={reject}
                    online={online}
                    activeOrder={activeOrder}
                    onGoOnline={handleAvailabilityToggle}
                    loading={ordersLoading}
                    error={ordersError}
                    onRetry={onRetry}
                    acceptLoading={acceptLoading}
                />
            </section>

            {!hasPickupLocations && requests.length > 0 && (
                <p className="sample-note">
                    <FiShield aria-hidden="true" /> Pickup coordinates aren’t included for these deliveries.
                </p>
            )}
        </>
    );
}
