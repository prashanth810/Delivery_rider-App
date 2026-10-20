import { Link } from "react-router-dom";
import {
    FiArrowDownLeft,
    FiArrowRight,
    FiCheck,
    FiCheckCircle,
    FiChevronRight,
    FiClock,
    FiCreditCard,
    FiMapPin,
    FiPackage,
    FiShield,
    FiTrendingUp,
    FiTruck,
} from "react-icons/fi";
import { FaMotorcycle } from "react-icons/fa";
import { HISTORY_ORDERS } from "../pickup/demoOrders";

const money = (value) => `₹${value.toLocaleString("en-IN")}`;

export function DashboardScreen({ profile, online, setOnline, orders, onAccept, activeOrder = null }) {
    const active = orders.filter((order) => order.status === "New");
    return (
        <>
            <section className="welcome-row">
                <div><span className="eyebrow">MONDAY, OCTOBER 19</span><h1>Good morning, {profile.name.split(" ")[0]}.</h1><p>Here’s what’s happening with your rides today.</p></div>
                <button className={`availability-button${online ? " is-online" : ""}`} onClick={() => setOnline((value) => !value)} aria-pressed={online}><span className="availability-dot" /><span><strong>{online ? "You’re online" : "You’re offline"}</strong><small>{online ? "Tap to pause new requests" : "Tap to start receiving orders"}</small></span><span className="switch-track"><span /></span></button>
            </section>
            <section className="hero-card">
                <div className="hero-card-copy"><span className="hero-kicker"><FiTrendingUp /> YOUR RIDER SUMMARY</span><h2>You’re making<br />great progress.</h2><p>Complete one more delivery to reach your daily goal.</p><div className="goal-track"><span /></div><div className="goal-caption"><span>3 of 4 deliveries</span><strong>75%</strong></div></div>
                <div className="hero-art" aria-hidden="true"><div className="art-sun" /><div className="art-building building-one" /><div className="art-building building-two" /><div className="art-building building-three" /><span className="art-road" /><span className="art-rider"><FaMotorcycle /></span><span className="art-pin"><FiMapPin /></span></div>
                <span className="hero-stamp"><strong>+₹120</strong><small>goal bonus</small></span>
            </section>
            <section className="stats-grid" aria-label="Today's performance">
                <StatCard icon={FiTrendingUp} label="Today's earnings" value="₹1,240" trend="+12.5%" tone="green" />
                <StatCard icon={FiPackage} label="Deliveries" value="3" note="of 4 daily goal" tone="orange" />
                <StatCard icon={FiClock} label="Online time" value="4h 20m" note="Since 8:15 AM" tone="purple" />
                <StatCard icon={FiMapPin} label="Distance covered" value="18.6 km" note="Across 7 trips" tone="blue" />
            </section>
            <div className="dashboard-grid">
                <section className="surface-card earnings-card">
                    <div className="section-heading"><div><h2>Weekly earnings</h2><p>Your payout is looking good this week.</p></div><button className="period-select" type="button">This week <FiChevronRight /></button></div>
                    <div className="chart-summary"><strong>₹8,640</strong><span><FiTrendingUp /> 8.2% <small>vs last week</small></span></div>
                    <EarningsChart />
                    <div className="chart-days"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div>
                </section>
                <section className="surface-card goal-card">
                    <div className="section-heading"><div><h2>Daily goal</h2><p>Keep your momentum going.</p></div><span className="goal-icon"><FiTrendingUp /></span></div>
                    <div className="goal-ring" aria-label="Three of four deliveries complete"><span><strong>3/4</strong><small>deliveries</small></span></div>
                    <p className="goal-message">One more delivery unlocks your <strong>₹120 bonus</strong>.</p>
                    <Link to="/orders" className="inline-link">View available orders <FiArrowRight /></Link>
                </section>
            </div>
            <section className="surface-card orders-panel">
                <div className="section-heading"><div><h2>Nearby orders</h2><p>{online ? `${active.length} new requests around you` : "Go online to start receiving delivery requests"}</p></div><Link className="inline-link" to="/pickup">Open pickup map <FiArrowRight /></Link></div>
                {online ? <OrderList orders={orders.slice(0, 2)} onAccept={onAccept} activeOrder={activeOrder} /> : <div className="empty-orders"><span><FiMapPin /></span><div><strong>Ready when you are</strong><p>Switch your status to online to see nearby requests.</p></div><button type="button" className="small-primary" onClick={() => setOnline(true)}>Go online <FiArrowRight /></button></div>}
            </section>
            <p className="sample-note"><FiShield /> Performance figures are preview values; available deliveries are loaded from your account.</p>
        </>
    );
}

