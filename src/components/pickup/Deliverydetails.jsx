import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Link, Navigate, useParams } from "react-router-dom";
import {
    FiAlertCircle,
    FiCheck,
    FiCheckCircle,
    FiChevronRight,
    FiClock,
    FiCopy,
    FiFlag,
    FiHome,
    FiInfo,
    FiLock,
    FiMapPin,
    FiMessageSquare,
    FiNavigation,
    FiPackage,
    FiPhone,
    FiRefreshCw,
    FiShoppingBag,
    FiUser,
} from "react-icons/fi";
import DeliveryMap from "./DeliveryMap";
import { RIDER_LOCATION } from "../pickup/demoOrders";
import { haversineKm, isApproximate, formatAccuracy, useAddressOf, useResolvedPoint, useRiderLocation } from "../../hooks/Useriderlocation";

const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;
// 477 min -> "7 h 57 min", 45 min -> "45 min", 120 min -> "2 h"
const formatDuration = (totalMinutes) => {
    const total = Math.max(1, Math.round(totalMinutes));
    if (total < 60) return `${total} min`;
    const hours = Math.floor(total / 60);
    const minutes = total % 60;
    return minutes ? `${hours} h ${minutes} min` : `${hours} h`;
};
// "+91 98765 43210" -> "+91 ••••• •••10" (riders never see the full number)
const maskPhone = (phone = "") => {
    const match = phone.match(/^(\+\d{1,3})\s*(.*)$/);
    const prefix = match ? `${match[1]} ` : "";
    const rest = match ? match[2] : phone;
    const total = (rest.match(/\d/g) || []).length;
    let seen = 0;
    return prefix + rest.replace(/\d/g, (digit) => (++seen > total - 2 ? digit : "•"));
};
// Opens the phone dialer without putting the number in a visible link.
const callNumber = (phone) => { window.location.href = `tel:${phone.replace(/[^\d+]/g, "")}`; };

// ---------- API response -> order shape used by this page ----------
const API_STATUS = {
    ACCEPTED: "Accepted",
    PICKED_UP: "Picked up",
    PICKEDUP: "Picked up",
    DELIVERED: "Delivered",
};

const formatTime = (iso) => {
    if (!iso) return "";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
};

const mapDelivery = (delivery) => {
    if (!delivery) return null;
    const data = delivery.data?.data || delivery.data || delivery.delivery || delivery.order || delivery;
    const address = data.address || data.dropArea || {};
    const items = Array.isArray(data.items) ? data.items : [];
    const statusKey = String(data.status || "").toUpperCase().replace(/[\s-]+/g, "_");
    const orderId = String(data.orderId || data._id || "");
    const streetAddress = [address.building_number, address.street].filter(Boolean).join(", ");

    return {
        id: data._id,
        orderId: data.orderId,
        status: API_STATUS[statusKey] || "Accepted",
        store: data.storeName || "Store pickup",
        orderNo: orderId.slice(-6).toUpperCase(),
        customer: {
            name: data.customerName || address.full_name || "",
            phone: String(data.customerPhone || address.phone || ""),
        },
        storePhone: data.storePhone || "",
        pickupAddress: data.pickupAddress || "",
        pickupLine2: "",
        pickup: data.pickup,
        dropAddress: streetAddress || address.city || "",
        dropLine2: [address.city, address.state, address.pincode].filter(Boolean).join(", "),
        drop: data.drop,
        notes: address.landmark ? `Landmark: ${address.landmark}` : "",
        addressType: address.address_type,
        items: items.map((item) => ({
            name: item.name,
            qty: item.quantity ?? 1,
            note: item.weight || "",
            image: item.image,
        })),
        paymentMethod: data.paymentMethod,
        amountToCollect: Number(data.amountToCollect) || 0,
        payout: Number.isFinite(data.payout) ? data.payout : undefined,
        acceptedAt: formatTime(data.acceptedAt),
        pickedAt: formatTime(data.pickedUpAt),
        deliveredAt: formatTime(data.deliveredAt),
        deliveryOtp: data.deliveryOtp || "",
    };
};

