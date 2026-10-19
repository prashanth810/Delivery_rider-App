import { FiCheck, FiClock, FiMapPin, FiPackage, FiX } from "react-icons/fi";

const formatPayout = (payout) => `₹${payout.toLocaleString("en-IN")}`;

function PickupRequestCard({ order, selected, onSelect, onAccept, onReject }) {
    const actionable = order.status === "New";

    return (
        <article className={`pickup-order-card${selected ? " selected" : ""}`}>
            <button
                type="button"
                className="pickup-order-select"
                onClick={() => onSelect(order.id)}
                aria-pressed={selected}
                aria-label={`View ${order.store} pickup request`}
            >
                <span className="pickup-order-icon"><FiPackage aria-hidden="true" /></span>
                <span className="pickup-order-info">
                    <strong>{order.store}</strong>
                    <small><FiMapPin aria-hidden="true" />{order.area} · {order.distance}</small>
                    <small><FiClock aria-hidden="true" />Ready now · {order.time}</small>
                </span>
                <span className="pickup-order-meta">
                    <strong className="pickup-order-amount">{formatPayout(order.payout)}</strong>
                    <small className={`pickup-order-status ${order.status.toLowerCase()}`}>{order.status}</small>
                </span>
            </button>
            {actionable && (
                <div className="pickup-order-actions" aria-label={`${order.store} request actions`}>
                    <button type="button" className="request-action accept-request" onClick={() => onAccept(order.id)} aria-label={`Accept ${order.store} request`} title="Accept request">
                        <FiCheck aria-hidden="true" />
                    </button>
                    <button type="button" className="request-action reject-request" onClick={() => onReject(order.id)} aria-label={`Reject ${order.store} request`} title="Reject request">
                        <FiX aria-hidden="true" />
                    </button>
                </div>
            )}
        </article>
    );
}

export default function PickupRequestPanel({ orders, selectedOrder, onSelect, onAccept, onReject }) {
    const newRequests = orders.filter((order) => order.status === "New");

    return (
        <aside className="pickup-orders-panel">
            <div className="pickup-panel-heading">
                <div>
                    <span className="eyebrow">NEARBY</span>
                    <h2>Pickup requests</h2>
                    <p>{newRequests.length ? "Latest requests near your route." : "No new requests right now."}</p>
                </div>
                <span className="request-count" aria-label={`${newRequests.length} new requests`}>{newRequests.length}</span>
            </div>
            <div className="pickup-order-list">
                {orders.length ? orders.map((order) => (
                    <PickupRequestCard
                        key={order.id}
                        order={order}
                        selected={selectedOrder?.id === order.id}
                        onSelect={onSelect}
                        onAccept={onAccept}
                        onReject={onReject}
                    />
                )) : <p className="pickup-empty">No pickup requests to show.</p>}
            </div>
            {/* {selectedOrder && (
                <section className="selected-pickup" aria-live="polite" aria-label="Selected pickup request">
                    <div className="selected-pickup-top">
                        <span className="eyebrow">SELECTED REQUEST</span>
                        <span className={`request-status${selectedOrder.status === "Accepted" ? " status-assigned" : ""}${selectedOrder.status === "Rejected" ? " status-rejected" : ""}`}>{selectedOrder.status}</span>
                    </div>
                    <h3>{selectedOrder.store}</h3>
                    <p><FiMapPin aria-hidden="true" /> Pickup · {selectedOrder.area}</p>
                    <div className="pickup-route-info">
                        <span>{selectedOrder.distance}</span><span>·</span><span>Est. {selectedOrder.time}</span>
                        <strong>{formatPayout(selectedOrder.payout)}</strong>
                    </div>
                    {selectedOrder.status === "New" && (
                        <div className="selected-pickup-actions">
                            <button className="primary-button pickup-action" type="button" onClick={() => onAccept(selectedOrder.id)}><FiCheck aria-hidden="true" /> Accept request</button>
                            <button className="secondary-button pickup-reject-action" type="button" onClick={() => onReject(selectedOrder.id)}><FiX aria-hidden="true" /> Reject</button>
                        </div>
                    )}
                </section>
            )} */}
        </aside>
    );
}