function StatCard({ icon: Icon, label, value, trend, note, tone }) {
    return <article className="stat-card"><span className={`stat-icon ${tone}`}><Icon /></span><span className="stat-label">{label}</span><strong className="stat-value">{value}</strong><span className={`stat-note${trend ? " trend-note" : ""}`}>{trend ? <><FiTrendingUp /> {trend} <span>vs yesterday</span></> : note}</span></article>;
}

function EarningsChart() {
    return (
        <div className="chart-wrap">
            <div className="chart-y-labels"><span>₹2k</span><span>₹1.5k</span><span>₹1k</span><span>₹500</span><span>₹0</span></div>
            <svg className="earnings-chart" viewBox="0 0 600 190" preserveAspectRatio="none" role="img" aria-label="Weekly earnings rose over the last seven days">
                <defs><linearGradient id="chart-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#15966a" stopOpacity=".18" /><stop offset="100%" stopColor="#15966a" stopOpacity="0" /></linearGradient></defs>
                {[20, 60, 100, 140, 180].map((y) => <line key={y} x1="0" x2="600" y1={y} y2={y} stroke="#edf1ed" strokeDasharray="4 6" />)}
                <path d="M0 146 C38 135 45 109 90 120 S144 146 184 101 S249 112 274 82 S326 101 365 66 S420 91 455 48 S510 64 548 34 S582 47 600 20 V190 H0 Z" fill="url(#chart-fill)" />
                <path d="M0 146 C38 135 45 109 90 120 S144 146 184 101 S249 112 274 82 S326 101 365 66 S420 91 455 48 S510 64 548 34 S582 47 600 20" fill="none" stroke="#15966a" strokeWidth="3" vectorEffect="non-scaling-stroke" />
                <circle cx="600" cy="20" r="5" fill="#fff" stroke="#15966a" strokeWidth="3" vectorEffect="non-scaling-stroke" />
            </svg>
        </div>
    );
}

function OrderList({ orders, onAccept, activeOrder = null }) {
    if (!orders.length) return <div className="no-orders">No new orders right now. We’ll show requests here when they’re available.</div>;
    return <div className="order-list">{orders.map((order) => <article className="order-row" key={order.id}><span className="store-avatar"><FiPackage /></span><span className="order-description"><strong>{order.store}<span className="order-badge">{order.status}</span></strong><small><FiMapPin /> Drop · {order.area || "Delivery area unavailable"}</small><small><FiClock /> {formatWhen(order.createdAt)}</small></span><span className="order-payout"><strong>{order.paymentMethod === "ONLINE" ? "Paid online" : money(order.amountToCollect || 0)}</strong><small>{order.paymentMethod === "ONLINE" ? "payment" : "to collect"}</small></span>{activeOrder?.id === order.id ? <Link className="accept-button" to={`/delivery/${order.id}`}>View delivery<FiArrowRight /></Link> : <button className="accept-button" type="button" disabled={order.status !== "New" || !!activeOrder} onClick={() => onAccept(order.id)}>{order.status === "New" ? (activeOrder ? "Delivery in progress" : "Accept") : order.status}<FiArrowRight /></button>}</article>)}</div>;
}