// Copies the complete address, including the second address line/postal code.
function CopyAddressButton({ address }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        if (!address?.trim()) return;

        try {
            await navigator.clipboard.writeText(address.trim());
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1600);
        } catch (error) {
            // Clipboard API requires HTTPS or localhost in most browsers.
            console.error("Unable to copy address:", error);
        }
    };

    return (
        <button
            type="button"
            onClick={handleCopy}
            disabled={!address?.trim()}
            title={copied ? "Address copied" : "Copy full address"}
            aria-label={copied ? "Address copied" : "Copy full address"}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
            {copied ? <FiCheck className="text-brand-700" /> : <FiCopy />}
        </button>
    );
}

// There is no backend yet, so the customer's OTP is shown to the tester below the OTP boxes.
// Set VITE_SHOW_DEMO_OTP=false in .env to hide it (or remove it when a real OTP API is connected).
const SHOW_DEMO_OTP = import.meta.env.VITE_SHOW_DEMO_OTP !== "false";
const OTP_LENGTH = 4;

const STEPS = [
    { key: "accepted", label: "Order accepted", icon: FiCheck },
    { key: "pickup", label: "Go to pickup", icon: FiMapPin },
    { key: "picked", label: "Picked up", icon: FiPackage },
    { key: "delivered", label: "Delivered", icon: FiFlag },
];

// Which step is "current" for each order status.
const CURRENT_STEP = { Accepted: 1, "Picked up": 3, Delivered: 4 };

function stepSubtitle(index, order, state) {
    if (index === 0) return order.acceptedAt || "Done";
    if (index === 1) return state === "done" ? "Completed" : "In progress";
    if (index === 2) return state === "done" ? order.pickedAt || "Done" : "Awaiting confirmation";
    if (state === "done") return order.deliveredAt || "Done";
    return state === "current" ? "In progress" : "Complete order";
}

function Stepper({ order }) {
    const current = CURRENT_STEP[order.status] ?? 1;

    return (
        <ol className="grid grid-cols-4 gap-1 sm:gap-2" aria-label="Delivery progress">
            {STEPS.map(({ key, label, icon: Icon }, index) => {
                const state = index < current ? "done" : index === current ? "current" : "todo";

                return (
                    <li key={key} className="relative flex min-w-0 flex-col items-center text-center">
                        {index > 0 && (
                            <span
                                aria-hidden="true"
                                className={`absolute right-1/2 top-4 h-0.5 w-full -translate-y-1/2 ${index <= current ? "bg-brand-700" : "bg-slate-200"}`}
                            />
                        )}

                        <span
                            className={`relative z-10 grid h-8 w-8 place-items-center rounded-full border-2 text-sm transition-colors sm:h-8 sm:w-8 ${state === "todo"
                                ? "border-slate-200 bg-white text-slate-400"
                                : "border-brand-700 bg-brand-700 text-white"
                                } ${state === "current" ? "ring-2 ring-brand-100" : ""}`}
                        >
                            {state === "done" ? <FiCheck aria-hidden="true" /> : <Icon aria-hidden="true" />}
                        </span>

                        <strong
                            className={`mt-1.5 text-[10px] font-bold leading-tight sm:text-[11px] ${state === "todo" ? "text-slate-500" : "text-slate-900"
                                }`}
                        >
                            {label}
                        </strong>

                        <small
                            className={`mt-0.5 max-w-full text-[9px] leading-tight sm:text-[10px] ${state === "current"
                                ? "font-semibold text-brand-700"
                                : "text-slate-400"
                                }`}
                        >
                            {stepSubtitle(index, order, state)}
                        </small>
                    </li>
                );
            })}
        </ol>
    );
}

