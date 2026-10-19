import { useState } from "react";
import {
    Link,
    NavLink,
    Navigate,
    Outlet,
    Route,
    Routes,
    useNavigate,
    useParams,
} from "react-router-dom";
import {
    FiArrowDownLeft,
    FiArrowLeft,
    FiArrowRight,
    FiBell,
    FiCheck,
    FiCheckCircle,
    FiChevronRight,
    FiClock,
    FiCreditCard,
    FiFileText,
    FiHome,
    FiLogOut,
    FiMinus,
    FiMapPin,
    FiPackage,
    FiPhone,
    FiPlus,
    FiSearch,
    FiShield,
    FiTrendingUp,
    FiTruck,
    FiUploadCloud,
    FiUser,
    FiUsers,
    FiX,
} from "react-icons/fi";
import { FaMotorcycle } from "react-icons/fa";
import "./UiDemo.css";

const INITIAL_ORDERS = [
    { id: "QR-4821", store: "Fresh Mart", address: "Banjara Hills, Road No. 12", distance: "2.4 km", payout: 64, time: "12 min", status: "New" },
    { id: "QR-4822", store: "Green Basket", address: "Madhapur, Hitech City", distance: "3.8 km", payout: 82, time: "18 min", status: "New" },
    { id: "QR-4823", store: "Daily Needs", address: "Gachibowli, Kondapur", distance: "3.1 km", payout: 71, time: "15 min", status: "New" },
];

const ONBOARDING_STEPS = [
    { key: "personal", title: "Personal details", note: "Tell us a little about yourself", icon: FiUser },
    { key: "documents", title: "Documents", note: "Add your identity documents", icon: FiFileText },
    { key: "vehicle", title: "Vehicle details", note: "How will you make deliveries?", icon: FiTruck },
    { key: "photo", title: "Profile photo", note: "Add a clear photo of yourself", icon: FiUsers },
    { key: "review", title: "Review", note: "Check your details", icon: FiCheckCircle },
];

const money = (value) => `₹${value.toLocaleString("en-IN")}`;

function Brand({ light = false }) {
    return (
        <span className={`brand-lockup${light ? " brand-lockup-light" : ""}`}>
            <span className="brand-mark" aria-hidden="true"><FaMotorcycle /></span>
            <span>quick<span className="brand-accent">rider</span></span>
        </span>
    );
}

function Notice({ message, onClose }) {
    if (!message) return null;
    return (
        <div className="demo-notice" role="status">
            <FiCheckCircle aria-hidden="true" />
            <span>{message}</span>
            <button type="button" aria-label="Dismiss notification" onClick={onClose}><FiX /></button>
        </div>
    );
}

function AuthFrame({ children, mode }) {
    return (
        <main className="auth-screen">
            <aside className="auth-promo">
                <Link to="/login" className="auth-brand"><Brand light /></Link>
                <div className="auth-copy">
                    <span className="eyebrow eyebrow-light">YOUR CITY. YOUR ROUTE.</span>
                    <h1>Make every<br />ride <span>count.</span></h1>
                    <p>Flexible work, reliable payouts, and the freedom to ride on your schedule.</p>
                    <div className="auth-perks">
                        <span><FiCheckCircle /> Weekly payouts</span>
                        <span><FiCheckCircle /> Flexible hours</span>
                    </div>
                </div>
                <div className="promo-route" aria-hidden="true">
                    <span className="route-point route-point-start"><FiMapPin /></span>
                    <span className="route-dash" />
                    <span className="route-bike"><FaMotorcycle /></span>
                    <span className="route-dash" />
                    <span className="route-point route-point-end"><FiCheck /></span>
                    <span className="route-caption">A better way to deliver</span>
                </div>
                <p className="promo-footnote">A rider-first experience, built for your city.</p>
            </aside>
            <section className="auth-panel">
                <div className="auth-mobile-brand"><Brand /></div>
                <div className="auth-card">
                    {children}
                    <div className="demo-disclaimer"><FiShield /> UI preview only — no account or API connection is made.</div>
                </div>
                <p className="auth-switch">{mode === "login" ? "New to QuickRider?" : "Already riding with us?"}{" "}
                    <Link to={mode === "login" ? "/register" : "/login"}>{mode === "login" ? "Create an account" : "Sign in"}</Link>
                </p>
            </section>
        </main>
    );
}