const STATUS_STYLE = {
    Delivered: "bg-brand-100 text-brand-700",
    Cancelled: "bg-red-100 text-red-700",
    Accepted: "bg-blue-100 text-blue-700",
    "Picked up": "bg-orange-100 text-orange-700",
};

const formatWhen = (time) => new Date(time).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

// "My deliveries": ongoing delivery (if any) + last orders. No accept buttons here.
export function OrdersScreen({ orders = [] }) {
    const ongoing = orders.filter((order) => ["Accepted", "Picked up"].includes(order.status));
    const doneToday = orders
        .filter((order) => order.status === "Delivered")
        .map((order) => ({ id: order.id, orderNo: order.orderNo, store: order.store, area: order.area, customerName: order.customer?.name, items: order.items?.length || 1, distance: order.distance, payout: order.payout, status: "Delivered", at: order.createdAt }));
    const history = [...doneToday, ...HISTORY_ORDERS];
    const delivered = history.filter((order) => order.status === "Delivered");
    const earned = delivered.reduce((sum, order) => sum + (Number.isFinite(order.payout) ? order.payout : 0), 0);

    return (
        <>
            <section className="page-title-row"><div><span className="eyebrow">YOUR RIDE HISTORY</span><h1>My deliveries</h1><p>Your ongoing delivery and last orders.</p></div><span className="list-count"><FiPackage /> {history.length} recent orders</span></section>

            {ongoing.length > 0 && (
                <section className="mb-5 space-y-3">
                    {ongoing.map((order) => (
                        <Link key={order.id} to={`/delivery/${order.id}`} className="flex flex-wrap items-center gap-4 rounded-2xl border border-brand-200 bg-brand-50 p-4 transition hover:border-brand-500">
                            <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-700 text-xl text-white"><FiTruck /></span>
                            <span className="min-w-0 flex-1"><strong className="block text-sm text-slate-900">{order.store} · #{order.orderNo}</strong><small className="text-xs text-slate-500">{order.status === "Accepted" ? "Go to pickup" : "On the way to customer"} · {order.customer?.name}</small></span>
                            <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${STATUS_STYLE[order.status]}`}>{order.status}</span>
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700">Continue <FiArrowRight /></span>
                        </Link>
                    ))}
                </section>
            )}

            <section className="mb-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-4"><small className="text-xs text-slate-500">Delivered</small><strong className="block text-2xl text-slate-900">{delivered.length}</strong></div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4"><small className="text-xs text-slate-500">Earned</small><strong className="block text-2xl text-slate-900">{money(earned)}</strong></div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4"><small className="text-xs text-slate-500">Cancelled</small><strong className="block text-2xl text-slate-900">{history.length - delivered.length}</strong></div>
            </section>

            <section className="surface-card order-page-card">
                <div className="section-heading"><div><h2>Last orders</h2><p>Your recent delivery activity.</p></div></div>
                <ul className="divide-y divide-slate-100">
                    {history.map((order) => (
                        <li key={order.id} className="flex flex-wrap items-center gap-4 py-3.5">
                            <span className="grid h-11 w-11 place-items-center rounded-xl bg-slate-100 text-lg text-slate-600"><FiPackage /></span>
                            <span className="min-w-0 flex-1">
                                <strong className="block truncate text-sm text-slate-900">{order.store} <span className="font-normal text-slate-400">· #{order.orderNo}</span></strong>
                                <small className="flex flex-wrap items-center gap-x-3 text-xs text-slate-500"><span className="inline-flex items-center gap-1"><FiMapPin /> {order.area || "Delivery area unavailable"}</span><span>{order.customerName || "Customer details unavailable"}</span><span>{order.items} item{order.items > 1 ? "s" : ""} · {order.distance || "Distance unavailable"}</span></small>
                            </span>
                            <span className="text-right"><strong className="block text-sm text-slate-900">{Number.isFinite(order.payout) ? money(order.payout) : "—"}</strong><small className="text-xs text-slate-400">{formatWhen(order.at)}</small></span>
                            <span className={`w-20 rounded-full py-1 text-center text-[11px] font-bold ${STATUS_STYLE[order.status]}`}>{order.status}</span>
                        </li>
                    ))}
                </ul>
            </section>
            <p className="sample-note"><FiShield /> Orders are examples and are not connected to a dispatch service.</p>
        </>
    );
}

export function EarningsScreen() {
    return <><section className="page-title-row"><div><span className="eyebrow">YOUR HARD WORK, REWARDED</span><h1>Earnings</h1><p>See your sample earnings summary and payout schedule.</p></div><button className="secondary-button" type="button" onClick={() => window.alert("Payout history is not connected in this UI preview.")}><FiCreditCard /> Payout history</button></section><section className="earnings-overview"><article className="surface-card earnings-total"><span className="stat-label">This week</span><strong>₹8,640</strong><span className="payout-status"><FiCheckCircle /> Next payout · Friday, 24 Oct</span><EarningsChart /></article><div className="earnings-mini-grid"><StatCard icon={FiTrendingUp} label="This month" value="₹24,860" trend="+8.2%" tone="green" /><StatCard icon={FiPackage} label="Completed trips" value="42" note="This week" tone="orange" /><StatCard icon={FiArrowDownLeft} label="Per delivery avg." value="₹68" note="Including bonuses" tone="purple" /></div></section><section className="surface-card payout-card"><div className="section-heading"><div><h2>Recent payouts</h2><p>Example payout activity</p></div></div>{[["Oct 17", "Weekly payout", "₹6,420"], ["Oct 10", "Weekly payout", "₹7,180"], ["Oct 03", "Weekly payout", "₹5,920"]].map(([date, title, amount]) => <div className="payout-row" key={date}><span className="payout-date"><FiCreditCard /></span><span><strong>{title}</strong><small>{date}, 2026</small></span><strong className="payout-amount">{amount}</strong><span className="paid-label"><FiCheck /> Paid</span></div>)}</section></>;
}

export function ProfileScreen({ profile, setProfile, onNotify }) {
    const update = (key, value) => setProfile((previous) => ({ ...previous, [key]: value }));
    return <><section className="page-title-row"><div><span className="eyebrow">YOUR RIDER ACCOUNT</span><h1>Profile</h1><p>Manage your details in this local UI preview.</p></div></section><div className="profile-grid"><section className="surface-card profile-card"><div className="profile-cover" /><div className="profile-identity"><span className="profile-large-avatar">{profile.name.slice(0, 1).toUpperCase()}</span><h2>{profile.name}</h2><p>QuickRider partner since 2024</p><span className="verified-label"><FiCheckCircle /> Verified demo profile</span></div><div className="profile-meta"><span><FiMapPin /> Hyderabad, India</span><span><FiTruck /> {profile.vehicle || "Motorcycle"} · {profile.vehicleNumber || "TS 08 AB 1234"}</span><span><FiTrendingUp aria-hidden="true" /> 4.9 rider rating</span></div></section><section className="surface-card profile-edit"><h2>Personal information</h2><p>Changes stay in this browser session only.</p><form className="demo-form" onSubmit={(event) => { event.preventDefault(); onNotify("Profile preview updated"); }}><label htmlFor="profile-name">Full name</label><input className="text-input" id="profile-name" value={profile.name} onChange={(event) => update("name", event.target.value)} /><label htmlFor="profile-phone">Mobile number</label><input className="text-input" id="profile-phone" value={profile.phone} onChange={(event) => update("phone", event.target.value)} /><label htmlFor="profile-email">Email address</label><input className="text-input" id="profile-email" type="email" value={profile.email} onChange={(event) => update("email", event.target.value)} /><button className="primary-button" type="submit">Save changes <FiCheck /></button></form></section></div><p className="sample-note"><FiShield /> No profile information is sent or stored on a server.</p></>;
}