function LocationChip({ status, accuracy, onRetry }) {
    const approximate = status === "live" && isApproximate(accuracy);
    const map = {
        live: approximate
            ? { cls: "bg-orange-50 text-orange-800", dot: "bg-orange-500", text: `Approximate location (${formatAccuracy(accuracy)}) – use a phone with GPS for exact position` }
            : { cls: "bg-brand-50 text-brand-700", dot: "bg-brand-500", text: `Live location on · ${formatAccuracy(accuracy)}` },
        locating: { cls: "bg-slate-100 text-slate-600", dot: "bg-slate-400 animate-pulse", text: "Finding your location…" },
        denied: { cls: "bg-orange-50 text-orange-800", dot: "bg-orange-500", text: "Location blocked – showing a sample location" },
        unavailable: { cls: "bg-orange-50 text-orange-800", dot: "bg-orange-500", text: "Can't get your location – showing a sample location" },
        unsupported: { cls: "bg-orange-50 text-orange-800", dot: "bg-orange-500", text: "Location not supported – showing a sample location" },
    }[status];
    return (
        <span className={`inline-flex flex-wrap items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold ${map.cls}`}>
            <span className={`h-2 w-2 rounded-full ${map.dot}`} />
            {map.text}
            {(status === "denied" || status === "unavailable" || approximate) && (
                <button type="button" onClick={onRetry} className="inline-flex items-center gap-1 underline"><FiRefreshCw /> {approximate ? "Refresh location" : "Try again"}</button>
            )}
        </span>
    );
}

// Rider asks the customer for the OTP and types it here. Delivery is only completed when it matches.
function OtpEntry({ customerName, demoOtp, onVerify, onResend }) {
    const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(""));
    const [error, setError] = useState("");
    const [resent, setResent] = useState(false);
    const refs = useRef([]);
    const otp = digits.join("");

    const reset = () => { setDigits(Array(OTP_LENGTH).fill("")); refs.current[0]?.focus(); };
    const change = (index, event) => {
        const value = event.target.value.replace(/\D/g, "").slice(-1);
        setError("");
        setResent(false);
        setDigits((current) => current.map((digit, i) => (i === index ? value : digit)));
        if (value && index < OTP_LENGTH - 1) refs.current[index + 1]?.focus();
    };
    const keyDown = (index, event) => {
        if (event.key === "Backspace" && !digits[index] && index > 0) refs.current[index - 1]?.focus();
        if (event.key === "Enter") submit();
    };
    const paste = (event) => {
        const text = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
        if (!text) return;
        event.preventDefault();
        setDigits(Array.from({ length: OTP_LENGTH }, (_, i) => text[i] || ""));
        refs.current[Math.min(text.length, OTP_LENGTH - 1)]?.focus();
    };
    const submit = () => {
        if (otp.length < OTP_LENGTH) { setError(`Enter the ${OTP_LENGTH}-digit OTP from the customer`); return; }
        if (!onVerify(otp)) {
            setError("Incorrect OTP. Ask the customer to check the code sent to their phone.");
            reset();
        }
    };
    const resend = () => { onResend(); reset(); setError(""); setResent(true); };

    return (
        <div className="mt-3 rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900"><FiLock className="text-brand-700" /> Customer delivery OTP</div>
            <p className="mt-1 text-xs text-slate-500">Ask {customerName} for the {OTP_LENGTH}-digit OTP sent to their phone, then enter it to complete the delivery.</p>
            <div className="mt-3 flex justify-center gap-3" onPaste={paste}>
                {digits.map((digit, index) => (
                    <input
                        key={index}
                        ref={(element) => { refs.current[index] = element; }}
                        value={digit}
                        onChange={(event) => change(index, event)}
                        onKeyDown={(event) => keyDown(index, event)}
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={1}
                        aria-label={`OTP digit ${index + 1}`}
                        className={`h-12 w-12 rounded-xl border-2 text-center text-xl font-bold text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100 ${error ? "border-red-300" : "border-slate-200"}`}
                    />
                ))}
            </div>
            {error && <p className="mt-2 text-center text-xs font-medium text-red-600" role="alert">{error}</p>}
            {resent && !error && <p className="mt-2 text-center text-xs font-medium text-brand-700">A new OTP has been sent to the customer.</p>}
            {SHOW_DEMO_OTP && demoOtp && (
                <p className="mt-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-center text-[11px] text-slate-500">
                    Demo only – the customer&apos;s OTP is <strong className="tracking-widest text-slate-800">{demoOtp}</strong>
                </p>
            )}
            <button type="button" onClick={submit} disabled={otp.length < OTP_LENGTH} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-900 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50">
                <FiCheckCircle /> Verify OTP &amp; confirm delivery
            </button>
            <button type="button" onClick={resend} className="mx-auto mt-2 flex items-center gap-1.5 text-xs font-semibold text-brand-700 hover:underline"><FiRefreshCw /> Resend OTP to customer</button>
        </div>
    );
}