function LoginScreen({ onContinue }) {
    const [phone, setPhone] = useState("");
    return (
        <AuthFrame mode="login">
            <span className="eyebrow">RIDER PORTAL</span>
            <h2>Welcome back</h2>
            <p className="auth-subtitle">Sign in to pick up where you left off.</p>
            <form className="demo-form" onSubmit={(event) => { event.preventDefault(); onContinue(); }}>
                <label htmlFor="login-phone">Mobile number</label>
                <div className="input-wrap"><FiPhone /><span className="country-code">+91</span><input id="login-phone" type="tel" inputMode="numeric" autoComplete="tel" maxLength={10} placeholder="98765 43210" value={phone} onChange={(event) => setPhone(event.target.value.replace(/\D/g, ""))} required minLength={10} /></div>
                <label htmlFor="login-password">Password</label>
                <input className="text-input" id="login-password" type="password" autoComplete="current-password" placeholder="Enter your password" required minLength={4} />
                <button type="button" className="forgot-link" onClick={() => window.alert("Password reset is not connected in this UI preview.")}>Forgot password?</button>
                <button className="primary-button auth-submit" type="submit">Sign in <FiArrowRight /></button>
            </form>
            <button className="text-button demo-enter" type="button" onClick={onContinue}>Explore the dashboard preview <FiArrowRight /></button>
        </AuthFrame>
    );
}

function RegisterScreen({ onContinue }) {
    const [name, setName] = useState("");
    return (
        <AuthFrame mode="register">
            <span className="eyebrow">START RIDING</span>
            <h2>Create your account</h2>
            <p className="auth-subtitle">A few details to get your rider profile started.</p>
            <form className="demo-form" onSubmit={(event) => { event.preventDefault(); onContinue(name.trim() || "Alex Rider"); }}>
                <label htmlFor="register-name">Full name</label>
                <input className="text-input" id="register-name" autoComplete="name" placeholder="Your name" value={name} onChange={(event) => setName(event.target.value)} required minLength={2} />
                <label htmlFor="register-phone">Mobile number</label>
                <div className="input-wrap"><FiPhone /><span className="country-code">+91</span><input id="register-phone" type="tel" inputMode="numeric" autoComplete="tel" maxLength={10} placeholder="98765 43210" required minLength={10} /></div>
                <label htmlFor="register-email">Email address <span className="optional">Optional</span></label>
                <input className="text-input" id="register-email" type="email" autoComplete="email" placeholder="you@example.com" />
                <button className="primary-button auth-submit" type="submit">Continue <FiArrowRight /></button>
            </form>
        </AuthFrame>
    );
}

