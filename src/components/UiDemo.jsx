import { useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { LoginScreen, RegisterScreen } from "./auth/AuthScreens";
import { AccountReady, OnboardingScreen } from "./onboarding/OnboardingScreens";
import { DashboardScreen, EarningsScreen, OrdersScreen, ProfileScreen } from "./portal/PortalScreens";
import RiderShell from "./layout/RiderShell";
import PickupMapScreen from "./pickup/PickupMapScreen";
import { INITIAL_ORDERS } from "./pickup/demoOrders";
import "./UiDemo.css";

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
    const rejectOrder = (id) => {
        setOrders((current) => current.map((order) => order.id === id ? { ...order, status: "Rejected" } : order));
        setNotice(`${id} request rejected`);
    };
    const completeOnboarding = () => {
        setNotice("Rider setup preview complete");
        navigate("/account-ready");
    };
    const continueToDashboard = (name) => {
        if (name) setProfile((current) => ({ ...current, name }));
        setNotice("");
        navigate("/home");
    };
    const logout = () => {
        setOnline(false);
        setNotice("");
        navigate("/login");
    };

    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginScreen onContinue={() => continueToDashboard()} />} />
            <Route path="/register" element={<RegisterScreen onContinue={({ name, phone, email }) => {
                setProfile((current) => ({ ...current, name, phone: `+91 ${phone}`, email }));
                setForm((current) => ({ ...current, name }));
                navigate("/onboarding/personal");
            }} />} />
            <Route path="/onboarding" element={<Navigate to="/onboarding/personal" replace />} />
            <Route path="/onboarding/:step" element={<OnboardingScreen form={form} setForm={setForm} onFinish={completeOnboarding} />} />
            <Route path="/account-ready" element={<AccountReady onContinue={() => continueToDashboard()} />} />
            <Route element={<RiderShell profile={profile} onLogout={logout} notice={notice} onDismiss={() => setNotice("")} />}>
                <Route path="/home" element={<PickupMapScreen orders={orders} onAccept={acceptOrder} onReject={rejectOrder} online={online} setOnline={setOnline} />} />
                <Route path="/pickup" element={<PickupMapScreen orders={orders} onAccept={acceptOrder} onReject={rejectOrder} online={online} setOnline={setOnline} />} />
                <Route path="/dashboard" element={<DashboardScreen profile={profile} online={online} setOnline={setOnline} orders={orders} onAccept={acceptOrder} />} />
                <Route path="/orders" element={<OrdersScreen orders={orders} onAccept={acceptOrder} />} />
                <Route path="/earnings" element={<EarningsScreen />} />
                <Route path="/profile" element={<ProfileScreen profile={profile} setProfile={setProfile} onNotify={setNotice} />} />
            </Route>
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}
