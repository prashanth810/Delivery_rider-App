import { useState } from "react";
const REASONS = ["Vehicle problem", "Too far away", "Customer unavailable", "Store closed / item unavailable", "Other"];

const CancelModal = ({ order, onClose, onConfirm }) => {
    const [reason, setReason] = useState(REASONS[0]);
    return (
        <div className="fixed inset-0 z-[2000] flex items-end justify-center bg-slate-900/60 p-4 backdrop-blur-sm sm:items-center" onClick={onClose}>
            <div className="animate-pop w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-lg font-extrabold text-brand-900">Cancel order #{order.id}?</h3>
                <p className="mt-1 text-sm text-slate-500">Frequent cancellations can affect your rating. Tell us why:</p>
                <div className="mt-4 space-y-2">
                    {REASONS.map((r) => (
                        <label key={r} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-2.5 text-sm ${reason === r ? "border-brand-500 bg-brand-50" : "border-slate-200"}`}>
                            <input type="radio" checked={reason === r} onChange={() => setReason(r)} className="accent-emerald-600" />{r}
                        </label>
                    ))}
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3">
                    <button onClick={onClose} className="rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">Keep order</button>
                    <button onClick={() => onConfirm(reason)} className="rounded-xl bg-red-600 py-3 text-sm font-bold text-white hover:bg-red-700">Cancel order</button>
                </div>
            </div>
        </div>
    );
};
export default CancelModal;