function OnboardingScreen({ form, setForm, onFinish }) {
    const navigate = useNavigate();
    const { step = "personal" } = useParams();
    const activeIndex = Math.max(0, ONBOARDING_STEPS.findIndex((item) => item.key === step));
    const current = ONBOARDING_STEPS[activeIndex];
    const update = (key, value) => setForm((previous) => ({ ...previous, [key]: value }));
    const go = (direction) => {
        const next = Math.min(ONBOARDING_STEPS.length - 1, Math.max(0, activeIndex + direction));
        navigate(`/onboarding/${ONBOARDING_STEPS[next].key}`);
    };

    return (
        <div className="onboarding-page">
            <header className="onboarding-header"><Link to="/login"><Brand /></Link><span className="preview-label"><FiShield /> UI preview</span></header>
            <div className="onboarding-layout">
                <aside className="onboarding-aside">
                    <span className="eyebrow">RIDER APPLICATION</span>
                    <h1>Let’s get you<br />ready to ride.</h1>
                    <p>Complete your profile in a few simple steps. You can review everything before you finish.</p>
                    <ol className="step-list">
                        {ONBOARDING_STEPS.map((item, index) => {
                            const Icon = item.icon;
                            return (
                                <li className={`${index === activeIndex ? "active" : ""} ${index < activeIndex ? "complete" : ""}`} key={item.key}>
                                    <span className="step-icon">{index < activeIndex ? <FiCheck /> : <Icon />}</span>
                                    <span><strong>{item.title}</strong><small>{item.note}</small></span>
                                </li>
                            );
                        })}
                    </ol>
                    <p className="step-progress">Step {activeIndex + 1} of {ONBOARDING_STEPS.length}</p>
                </aside>
                <main className="onboarding-card">
                    <div className="onboarding-card-heading">
                        <span className="step-count">STEP 0{activeIndex + 1}</span>
                        <h2>{current.title}</h2>
                        <p>{current.note}</p>
                    </div>
                    {step === "personal" && (
                        <div className="form-grid">
                            <label>Full name<input className="text-input" value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="Your full name" /></label>
                            <label>Date of birth<input className="text-input" type="date" value={form.dob || ""} onChange={(event) => update("dob", event.target.value)} /></label>
                            <label>City<input className="text-input" value={form.city || ""} onChange={(event) => update("city", event.target.value)} placeholder="e.g. Hyderabad" /></label>
                            <label>Postal code<input className="text-input" inputMode="numeric" value={form.pincode || ""} onChange={(event) => update("pincode", event.target.value)} placeholder="6-digit postal code" /></label>
                            <label className="span-full">Home address<input className="text-input" value={form.address || ""} onChange={(event) => update("address", event.target.value)} placeholder="Street, area, landmark" /></label>
                        </div>
                    )}
                    {step === "documents" && (
                        <div className="upload-list">
                            {["Identity card", "Driving licence", "Vehicle registration"].map((label, index) => {
                                const key = `document-${index}`;
                                return <label className="upload-card" key={key}><span className="upload-icon"><FiFileText /></span><span><strong>{label}</strong><small>{form[key] || "JPG, PNG or PDF · Max 5 MB"}</small></span><span className="upload-action"><FiUploadCloud /> Browse<input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={(event) => update(key, event.target.files?.[0]?.name || "")} /></span></label>;
                            })}
                        </div>
                    )}
                    {step === "vehicle" && (
                        <div className="form-grid">
                            <label className="span-full">Vehicle type<select className="text-input" value={form.vehicleType || ""} onChange={(event) => update("vehicleType", event.target.value)}><option value="">Select your vehicle</option><option>Motorcycle</option><option>Scooter</option><option>Electric bike</option></select></label>
                            <label>Registration number<input className="text-input" value={form.vehicleNumber || ""} onChange={(event) => update("vehicleNumber", event.target.value.toUpperCase())} placeholder="TS 08 AB 1234" /></label>
                            <label>Make and model<input className="text-input" value={form.vehicleModel || ""} onChange={(event) => update("vehicleModel", event.target.value)} placeholder="e.g. Honda Activa" /></label>
                        </div>
                    )}
                    {step === "photo" && (
                        <div className="photo-upload">
                            <div className="photo-placeholder"><FiUser /></div>
                            <h3>{form.photoName || "Add a profile photo"}</h3>
                            <p>Choose a recent, clear photo where your face is easy to see.</p>
                            <label className="secondary-button photo-button"><FiUploadCloud /> Choose photo<input type="file" accept="image/*" onChange={(event) => update("photoName", event.target.files?.[0]?.name || "")} /></label>
                        </div>
                    )}
                    {step === "review" && (
                        <div className="review-list">
                            <ReviewRow label="Name" value={form.name} />
                            <ReviewRow label="City" value={form.city} />
                            <ReviewRow label="Identity documents" value={["document-0", "document-1", "document-2"].filter((key) => form[key]).length ? `${["document-0", "document-1", "document-2"].filter((key) => form[key]).length} files selected` : "Not added yet"} />
                            <ReviewRow label="Vehicle" value={[form.vehicleType, form.vehicleNumber].filter(Boolean).join(" · ")} />
                            <ReviewRow label="Profile photo" value={form.photoName} />
                            <p className="review-note"><FiShield /> This is a local UI preview. Your information is not submitted or saved.</p>
                        </div>
                    )}
                    <div className="wizard-actions">
                        {activeIndex > 0 ? <button type="button" className="secondary-button" onClick={() => go(-1)}><FiArrowLeft /> Back</button> : <Link className="secondary-button" to="/register"><FiArrowLeft /> Back</Link>}
                        {step === "review" ? <button type="button" className="primary-button" onClick={onFinish}>Finish preview <FiCheck /></button> : <button type="button" className="primary-button" onClick={() => go(1)}>Save & continue <FiArrowRight /></button>}
                    </div>
                </main>
            </div>
        </div>
    );
}

function ReviewRow({ label, value }) {
    return <div className="review-row"><span>{label}</span><strong>{value || "Not provided"}</strong></div>;
}

