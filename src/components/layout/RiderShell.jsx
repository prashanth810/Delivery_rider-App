import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import {
    FiBell,
    FiAlertCircle,
    FiCheckCircle,
    FiChevronRight,
    FiCreditCard,
    FiHome,
    FiLogOut,
    FiMapPin,
    FiPackage,
    FiPhone,
    FiUser,
    FiX,
    FiArrowRight,
} from "react-icons/fi";
import Brand from "../common/Brand";

function Notice({ message, onClose, isError }) {
    if (!message) return null;
    return (
        <div className={`demo-notice${isError ? " is-error" : ""}`} role={isError ? "alert" : "status"}>
            {isError ? <FiAlertCircle aria-hidden="true" /> : <FiCheckCircle aria-hidden="true" />}
            <span>{message}</span>
            <button type="button" aria-label="Dismiss notification" onClick={onClose}><FiX /></button>
        </div>
    );
}

export default function RiderShell({ profile, onLogout, notice, noticeError = false, onDismiss }) {
    const { pathname } = useLocation();
    const crumb = pathname.startsWith("/delivery") ? "Active delivery" : "Preview mode";
    const navItems = [
        { to: "/home", label: "Rides", icon: FiMapPin },
        { to: "/dashboard", label: "Overview", icon: FiHome, end: true },
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
                    <div className="breadcrumbs">Rider portal <FiChevronRight /> <span>{crumb}</span></div>
                    <div className="topbar-actions">
                        <span className="preview-pill"><span /> Sample data</span>
                        <button className="icon-button notification-button" type="button" aria-label="Notifications" onClick={() => window.alert("You’re all caught up.")}><FiBell /><span /></button>
                        <span className="topbar-user">
                            <span className="topbar-user-copy"><strong>{profile.name}</strong><small>Rider</small></span>
                            <span className="topbar-avatar" aria-hidden="true">{profile.name.slice(0, 1).toUpperCase()}</span>
                        </span>
                    </div>
                </header>
                {notice && <Notice message={notice} onClose={onDismiss} isError={noticeError} />}
                <main className="page-content"><Outlet /></main>
                <nav className="mobile-nav" aria-label="Mobile navigation">
                    {navItems.map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} aria-label={label} className={({ isActive }) => isActive ? "mobile-nav-link selected" : "mobile-nav-link"}><Icon /><span>{label}</span></NavLink>)}
                </nav>
            </div>
        </div>
    );
}