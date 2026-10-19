import { FiCheck, FiX, FiPackage, FiNavigation } from "react-icons/fi";

const BADGE = {
    new: ["New order", "bg-amber-100 text-amber-700"],
    accepted: ["Go to pickup", "bg-sky-100 text-sky-700"],
    picked: ["On the way", "bg-violet-100 text-violet-700"],
    delivered: ["Delivered", "bg-brand-100 text-brand-700"],
    cancelled: ["Cancelled", "bg-red-100 text-red-600"],
};
const when = (t) => t && new Date(t).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

const OrderCard = ({ order: o, selected, onSelect, onAccept, onCancel, onAdvance }) => {
    const [label, cls] = BADGE[o.status];
    return (
        <div onClick={() => onSelect(o.id)}
            className={`cursor-pointer rounded-2xl border bg-white p-4 transition hover:shadow-md ${selected ? "border-brand-500 ring-2 ring-brand-100" : "border-slate-200"}`}>
            <div className="flex items-start justify-between gap-2">
                <div>
                    <p className="font-extrabold text-slate-900">{o.store} <span className="text-xs font-semibold text-slate-400">#{o.id}</span></p>
                    <span className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold ${cls}`}>{label}</span>
                </div>
                <p className="text-xl font-extrabold text-brand-700">₹{o.amount}</p>
            </div>

            <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                <p className="flex gap-2"><span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-amber-500" /><span><b>Pickup</b> · {o.pickup.address}</span></p>
                <p className="flex gap-2"><span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-600" /><span><b>Drop</b> · {o.customer}, {o.drop.address}</span></p>
            </div>

            <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold text-slate-500">
                <span className="rounded-md bg-slate-100 px-2 py-1">{o.km} km</span>
                <span className="flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1"><FiPackage /> {o.items} items</span>
                <span className={`rounded-md px-2 py-1 ${o.pay === "COD" ? "bg-amber-50 text-amber-700" : "bg-slate-100"}`}>{o.pay === "COD" ? `Collect ₹${o.amount} (COD)` : "Paid online"}</span>
            </div>

            {o.status === "new" && (
                <div className="mt-4 grid grid-cols-2 gap-2.5" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => onCancel(o)} className="flex items-center justify-center gap-1.5 rounded-xl border border-red-200 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50"><FiX /> Cancel</button>
                    <button onClick={() => onAccept(o)} className="flex items-center justify-center gap-1.5 rounded-xl bg-brand-600 py-2.5 text-sm font-bold text-white hover:bg-brand-700"><FiCheck /> Accept</button>
                </div>
            )}
            {(o.status === "accepted" || o.status === "picked") && (
                <div className="mt-4 grid grid-cols-[auto_1fr] gap-2.5" onClick={(e) => e.stopPropagation()}>
                    {o.status === "accepted"
                        ? <button onClick={() => onCancel(o)} className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50">Cancel</button>
                        : <a href={`https://www.google.com/maps/dir/?api=1&destination=${o.drop.lat},${o.drop.lng}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"><FiNavigation /> Navigate</a>}
                    <button onClick={() => onAdvance(o)} className="rounded-xl bg-brand-600 py-2.5 text-sm font-bold text-white hover:bg-brand-700">
                        {o.status === "accepted" ? "Picked up" : "Mark delivered"}
                    </button>
                </div>
            )}
            {(o.status === "delivered" || o.status === "cancelled") && (
                <p className="mt-3 text-[11px] text-slate-400">{when(o.at)}{o.reason ? ` · ${o.reason}` : ""}</p>
            )}
        </div>
    );
};
export default OrderCard;