function AccountReady({ onContinue }) {
    return (
        <main className="ready-screen">
            <div className="ready-card">
                <Brand />
                <span className="ready-check"><FiCheck /></span>
                <span className="eyebrow">PREVIEW COMPLETE</span>
                <h1>All set for the ride.</h1>
                <p>You’ve explored the rider setup screens. Move on to the interactive dashboard preview.</p>
                <button className="primary-button" onClick={onContinue}>Explore dashboard <FiArrowRight /></button>
            </div>
        </main>
    );
}

function RiderShell({ profile, onLogout, notice, onDismiss }) {
    const navItems = [
        { to: "/dashboard", label: "Overview", icon: FiHome, end: true },
        { to: "/home", label: "Rides", icon: FiMapPin },
        { to: "/orders", label: "My deliveries", icon: FiPackage },
        { to: "/earnings", label: "Earnings", icon: FiCreditCard },
        { to: "/profile", label: "Profile", icon: FiUser },
    ];
    return (
        <div className="app-shell">
            <aside className="sidebar">
                <Link to="/dashboard" className="sidebar-brand"><Brand light /></Link>
                <div className="sidebar-caption">RIDER MENU</div>
                <nav className="sidebar-nav" aria-label="Main navigation">
                    {navItems.map(({ to, label, icon: Icon, end }) => (
                        <NavLink key={to} to={to} end={end} className={({ isActive }) => `sidebar-link${isActive ? " selected" : ""}`}>
                            <Icon aria-hidden="true" /><span>{label}</span>{label === "My deliveries" && <span className="nav-count">3</span>}
                        </NavLink>
                    ))}
                </nav>
                <div className="sidebar-bottom">
                    <div className="support-card"><span className="support-icon"><FiPhone /></span><strong>Need a hand?</strong><p>Our rider support is here 24/7.</p><button type="button" onClick={() => window.alert("Support is not connected in this UI preview.")}>Get support <FiArrowRight /></button></div>
                    <div className="sidebar-profile"><span className="avatar">{profile.name.slice(0, 1).toUpperCase()}</span><span className="sidebar-name"><strong>{profile.name}</strong><small>Delivery partner</small></span><button type="button" aria-label="Sign out" onClick={onLogout}><FiLogOut /></button></div>
                </div>
            </aside>
            <div className="app-main">
                <header className="topbar">
                    <div className="mobile-brand"><Brand /></div>
                    <div className="breadcrumbs">Rider portal <FiChevronRight /> <span>Preview mode</span></div>
                    <div className="topbar-actions">
                        <span className="preview-pill"><span /> Sample data</span>
                        <button className="icon-button notification-button" type="button" aria-label="Notifications" onClick={() => window.alert("You’re all caught up.")}><FiBell /><span /></button>
                        <span className="topbar-avatar">{profile.name.slice(0, 1).toUpperCase()}</span>
                    </div>
                </header>
                {notice && <Notice message={notice} onClose={onDismiss} />}
                <main className="page-content"><Outlet /></main>
                <nav className="mobile-nav" aria-label="Mobile navigation">
                    {navItems.map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} aria-label={label} className={({ isActive }) => isActive ? "mobile-nav-link selected" : "mobile-nav-link"}><Icon /><span>{label}</span></NavLink>)}
                </nav>
            </div>
        </div>
    );
}

