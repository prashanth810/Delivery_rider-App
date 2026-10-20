import { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { FiArrowRight, FiMapPin, FiShield, FiTruck } from "react-icons/fi";
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
    ordersLoading = false,
    ordersError = null,
    onRetry,
    acceptLoading = false,
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

            {activeOrder && (
                <section
                    className="mb-4 flex flex-wrap items-center gap-4 rounded-2xl border border-brand-200 bg-brand-50 p-4"
                    aria-label="Ongoing delivery"
                >
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand-700 text-xl text-white">
                        <FiTruck />
                    </span>
                    <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700">
                            Ongoing delivery
                        </span>
                        <h2 className="truncate text-base font-bold text-slate-900">
                            {activeOrder.store} · #{activeOrder.orderNo}
                        </h2>
                        <p className="text-xs text-slate-500">
                            {activeOrder.status === "Accepted"
                                ? "Go to the store and pick up the order"
                                : `On the way to ${activeOrder.customer?.name}`} · Finish this delivery to accept new requests.
                        </p>
                    </div>
                    <Link
                        to={`/delivery/${activeOrder.id}`}
                        className="inline-flex items-center gap-2 rounded-xl bg-brand-900 px-5 py-3 text-sm font-semibold text-white! transition hover:bg-brand-700"
                    >
                        View delivery <FiArrowRight />
                    </Link>
                </section>
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
