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
    FiSearch,
    FiShield,
    FiTrendingUp,
    FiTruck,
} from "react-icons/fi";
import { FaMotorcycle } from "react-icons/fa";

const money = (value) => `₹${value.toLocaleString("en-IN")}`;

export function DashboardScreen({ profile, online, setOnline, orders, onAccept }) {
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
                {online ? <OrderList orders={orders.slice(0, 2)} onAccept={onAccept} /> : <div className="empty-orders"><span><FiMapPin /></span><div><strong>Ready when you are</strong><p>Switch your status to online to see nearby requests.</p></div><button type="button" className="small-primary" onClick={() => setOnline(true)}>Go online <FiArrowRight /></button></div>}
            </section>
            <p className="sample-note"><FiShield /> This dashboard uses sample information for UI preview only.</p>
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

function OrderList({ orders, onAccept }) {
    if (!orders.length) return <div className="no-orders">No new orders right now. We’ll show requests here when they’re available.</div>;
    return <div className="order-list">{orders.map((order) => <article className="order-row" key={order.id}><span className="store-avatar"><FiPackage /></span><span className="order-description"><strong>{order.store}<span className="order-badge">{order.status}</span></strong><small><FiMapPin /> {order.address}</small><small><FiClock /> {order.distance} · approx. {order.time}</small></span><span className="order-payout"><strong>{money(order.payout)}</strong><small>estimated</small></span><button className="accept-button" type="button" disabled={order.status !== "New"} onClick={() => onAccept(order.id)}>{order.status === "New" ? "Accept" : order.status}<FiArrowRight /></button></article>)}</div>;
}

export function OrdersScreen({ orders, onAccept }) {
    return <><section className="page-title-row"><div><span className="eyebrow">YOUR ROUTE, YOUR PACE</span><h1>My deliveries</h1><p>Track new requests and your recent delivery activity.</p></div><span className="list-count"><FiPackage /> {orders.length} sample orders</span></section><section className="surface-card order-page-card"><div className="section-heading"><div><h2>Delivery requests</h2><p>Example requests to explore the rider experience.</p></div><button className="secondary-button filter-button" type="button"><FiSearch /> Find orders</button></div><OrderList orders={orders} onAccept={onAccept} /></section><p className="sample-note"><FiShield /> Orders are examples and are not connected to a dispatch service.</p></>;
}

export function EarningsScreen() {
    return <><section className="page-title-row"><div><span className="eyebrow">YOUR HARD WORK, REWARDED</span><h1>Earnings</h1><p>See your sample earnings summary and payout schedule.</p></div><button className="secondary-button" type="button" onClick={() => window.alert("Payout history is not connected in this UI preview.")}><FiCreditCard /> Payout history</button></section><section className="earnings-overview"><article className="surface-card earnings-total"><span className="stat-label">This week</span><strong>₹8,640</strong><span className="payout-status"><FiCheckCircle /> Next payout · Friday, 24 Oct</span><EarningsChart /></article><div className="earnings-mini-grid"><StatCard icon={FiTrendingUp} label="This month" value="₹24,860" trend="+8.2%" tone="green" /><StatCard icon={FiPackage} label="Completed trips" value="42" note="This week" tone="orange" /><StatCard icon={FiArrowDownLeft} label="Per delivery avg." value="₹68" note="Including bonuses" tone="purple" /></div></section><section className="surface-card payout-card"><div className="section-heading"><div><h2>Recent payouts</h2><p>Example payout activity</p></div></div>{[["Oct 17", "Weekly payout", "₹6,420"], ["Oct 10", "Weekly payout", "₹7,180"], ["Oct 03", "Weekly payout", "₹5,920"]].map(([date, title, amount]) => <div className="payout-row" key={date}><span className="payout-date"><FiCreditCard /></span><span><strong>{title}</strong><small>{date}, 2026</small></span><strong className="payout-amount">{amount}</strong><span className="paid-label"><FiCheck /> Paid</span></div>)}</section></>;
}

export function ProfileScreen({ profile, setProfile, onNotify }) {
    const update = (key, value) => setProfile((previous) => ({ ...previous, [key]: value }));
    return <><section className="page-title-row"><div><span className="eyebrow">YOUR RIDER ACCOUNT</span><h1>Profile</h1><p>Manage your details in this local UI preview.</p></div></section><div className="profile-grid"><section className="surface-card profile-card"><div className="profile-cover" /><div className="profile-identity"><span className="profile-large-avatar">{profile.name.slice(0, 1).toUpperCase()}</span><h2>{profile.name}</h2><p>QuickRider partner since 2024</p><span className="verified-label"><FiCheckCircle /> Verified demo profile</span></div><div className="profile-meta"><span><FiMapPin /> Hyderabad, India</span><span><FiTruck /> {profile.vehicle || "Motorcycle"} · {profile.vehicleNumber || "TS 08 AB 1234"}</span><span><FiTrendingUp aria-hidden="true" /> 4.9 rider rating</span></div></section><section className="surface-card profile-edit"><h2>Personal information</h2><p>Changes stay in this browser session only.</p><form className="demo-form" onSubmit={(event) => { event.preventDefault(); onNotify("Profile preview updated"); }}><label htmlFor="profile-name">Full name</label><input className="text-input" id="profile-name" value={profile.name} onChange={(event) => update("name", event.target.value)} /><label htmlFor="profile-phone">Mobile number</label><input className="text-input" id="profile-phone" value={profile.phone} onChange={(event) => update("phone", event.target.value)} /><label htmlFor="profile-email">Email address</label><input className="text-input" id="profile-email" type="email" value={profile.email} onChange={(event) => update("email", event.target.value)} /><button className="primary-button" type="submit">Save changes <FiCheck /></button></form></section></div><p className="sample-note"><FiShield /> No profile information is sent or stored on a server.</p></>;
}