function DashboardScreen({ profile, online, setOnline, orders, onAccept }) {
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

const MAP_POINTS = [
    { x: 19, y: 35, title: "Banjara Hills" },
    { x: 70, y: 28, title: "Madhapur" },
    { x: 42, y: 63, title: "Gachibowli" },
];

function PickupMapScreen({ orders, onAccept, online, setOnline }) {
    const [selectedId, setSelectedId] = useState(orders[0]?.id);
    const [zoom, setZoom] = useState(1);
    const selected = orders.find((order) => order.id === selectedId) || orders[0];
    const advance = (order) => {
        if (order.status === "New") onAccept(order.id);
        else setSelectedId(order.id);
    };

    return (
        <>
            <section className="page-title-row pickup-title-row">
                <div><span className="eyebrow">LOCAL MAP PREVIEW</span><h1>Pickup map</h1><p>Explore sample pickup requests around Hyderabad.</p></div>
                <button className={`availability-button${online ? " is-online" : ""}`} onClick={() => setOnline((value) => !value)} aria-pressed={online}>
                    <span className="availability-dot" /><span><strong>{online ? "You’re online" : "You’re offline"}</strong><small>{online ? "Available for requests" : "Tap to start receiving orders"}</small></span><span className="switch-track"><span /></span>
                </button>
            </section>
            <section className="pickup-layout">
                <div className="pickup-map-card">
                    <div className="map-toolbar">
                        <span className="map-location"><FiMapPin /><span><strong>Hyderabad, Telangana</strong><small>Sample location · not GPS tracking</small></span></span>
                        <span className="map-legend"><span className="legend-rider" />You <span className="legend-pickup" />Pickup</span>
                    </div>
                    <div className="city-map" role="group" aria-label="Illustrated map preview with sample rider and pickup locations">
                        <div className="map-canvas" style={{ transform: `scale(${zoom})` }}>
                            <svg className="map-streets" viewBox="0 0 800 560" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
                                <rect width="800" height="560" fill="#edf2e9" />
                                <path d="M32 69 168 105 239 42 356 82 473 31 564 83 709 38 797 77M-8 172l140-19 102 61 117-37 110 57 132-44 114 40 115-35M-19 278l147-42 112 49 116-29 119 69 104-41 117 33 121-45M-14 388l134-55 110 74 123-40 114 39 99-57 124 56 121-28M-10 503l154-33 101 50 125-48 105 28 103-58 117 34 123-43" fill="none" stroke="#fff" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M80-20 111 108 78 200 135 303 96 410 155 580M237-20l-29 104 50 101-36 114 45 100-22 186M402-20l-8 114 46 104-23 118 54 101-31 181M574-20l-40 111 42 108-32 115 41 107-17 168M733-20l-39 124 45 107-29 102 41 96-20 161" fill="none" stroke="#fff" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M-20 299c136-62 214-11 311 36 98 47 161 70 252 28 93-43 147-132 277-119" fill="none" stroke="#cfdfd0" strokeWidth="32" strokeLinecap="round" />
                                <path d="M-20 299c136-62 214-11 311 36 98 47 161 70 252 28 93-43 147-132 277-119" fill="none" stroke="#dbe9de" strokeWidth="22" strokeLinecap="round" />
                                <path d="M43 45h82v72H43zM286 126h62v48h-62zM475 106h60v66h-60zM650 365h93v72h-93zM260 423h78v52h-78z" fill="#dcebd8" />
                                <path d="M43 45h82v72H43zM286 126h62v48h-62zM475 106h60v66h-60zM650 365h93v72h-93zM260 423h78v52h-78z" fill="none" stroke="#d2e3d1" strokeWidth="2" />
                            </svg>
                            <span className="map-neighborhood neighborhood-banjara">BANJARA HILLS</span>
                            <span className="map-neighborhood neighborhood-madhapur">MADHAPUR</span>
                            <span className="map-neighborhood neighborhood-gachibowli">GACHIBOWLI</span>
                            <span className="map-road-label road-label-one">HITEC CITY ROAD</span>
                            <span className="map-road-label road-label-two">OLD MUMBAI HIGHWAY</span>
                            <span className="map-rider-marker" style={{ left: "52%", top: "54%" }}><FaMotorcycle /></span>
                            {orders.map((order, index) => {
                                const point = MAP_POINTS[index % MAP_POINTS.length];
                                return (
                                    <button
                                        type="button"
                                        key={order.id}
                                        className={`map-pickup-marker${selected?.id === order.id ? " selected" : ""}${order.status !== "New" ? " assigned" : ""}`}
                                        style={{ left: `${point.x}%`, top: `${point.y}%` }}
                                        aria-label={`${order.store} pickup, ${order.status}`}
                                        aria-pressed={selected?.id === order.id}
                                        onClick={() => setSelectedId(order.id)}
                                    ><FiPackage /></button>
                                );
                            })}
                        </div>
                        <span className="map-scale-tag"><span />1 km</span>
                        <div className="map-zoom-controls">
                            <button type="button" aria-label="Zoom in" onClick={() => setZoom((value) => Math.min(value + 0.12, 1.36))}><FiPlus /></button>
                            <button type="button" aria-label="Zoom out" onClick={() => setZoom((value) => Math.max(value - 0.12, 1))}><FiMinus /></button>
                        </div>
                    </div>
                    <div className="map-footer"><span><FiShield /> Illustrative map · sample order locations</span><span>Map data is not live</span></div>
                </div>
                <aside className="pickup-orders-panel">
                    <div className="pickup-panel-heading"><div><span className="eyebrow">NEARBY</span><h2>Pickup requests</h2><p>Choose a marker or request to preview details.</p></div><span className="request-count">{orders.filter((order) => order.status === "New").length}</span></div>
                    <div className="pickup-order-list">
                        {orders.map((order, index) => {
                            const selectedOrder = selected?.id === order.id;
                            return (
                                <button type="button" key={order.id} className={`pickup-order-card${selectedOrder ? " selected" : ""}`} onClick={() => setSelectedId(order.id)}>
                                    <span className={`pickup-order-icon pickup-tone-${index % 3}`}><FiPackage /></span>
                                    <span className="pickup-order-info"><strong>{order.store}</strong><small><FiMapPin />{MAP_POINTS[index % MAP_POINTS.length].title} · {order.distance}</small><small><FiClock />Ready now · {order.time}</small></span>
                                    <strong className="pickup-order-amount">{money(order.payout)}</strong>
                                </button>
                            );
                        })}
                    </div>
                    {selected && (
                        <div className="selected-pickup">
                            <div className="selected-pickup-top"><span className="eyebrow">SELECTED REQUEST</span><span className={`request-status${selected.status !== "New" ? " status-assigned" : ""}`}>{selected.status}</span></div>
                            <h3>{selected.store}</h3>
                            <p><FiMapPin /> Pickup · {MAP_POINTS[orders.findIndex((order) => order.id === selected.id) % MAP_POINTS.length].title}</p>
                            <div className="pickup-route-info"><span>{selected.distance}</span><span>·</span><span>Est. {selected.time}</span><strong>{money(selected.payout)}</strong></div>
                            <button className="primary-button pickup-action" type="button" onClick={() => advance(selected)} disabled={selected.status !== "New"}>
                                {selected.status === "New" ? "Accept request" : "Request accepted"}<FiArrowRight />
                            </button>
                        </div>
                    )}
                </aside>
            </section>
            <p className="sample-note"><FiShield /> UI preview only: pickup pins and delivery details are sample data, not live map or GPS information.</p>
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

function OrdersScreen({ orders, onAccept }) {
    return <><section className="page-title-row"><div><span className="eyebrow">YOUR ROUTE, YOUR PACE</span><h1>My deliveries</h1><p>Track new requests and your recent delivery activity.</p></div><span className="list-count"><FiPackage /> {orders.length} sample orders</span></section><section className="surface-card order-page-card"><div className="section-heading"><div><h2>Delivery requests</h2><p>Example requests to explore the rider experience.</p></div><button className="secondary-button filter-button" type="button"><FiSearch /> Find orders</button></div><OrderList orders={orders} onAccept={onAccept} /></section><p className="sample-note"><FiShield /> Orders are examples and are not connected to a dispatch service.</p></>;
}

function EarningsScreen() {
    return <><section className="page-title-row"><div><span className="eyebrow">YOUR HARD WORK, REWARDED</span><h1>Earnings</h1><p>See your sample earnings summary and payout schedule.</p></div><button className="secondary-button" type="button" onClick={() => window.alert("Payout history is not connected in this UI preview.")}><FiCreditCard /> Payout history</button></section><section className="earnings-overview"><article className="surface-card earnings-total"><span className="stat-label">This week</span><strong>₹8,640</strong><span className="payout-status"><FiCheckCircle /> Next payout · Friday, 24 Oct</span><EarningsChart /></article><div className="earnings-mini-grid"><StatCard icon={FiTrendingUp} label="This month" value="₹24,860" trend="+8.2%" tone="green" /><StatCard icon={FiPackage} label="Completed trips" value="42" note="This week" tone="orange" /><StatCard icon={FiArrowDownLeft} label="Per delivery avg." value="₹68" note="Including bonuses" tone="purple" /></div></section><section className="surface-card payout-card"><div className="section-heading"><div><h2>Recent payouts</h2><p>Example payout activity</p></div></div>{[["Oct 17", "Weekly payout", "₹6,420"], ["Oct 10", "Weekly payout", "₹7,180"], ["Oct 03", "Weekly payout", "₹5,920"]].map(([date, title, amount]) => <div className="payout-row" key={date}><span className="payout-date"><FiCreditCard /></span><span><strong>{title}</strong><small>{date}, 2026</small></span><strong className="payout-amount">{amount}</strong><span className="paid-label"><FiCheck /> Paid</span></div>)}</section></>;
}

function ProfileScreen({ profile, setProfile, onNotify }) {
    const update = (key, value) => setProfile((previous) => ({ ...previous, [key]: value }));
    return <><section className="page-title-row"><div><span className="eyebrow">YOUR RIDER ACCOUNT</span><h1>Profile</h1><p>Manage your details in this local UI preview.</p></div></section><div className="profile-grid"><section className="surface-card profile-card"><div className="profile-cover" /><div className="profile-identity"><span className="profile-large-avatar">{profile.name.slice(0, 1).toUpperCase()}</span><h2>{profile.name}</h2><p>QuickRider partner since 2024</p><span className="verified-label"><FiCheckCircle /> Verified demo profile</span></div><div className="profile-meta"><span><FiMapPin /> Hyderabad, India</span><span><FiTruck /> {profile.vehicle || "Motorcycle"} · {profile.vehicleNumber || "TS 08 AB 1234"}</span><span><FiStarIcon /> 4.9 rider rating</span></div></section><section className="surface-card profile-edit"><h2>Personal information</h2><p>Changes stay in this browser session only.</p><form className="demo-form" onSubmit={(event) => { event.preventDefault(); onNotify("Profile preview updated"); }}><label htmlFor="profile-name">Full name</label><input className="text-input" id="profile-name" value={profile.name} onChange={(event) => update("name", event.target.value)} /><label htmlFor="profile-phone">Mobile number</label><input className="text-input" id="profile-phone" value={profile.phone} onChange={(event) => update("phone", event.target.value)} /><label htmlFor="profile-email">Email address</label><input className="text-input" id="profile-email" type="email" value={profile.email} onChange={(event) => update("email", event.target.value)} /><button className="primary-button" type="submit">Save changes <FiCheck /></button></form></section></div><p className="sample-note"><FiShield /> No profile information is sent or stored on a server.</p></>;
}

function FiStarIcon() {
    return <FiTrendingUp aria-hidden="true" />;
}

export default function UiDemo() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState({ name: "Alex Rider", phone: "+91 98765 43210", email: "alex.rider@example.com", vehicle: "Scooter", vehicleNumber: "TS 08 AB 1234" });
    const [form, setForm] = useState({ name: "Alex Rider" });
    const [online, setOnline] = useState(false);
    const [orders, setOrders] = useState(INITIAL_ORDERS);
    const [notice, setNotice] = useState("");

    const acceptOrder = (id) => {
        setOrders((current) => current.map((order) => order.id === id ? { ...order, status: "Accepted" } : order));
        setNotice(`${id} added to your deliveries`);
    };
    const completeOnboarding = () => {
        setNotice("Rider setup preview complete");
        navigate("/account-ready");
    };
    const continueToDashboard = (name) => {
        if (name) setProfile((current) => ({ ...current, name }));
        setNotice("");
        navigate("/dashboard");
    };
    const logout = () => {
        setOnline(false);
        setNotice("");
        navigate("/login");
    };

    return (
        <>
            <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<LoginScreen onContinue={() => continueToDashboard()} />} />
                <Route path="/register" element={<RegisterScreen onContinue={(name) => { setProfile((current) => ({ ...current, name })); setForm((current) => ({ ...current, name })); navigate("/onboarding/personal"); }} />} />
                <Route path="/onboarding" element={<Navigate to="/onboarding/personal" replace />} />
                <Route path="/onboarding/:step" element={<OnboardingScreen form={form} setForm={setForm} onFinish={completeOnboarding} />} />
                <Route path="/account-ready" element={<AccountReady onContinue={() => continueToDashboard()} />} />
                <Route element={<RiderShell profile={profile} onLogout={logout} notice={notice} onDismiss={() => setNotice("")} />}>
                    <Route path="/home" element={<PickupMapScreen orders={orders} onAccept={acceptOrder} online={online} setOnline={setOnline} />} />
                    <Route path="/pickup" element={<PickupMapScreen orders={orders} onAccept={acceptOrder} online={online} setOnline={setOnline} />} />
                    <Route path="/dashboard" element={<DashboardScreen profile={profile} online={online} setOnline={setOnline} orders={orders} onAccept={acceptOrder} />} />
                    <Route path="/orders" element={<OrdersScreen orders={orders} onAccept={acceptOrder} />} />
                    <Route path="/earnings" element={<EarningsScreen />} />
                    <Route path="/profile" element={<ProfileScreen profile={profile} setProfile={setProfile} onNotify={setNotice} />} />
                </Route>
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </>
    );
}
