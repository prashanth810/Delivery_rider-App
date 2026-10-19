import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FiChevronDown, FiChevronUp, FiTrendingUp, FiPackage } from "react-icons/fi";
import RiderMap from "../components/RiderMap";
import OrderCard from "../components/OrderCard";
import CancelModal from "../components/CancelModal";
import { acceptOrder, advanceOrder, cancelOrder, DEFAULT_LOCATION } from "../redux/Slices/OrdersSlice";
import { showSuccessToast, showWarningToast } from "../components/Toast";

const TABS = [["new", "New"], ["active", "Active"], ["history", "History"]];
const inTab = (o, tab) =>
    tab === "new" ? o.status === "new"
        : tab === "active" ? ["accepted", "picked"].includes(o.status)
            : ["delivered", "cancelled"].includes(o.status);

const MapHome = () => {
    const dispatch = useDispatch();
    const user = useSelector((s) => s.auth.user);
    const orders = useSelector((s) => s.orders.list);
    const [online, setOnline] = useState(false);
    const [tab, setTab] = useState("new");
    const [open, setOpen] = useState(true);
    const [selectedId, setSelectedId] = useState(null);
    const [cancelling, setCancelling] = useState(null);
    const [rider, setRider] = useState(DEFAULT_LOCATION);
    const [dayStart] = useState(() => new Date().setHours(0, 0, 0, 0));

    // real GPS if allowed, otherwise default Hyderabad location
    useEffect(() => {
        navigator.geolocation?.getCurrentPosition(
            (p) => setRider({ lat: p.coords.latitude, lng: p.coords.longitude }),
            () => { }, { timeout: 6000 },
        );
    }, []);

    const counts = useMemo(() => Object.fromEntries(TABS.map(([k]) => [k, orders.filter((o) => inTab(o, k)).length])), [orders]);
    const list = orders.filter((o) => inTab(o, tab)).filter(() => tab !== "new" || online);
    const selected = orders.find((o) => o.id === selectedId) || null;
    const delivered = orders.filter((o) => o.status === "delivered" && o.at >= dayStart);
    const earnings = delivered.reduce((a, o) => a + o.amount, 0);

    const mapOrders = tab === "history" ? (selected ? [selected] : []) : list;

    const toggleOnline = () => {
        setOnline((v) => !v);
        online ? showWarningToast("You are offline") : showSuccessToast("You are online – new orders nearby!");
    };
    const switchTab = (t) => { setTab(t); setSelectedId(null); };
    const accept = (o) => { dispatch(acceptOrder(o.id)); setTab("active"); setSelectedId(o.id); showSuccessToast(`Order #${o.id} accepted – head to ${o.store}`); };
    const advance = (o) => {
        dispatch(advanceOrder(o.id));
        if (o.status === "picked") { showSuccessToast(`Delivered! ₹${o.amount} added to earnings`); setSelectedId(null); setTab("history"); }
        else showSuccessToast("Picked up – deliver to the customer");
    };
    const confirmCancel = (reason) => {
        dispatch(cancelOrder({ id: cancelling.id, reason }));
        showWarningToast(`Order #${cancelling.id} cancelled`);
        if (selectedId === cancelling.id) setSelectedId(null);
        setCancelling(null);
    };

    return (
        <div className="relative h-[calc(100dvh-57px)] overflow-hidden bg-slate-200">
            <RiderMap rider={rider} orders={mapOrders} selected={selected} onSelect={setSelectedId} />

            {/* top overlay */}
            <div className="pointer-events-none absolute inset-x-0 top-0 z-[1000] flex flex-wrap items-start justify-between gap-3 p-4">
                <button onClick={toggleOnline}
                    className={`pointer-events-auto flex items-center gap-2.5 rounded-full px-5 py-2.5 text-sm font-bold shadow-lg transition ${online ? "bg-brand-600 text-white" : "bg-white text-slate-700"}`}>
                    <span className={`h-2.5 w-2.5 rounded-full ${online ? "animate-pulse bg-emerald-300" : "bg-slate-400"}`} />
                    {online ? "Online" : "Go Online"}
                </button>
                <div className="pointer-events-auto flex gap-2">
                    <span className="flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-lg"><FiTrendingUp className="text-brand-600" /> ₹{earnings} today</span>
                    <span className="flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-lg"><FiPackage className="text-brand-600" /> {delivered.length} done</span>
                </div>
            </div>

            {/* bottom sheet */}
            <div className="absolute inset-x-0 bottom-0 z-[1000] mx-auto w-full max-w-5xl rounded-t-3xl bg-slate-50 shadow-[0_-10px_40px_rgba(15,23,42,.18)]">
                <button onClick={() => setOpen((v) => !v)} className="flex w-full flex-col items-center pt-2.5 text-slate-400" aria-label="Toggle orders panel">
                    <span className="h-1.5 w-12 rounded-full bg-slate-300" />
                    {open ? <FiChevronDown className="mt-0.5" /> : <FiChevronUp className="mt-0.5" />}
                </button>

                <div className="flex items-center justify-between gap-3 px-4 pb-3">
                    <p className="hidden text-sm text-slate-500 sm:block">Hi <b className="text-slate-800">{user?.fullName?.split(" ")[0]}</b>, your orders</p>
                    <div className="flex w-full rounded-xl bg-slate-200/70 p-1 sm:w-auto">
                        {TABS.map(([k, label]) => (
                            <button key={k} onClick={() => switchTab(k)}
                                className={`flex-1 rounded-lg px-4 py-2 text-sm font-bold transition sm:flex-none ${tab === k ? "bg-white text-brand-700 shadow" : "text-slate-500"}`}>
                                {label}{k !== "history" && counts[k] > 0 ? <span className="ml-1.5 rounded-full bg-brand-600 px-1.5 py-0.5 text-[10px] text-white">{k === "new" && !online ? 0 : counts[k]}</span> : null}
                            </button>
                        ))}
                    </div>
                </div>

                {open && (
                    <div className="scrollbar max-h-[42vh] overflow-y-auto px-4 pb-5">
                        {list.length === 0 ? (
                            <div className="py-10 text-center text-sm text-slate-400">
                                {tab === "new" && !online ? "You're offline. Tap “Go Online” to receive orders."
                                    : tab === "new" ? "No new orders right now. Hang tight!"
                                        : tab === "active" ? "No active deliveries. Accept an order to start."
                                            : "No order history yet."}
                            </div>
                        ) : (
                            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                {list.map((o) => (
                                    <OrderCard key={o.id} order={o} selected={o.id === selectedId}
                                        onSelect={(id) => setSelectedId(id === selectedId ? null : id)}
                                        onAccept={accept} onCancel={setCancelling} onAdvance={advance} />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {cancelling && <CancelModal order={cancelling} onClose={() => setCancelling(null)} onConfirm={confirmCancel} />}
        </div>
    );
};
export default MapHome;