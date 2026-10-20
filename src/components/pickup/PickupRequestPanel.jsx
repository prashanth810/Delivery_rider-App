import { Link } from "react-router-dom";
import { FiArrowRight, FiCheck, FiClock, FiMapPin, FiPackage, FiRefreshCw, FiX } from "react-icons/fi";

const formatAmount = (amount = 0) => `₹${Number(amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatCreatedAt = (createdAt) => {
    const date = new Date(createdAt);
    return Number.isNaN(date.getTime()) ? "Time unavailable" : date.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
};

function PickupRequestCard({ order, selected, canAct, isActive, accepting, onSelect, onAccept, onReject }) {
    const id = order._id;
    const store = order.pickupAddress || "Pickup location unavailable";
    const area = [order.dropArea?.city, order.dropArea?.pincode, order.dropArea?.landmark].filter(Boolean).join(", ");
    const itemsSummary = order.items?.map((item) => `${item.name}${item.weight ? ` (${item.weight})` : ""}${item.quantity > 1 ? ` × ${item.quantity}` : ""}`).join(", ");
    const image = order.items?.find((item) => item.image)?.image;

    // The available-orders API does not return a status field.
    const status = order.status || "New";
    const actionable = (status === "New" || status === "PENDING") && canAct;

    return (
        <article className={`pickup-order-card${selected ? " selected" : ""}`}>
            <button
                type="button"
                className="pickup-order-select"
                onClick={() => onSelect(id)}
                aria-pressed={selected}
                aria-label={`View ${store} delivery request`}
            >
                <span className="pickup-order-icon">
                    {image ? (
                        <img src={image} alt={order.items?.[0]?.name || "Delivery item"} />
                    ) : (
                        <FiPackage aria-hidden="true" />
                    )}
                </span>

                <span className="pickup-order-info">
                    <strong>{itemsSummary || store}</strong>
                    <small>{store}</small>
                    <small>
                        <FiMapPin aria-hidden="true" />
                        Drop · {area || "Delivery area unavailable"}
                    </small>
                    <small>
                        <FiClock aria-hidden="true" />
                        Received {formatCreatedAt(order.createdAt)}
                    </small>
                </span>

                <span className="pickup-order-meta">
                    <strong className="pickup-order-amount">
                        {order.paymentMethod === "ONLINE" ? "Paid online" : `Collect ${formatAmount(order.amountToCollect)} `}
                    </strong>
                    <small className={`pickup-order-status ${status.toLowerCase()}`}>{status}</small>
                </span>
            </button>

            {isActive && (
                <Link to={`/delivery/${id}`} className="inline-flex items-center gap-1.5 rounded-lg bg-brand-900 px-3 py-2.5 text-[11px] font-semibold text-white! transition hover:bg-brand-700">
                    View delivery <FiArrowRight aria-hidden="true" />
                </Link>
            )}

            {actionable && (
                <div className="pickup-order-actions" aria-label={`${store} request actions`}>
                    <button
                        type="button"
                        className="request-action accept-request"
                        onClick={() => onAccept(id)}
                        disabled={accepting}
                        aria-label={accepting ? `Accepting ${store} request` : `Accept ${store} request`}
                        title={accepting ? "Accepting request" : "Accept request"}
                    >
                        {accepting ? <FiRefreshCw className="animate-spin" aria-hidden="true" /> : <FiCheck aria-hidden="true" />}
                    </button>
                    <button
                        type="button"
                        className="request-action reject-request"
                        onClick={() => onReject(id)}
                        aria-label={`Reject ${store} request`}
                        title="Reject request"
                    >
                        <FiX aria-hidden="true" />
                    </button>
                </div>
            )}
        </article>
    );
}

export default function PickupRequestPanel({ orders, selectedOrder, onSelect, onAccept, onReject, online = true, activeOrder = null, onGoOnline, loading = false, error = null, onRetry, acceptLoading = false }) {
    const newRequests = orders.filter((order) => !order.status || order.status === "New" || order.status === "PENDING");
    const canAct = online && !activeOrder;

    return (
        <aside className="pickup-orders-panel">
            <div className="pickup-panel-heading">
                <div>
                    <span className="eyebrow">NEARBY</span>
                    <h2>Available Deliveries</h2>
                    <p>{newRequests.length ? "Latest requests near your route." : "No new requests right now."}</p>
                </div>
                <span className="request-count" aria-label={`${newRequests.length} new requests`}>{newRequests.length}</span>
            </div>

            {!online && (
                <div className="mb-3 flex flex-wrap items-center gap-3 rounded-xl border border-orange-200 bg-orange-50 px-3 py-2.5 text-xs text-orange-800">
                    <span className="min-w-0 flex-1"><strong>You&apos;re offline.</strong> Go online to accept pickup requests.</span>
                    {onGoOnline && <button type="button" onClick={onGoOnline} className="rounded-lg bg-brand-900 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-brand-700">Go online</button>}
                </div>
            )}

            {online && activeOrder && (
                <div className="mb-3 rounded-xl border border-brand-200 bg-brand-50 px-3 py-2.5 text-xs text-brand-900">
                    <strong>Delivery in progress.</strong> Complete it to accept the next request.
                </div>
            )}

            <div className="pickup-order-list">
                {loading ? <p className="pickup-empty" role="status">Loading available orders…</p>
                    : error ? <div className="pickup-empty" role="alert"><p>{error}</p><button type="button" onClick={onRetry} className="small-primary">Try again</button></div>
                        : orders.length ? orders.map((order) => (
                            <PickupRequestCard
                                key={order._id}
                                order={order}
                                selected={selectedOrder?._id === order._id || selectedOrder?.id === order._id}
                                canAct={canAct}
                                isActive={activeOrder?._id === order._id || activeOrder?.id === order._id}
                                accepting={acceptLoading}
                                onSelect={onSelect}
                                onAccept={onAccept}
                                onReject={onReject}
                            />
                        )) : <p className="pickup-empty">No available delivery requests right now.</p>}
            </div>
        </aside>
    );
}