function Bar({ className = "" }) {
    return <div className={`animate-pulse rounded-md bg-slate-200 ${className}`} />;
}

// Shown for a moment while the delivery page loads its details and map.
function DeliverySkeleton() {
    return (
        <div className="space-y-6" role="status" aria-busy="true" aria-label="Loading delivery details">
            <section>
                <div className="flex items-center gap-3"><Bar className="h-9 w-64" /><Bar className="h-6 w-40 rounded-full" /></div>
                <Bar className="mt-3 h-4 w-96 max-w-full" />
            </section>
            <section className="rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-sm sm:px-6">
                <div className="grid grid-cols-4">
                    {[0, 1, 2, 3].map((i) => (
                        <div key={i} className="flex flex-col items-center gap-1.5"><div className="h-9 w-9 animate-pulse rounded-full bg-slate-200" /><Bar className="h-3 w-24" /><Bar className="h-2.5 w-16" /></div>
                    ))}
                </div>
            </section>
            <div className="grid items-stretch gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
                <section className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center justify-between gap-4"><div className="space-y-2"><Bar className="h-5 w-40" /><Bar className="h-3.5 w-64" /></div><div className="flex gap-6"><Bar className="h-9 w-20" /><Bar className="h-9 w-24" /></div></div>
                    <Bar className="mb-3 h-6 w-44 rounded-full" />
                    <Bar className="mb-3 h-14 w-full rounded-xl" />
                    <div className="relative grid min-h-[460px] flex-1 place-items-center rounded-xl bg-slate-100">
                        <div className="flex flex-col items-center gap-3 text-sm text-slate-400"><span className="h-9 w-9 animate-spin rounded-full border-[3px] border-slate-300 border-t-brand-700" />Loading map &amp; route…</div>
                    </div>
                </section>
                <div className="space-y-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-center gap-3"><div className="h-11 w-11 animate-pulse rounded-xl bg-slate-200" /><div className="flex-1 space-y-2"><Bar className="h-4 w-32" /><Bar className="h-3 w-24" /></div><Bar className="h-6 w-14" /></div><div className="mt-4 space-y-3"><Bar className="h-4 w-full" /><Bar className="h-4 w-2/3" /></div></div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-center gap-3"><div className="h-10 w-10 animate-pulse rounded-full bg-slate-200" /><div className="flex-1 space-y-2"><Bar className="h-4 w-28" /><Bar className="h-3 w-20" /></div><Bar className="h-9 w-28 rounded-lg" /></div><div className="mt-4 space-y-3"><Bar className="h-4 w-full" /><Bar className="h-4 w-1/2" /></div></div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><Bar className="h-4 w-36" /><Bar className="mt-3 h-14 w-full rounded-xl" /><Bar className="mt-3 h-12 w-full rounded-xl" /></div>
                </div>
            </div>
        </div>
    );
}

