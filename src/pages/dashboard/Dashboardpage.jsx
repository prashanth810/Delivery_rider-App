import { useState } from "react";
import { useSelector } from "react-redux";
import { FiMapPin, FiPackage, FiClock, FiTrendingUp } from "react-icons/fi";
import { showSuccessToast } from "../components/Toast";

const ORDERS = [
    { id: "#QR4821", from: "Fresh Mart, Banjara Hills", to: "Road No. 12", amt: 64, km: "2.4 km" },
    { id: "#QR4822", from: "Green Basket, Madhapur", to: "Hitech City", amt: 82, km: "3.8 km" },
    { id: "#QR4823", from: "Daily Needs, Gachibowli", to: "Kondapur", amt: 71, km: "3.1 km" },
];

const Dashboard = () => {
    const user = useSelector((s) => s.auth.user);
    const [online, setOnline] = useState(false);
    const toggle = () => { setOnline((o) => !o); showSuccessToast(online ? "You are offline" : "You are online – orders incoming!"); };

    return (
        <div className="space-y-6">
            <section className="flex flex-col gap-5 rounded-3xl bg-gradient-to-r from-brand-900 to-brand-600 p-7 text-white sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-emerald-100">Good day,</p>
                    <h1 className="text-3xl font-extrabold">{user?.fullName?.split(" ")[0]} 👋</h1>
                    <p className="mt-1 text-sm text-emerald-100">{online ? "You're online and receiving orders." : "Go online to start receiving orders."}</p>
                </div>
                <button onClick={toggle} className={`flex items-center gap-3 rounded-full px-5 py-3 font-bold transition ${online ? "bg-white text-brand-700" : "bg-white/15 text-white ring-1 ring-white/30 hover:bg-white/25"}`}>
                    <span className={`h-3 w-3 rounded-full ${online ? "bg-emerald-500" : "bg-slate-300"}`} />{online ? "Online" : "Go Online"}
                </button>
            </section>

            <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {[[FiTrendingUp, "Today's Earnings", "₹0"], [FiPackage, "Deliveries", "0"], [FiClock, "Online Hours", "0h"], [FiMapPin, "Distance", "0 km"]].map(([Icon, k, v]) => (
                    <div key={k} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><Icon /></span>
                        <p className="mt-3 text-2xl font-extrabold text-slate-900">{v}</p><p className="text-xs text-slate-500">{k}</p>
                    </div>
                ))}
            </section>

            <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
                <h2 className="text-lg font-extrabold text-brand-900">Nearby orders</h2>
                {!online ? <p className="py-10 text-center text-sm text-slate-400">Go online to see orders near you.</p> : (
                    <ul className="mt-4 divide-y divide-slate-100">
                        {ORDERS.map((o) => (
                            <li key={o.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                                <div><p className="font-bold text-slate-800">{o.id} · {o.from}</p><p className="text-xs text-slate-500">Drop: {o.to} · {o.km}</p></div>
                                <div className="flex items-center gap-4"><span className="font-extrabold text-brand-700">₹{o.amt}</span>
                                    <button onClick={() => showSuccessToast(`Order ${o.id} accepted`)} className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white hover:bg-brand-700">Accept</button></div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
};
export default Dashboard;