export default function DeliveryDetails({ orders = [], onConfirmPickup, onConfirmDelivery, onResendOtp }) {
    const { id } = useParams();

    // Accepted delivery returned by the accept API (stored in redux)
    const acceptedDelivery = useSelector((state) => state.orders.accpetbooking.acceptdata);
    const apiOrder = useMemo(() => {
        const data = acceptedDelivery?.data?.data
            || acceptedDelivery?.data
            || acceptedDelivery?.delivery
            || acceptedDelivery?.order
            || acceptedDelivery;
        if (!data || ![data._id, data.orderId].includes(id)) return null;
        return mapDelivery(acceptedDelivery);
    }, [acceptedDelivery, id]);

    // API data first, then fall back to the orders passed in as a prop
    const order = apiOrder || orders.find((item) => item.id === id);

    const [routeInfo, setRouteInfo] = useState(null);
    const [ready, setReady] = useState(false);

    // Brief loading state when the page opens (location, address and map start loading underneath).
    useEffect(() => {
        const timer = setTimeout(() => setReady(true), 1200);
        return () => clearTimeout(timer);
    }, []);

    // Rider's live GPS location + readable address
    const { position, accuracy, status: locationStatus, retry } = useRiderLocation();
    const riderPoint = position || RIDER_LOCATION;
    const live = locationStatus === "live";
    const riderAddress = useAddressOf(live ? position : null);

    const toPickup = order?.status === "Accepted";
    const customerName = order?.customer?.name || "Customer details unavailable";
    const customerPhone = order?.customer?.phone || "";
    const storePhone = order?.storePhone || "";
    // Before pickup: rider -> store address. After pickup: rider -> customer address.
    const destAddress = toPickup
        ? order?.pickupAddress
        : [order?.dropAddress, order?.dropLine2].filter(Boolean).join(", ");
    const destPoint = useResolvedPoint(
        toPickup ? order?.pickup : order?.drop,
        destAddress,
    );

    if (!order || !["Accepted", "Picked up", "Delivered"].includes(order.status)) {
        return <Navigate to="/home" replace />;
    }

    if (!ready) return <DeliverySkeleton />;

    const delivered = order.status === "Delivered";
    const items = order.items || [];
    const displayedDestAddress = destAddress || (toPickup ? "Pickup address unavailable" : "Delivery area unavailable");
    const collectionLabel = order.paymentMethod === "ONLINE"
        ? "Paid online"
        : `Collect ${money(order.amountToCollect)}`;

    // Distance / ETA from the rider's live location (road route when available, otherwise estimated)
    const toKey = destPoint ? `${destPoint.lat.toFixed(5)},${destPoint.lng.toFixed(5)}` : "";
    const roadInfo = routeInfo && routeInfo.toKey === toKey ? routeInfo : null;
    const estKm = destPoint ? haversineKm(riderPoint, destPoint) * 1.3 : 0;
    const km = roadInfo ? roadInfo.km : estKm;
    const minutes = roadInfo ? roadInfo.min : Math.max(1, Math.round((estKm / 25) * 60));

    const pill = toPickup
        ? { text: "Accepted - pickup pending", cls: "bg-brand-100 text-brand-700" }
        : delivered
            ? { text: "Delivered", cls: "bg-brand-100 text-brand-700" }
            : { text: "Picked up - on the way", cls: "bg-orange-100 text-orange-700" };
    const intro = toPickup
        ? "Head to the store to pick up the order. Confirm pickup after collecting the package."
        : delivered
            ? "Great job! This order has been delivered to the customer."
            : "Head to the customer's location and hand over the package. Take the OTP from the customer to complete the delivery.";

    return (
        <div className="space-y-6">
            <section>
                <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Delivery details</h1>
                    <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase ${pill.cls}`}>{pill.text}</span>
                </div>
                <p className="mt-1.5 text-sm text-slate-500">{intro}</p>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white px-2.5 py-2.5 shadow-sm sm:px-5 sm:py-3">
                <Stepper order={order} />
            </section>

            <div className="grid items-stretch gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
                {/* Left: route + map */}
                <section className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <span className="mt-0.5 text-2xl text-brand-700">{toPickup ? <FiMapPin /> : <FiHome />}</span>
                            <div>
                                <h2 className="text-base font-bold text-slate-900">{toPickup ? "Route to pickup" : delivered ? "Delivery completed" : "Route to customer"}</h2>
                                <p className="text-sm text-slate-500">{toPickup ? `Pickup address: ${displayedDestAddress}.` : delivered ? `Delivery completed for ${customerName}.` : `Deliver the order to ${customerName}.`}</p>
                            </div>
                        </div>
                        {!delivered && destPoint && (
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2.5">
                                    <FiNavigation className="text-xl text-slate-600" />
                                    <div><strong className="block text-sm text-slate-900">{km.toFixed(1)} km</strong><small className="text-xs text-slate-400">{toPickup ? "to pickup" : "to customer"}</small></div>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <FiClock className="text-xl text-slate-600" />
                                    <div><strong className="block text-sm text-slate-900">{formatDuration(minutes)}</strong><small className="text-xs text-slate-400">estimated arrival</small></div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mb-3 space-y-2">
                        <LocationChip status={locationStatus} accuracy={accuracy} onRetry={retry} />
                        {!delivered && (
                            <div className="grid gap-2 rounded-xl bg-slate-50 p-3 text-xs sm:grid-cols-2">
                                <div className="flex gap-2"><span className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-600" /><div><small className="block text-slate-400">Your location</small><strong className="text-slate-800">{live ? riderAddress || "Locating address…" : "Sample location – Hitech City, Hyderabad"}</strong></div></div>
                                <div className="flex gap-2"><span className={`mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ${toPickup ? "bg-brand-700" : "bg-orange-500"}`} /><div><small className="block text-slate-400">{toPickup ? "Pickup address" : "Delivery address"}</small><strong className="text-slate-800">{displayedDestAddress}</strong></div></div>
                            </div>
                        )}
                    </div>

                    {/* Map grows to fill the card, so left and right columns end at the same height */}
                    <div className="relative min-h-[460px] flex-1 [&>div]:absolute! [&>div]:inset-0 [&>div]:h-full!">
                        {destPoint ? (
                            <DeliveryMap
                                from={riderPoint}
                                to={destPoint}
                                destination={toPickup ? "store" : "customer"}
                                storeName={order.store}
                                live={live}
                                accuracy={accuracy}
                                onRoute={setRouteInfo}
                            />
                        ) : (
                            <div className="absolute inset-0 grid place-items-center rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-500">{destAddress ? "Finding the address on the map…" : "Location details are not available for this stop."}</div>
                        )}
                    </div>
                </section>

                {/* Right: details */}
                <div className="space-y-4">
                    {/* Store */}
                    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex items-center gap-3 bg-brand-50 px-4 py-3">
                            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-100 text-xl text-brand-700"><FiShoppingBag /></span>
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <strong className="truncate text-base text-slate-900">{order.store}</strong>
                                    <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-semibold text-orange-700">{delivered ? "Completed" : toPickup ? "New delivery" : "In transit"}</span>
                                </div>
                                <small className="text-xs text-slate-500">Order #{order.orderNo}</small>
                            </div>
                            <div className="text-right">{Number.isFinite(order.payout) ? <><strong className="block text-lg text-slate-900">{money(order.payout)}</strong><small className="text-[11px] text-slate-400">Rider earning</small></> : <><strong className="block text-sm text-slate-900">{collectionLabel}</strong><small className="text-[11px] text-slate-400">{order.paymentMethod === "COD" ? "Cash on delivery" : "Customer payment"}</small></>}</div>
                            <FiChevronRight className="text-slate-400" />
                        </div>
                        <div className="space-y-3 px-4 py-3">
                            <div className="flex items-start gap-3">
                                <FiMapPin className="mt-0.5 shrink-0 text-slate-500" />
                                <div className="min-w-0 flex-1">
                                    <small className="block text-xs text-slate-400">Pickup address</small>
                                    <strong className="block break-words text-sm text-slate-900">{order.pickupAddress || "Pickup address unavailable"}</strong>
                                    {order.pickupLine2 && <small className="block break-words text-xs text-slate-400">{order.pickupLine2}</small>}
                                </div>
                                <CopyAddressButton address={[order.pickupAddress, order.pickupLine2].filter(Boolean).join(", ")} />
                            </div>
                            {!delivered && storePhone && (
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex gap-3">
                                        <FiPhone className="mt-0.5 shrink-0 text-slate-500" />
                                        <div><small className="block text-xs text-slate-400">Store contact</small><strong className="text-sm text-slate-900">{maskPhone(storePhone)}</strong></div>
                                    </div>
                                    <button type="button" onClick={() => callNumber(storePhone)} className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-brand-200 px-3 py-2 text-xs font-semibold text-brand-700 hover:bg-brand-50"><FiPhone /> Call store</button>
                                </div>
                            )}
                        </div>
                    </article>

                    {/* Customer */}
                    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-blue-50 text-lg text-blue-600"><FiUser /></span>
                                <div><small className="block text-xs text-slate-500">Customer details</small><strong className="block text-sm text-slate-900">{customerName}</strong>{!delivered && customerPhone && <small className="text-xs text-slate-500">{maskPhone(customerPhone)}</small>}</div>
                            </div>
                            {!delivered && customerPhone && (
                                <button type="button" onClick={() => callNumber(customerPhone)} className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-brand-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-brand-700"><FiPhone /> Call customer</button>
                            )}
                        </div>
                        <div className="mt-3 space-y-3 pl-1">
                            <div className="flex items-start gap-3">
                                <FiMapPin className="mt-0.5 shrink-0 text-slate-500" />
                                <div className="min-w-0 flex-1">
                                    <small className="block text-xs text-slate-400">Delivery address{order.addressType ? ` (${order.addressType})` : ""}</small>
                                    <strong className="block break-words text-sm text-slate-900">{order.dropAddress}</strong>
                                    {order.dropLine2 && <small className="block break-words text-xs text-slate-400">{order.dropLine2}</small>}
                                </div>
                                <CopyAddressButton address={[order.dropAddress, order.dropLine2].filter(Boolean).join(", ")} />
                            </div>
                            <div className="flex gap-3">
                                <FiMessageSquare className="mt-0.5 shrink-0 text-slate-500" />
                                <div><small className="block text-xs text-slate-400">Delivery notes</small><strong className="text-sm text-slate-900">{order.notes || "No delivery notes"}</strong></div>
                            </div>
                        </div>
                    </article>

                    {/* Items + actions */}
                    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                            <span className="grid h-6 w-6 place-items-center rounded-md bg-orange-100 text-xs text-orange-600"><FiPackage /></span>
                            {toPickup ? "Items to collect" : "Items to deliver"} <span className="font-normal text-slate-500">({items.length} item{items.length !== 1 ? "s" : ""})</span>
                        </h3>
                        <ul className="mt-3 space-y-2">
                            {items.map((item, index) => (
                                <li key={`${item.name}-${index}`} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-2">
                                    {item.image ? (
                                        <img src={item.image} alt={item.name} className="h-11 w-11 shrink-0 rounded-lg object-cover" loading="lazy" />
                                    ) : (
                                        <span className="grid h-11 w-11 place-items-center rounded-lg bg-orange-100 text-xl text-orange-600"><FiShoppingBag /></span>
                                    )}
                                    <div><strong className="text-sm text-slate-900">{item.name} <span className="font-medium">× {item.qty}</span></strong><small className="block text-xs text-slate-500">{item.note}</small></div>
                                </li>
                            ))}
                        </ul>

                        {toPickup && (
                            <>
                                <div className="mt-3 flex items-center gap-2 rounded-lg bg-orange-50 px-3 py-2 text-xs font-medium text-orange-800">
                                    <FiAlertCircle className="shrink-0" /> Confirm the package with the store before leaving.
                                </div>
                                <button type="button" onClick={() => onConfirmPickup?.(order.id)} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-900 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-700"><FiCheck /> Confirm pickup</button>
                                <p className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-slate-500"><FiInfo /> After pickup, the route switches to the customer&apos;s address.</p>
                            </>
                        )}

                        {order.status === "Picked up" && (
                            <OtpEntry
                                customerName={customerName}
                                demoOtp={order.deliveryOtp}
                                onVerify={(otp) => onConfirmDelivery?.(order.id, otp)}
                                onResend={() => onResendOtp?.(order.id)}
                            />
                        )}

                        {delivered && (
                            <div className="mt-3 rounded-xl bg-brand-50 p-4 text-center">
                                <FiCheckCircle className="mx-auto text-3xl text-brand-700" />
                                <strong className="mt-1 block text-sm text-brand-900">Delivered successfully</strong>
                                <small className="text-xs text-slate-600">{Number.isFinite(order.payout) ? `OTP verified · ${money(order.payout)} added to your earnings` : `Payment status: ${collectionLabel}`}{order.deliveredAt ? ` · ${order.deliveredAt}` : ""}</small>
                                <div className="mt-3 flex gap-2">
                                    <Link to="/home" className="flex-1 rounded-lg bg-brand-900 py-2.5 text-center text-xs font-semibold text-white! hover:bg-brand-700">Find new rides</Link>
                                    <Link to="/orders" className="flex-1 rounded-lg border border-brand-200 bg-white py-2.5 text-center text-xs font-semibold text-brand-700! hover:bg-brand-50">My deliveries</Link>
                                </div>
                            </div>
                        )}
                    </article>
                </div>
            </div>
        </div>
    );
}