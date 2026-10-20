import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Outlet, Route, Routes, useNavigate } from "react-router-dom";
import { LoginScreen, RegisterScreen } from "./auth/AuthScreens";
import { AccountReady, OnboardingScreen } from "./onboarding/OnboardingScreens";
import { DashboardScreen, EarningsScreen, OrdersScreen, ProfileScreen } from "./portal/PortalScreens";
import RiderShell from "./layout/RiderShell";
import PickupMapScreen from "./pickup/PickupMapScreen";
import DeliveryDetails from "./pickup/Deliverydetails";
import { acceptbooking, getallorders } from "../redux/Slices/OrdersSlice";
import { riderLogout } from "../redux/Slices/AuthSlice";
import "./UiDemo.css";

const ONLINE_KEY = "freshrider_online_v1";
const loadOnline = () => { try { return localStorage.getItem(ONLINE_KEY) === "true"; } catch { return false; } };

const mapAvailableOrder = (delivery) => {
    const dropArea = delivery.address || delivery.dropArea || {};
    const items = Array.isArray(delivery.items) ? delivery.items : [];
    const orderNo = delivery.orderId || delivery._id;
    const itemNames = items.map((item) => item.name).filter(Boolean);
    const amountToCollect = Number(delivery.amountToCollect);
    const addressLines = [
        dropArea.building_number,
        dropArea.street,
    ].filter(Boolean);

    return {
        ...delivery,
        id: delivery._id,
        orderNo,
        store: `Order #${String(orderNo || "").slice(-6)}`,
        address: delivery.pickupAddress || "",
        pickupAddress: delivery.pickupAddress || "",
        area: [dropArea.city, dropArea.pincode, dropArea.landmark].filter(Boolean).join(", "),
        dropAddress: addressLines.length ? addressLines.join(", ") : dropArea.city || "",
        dropLine2: [dropArea.city, dropArea.state, dropArea.pincode].filter(Boolean).join(", "),
        addressType: dropArea.address_type || "",
        customer: {
            name: delivery.customerName || dropArea.full_name || "",
            phone: String(delivery.customerPhone || dropArea.phone || ""),
        },
        notes: dropArea.landmark ? `Landmark: ${dropArea.landmark}` : "",
        itemsSummary: itemNames.join(", "),
        items: items.map((item) => ({
            ...item,
            qty: item.quantity,
            note: item.weight || "",
        })),
        amountToCollect: Number.isFinite(amountToCollect) ? amountToCollect : 0,
        status: "New",
    };
};

// Random 4-digit OTP for the customer handoff.
const generateOtp = () => String(1000 + (crypto.getRandomValues(new Uint32Array(1))[0] % 9000));

function GuestOnly() {
    const token = useSelector((state) => state.auth.token);
    return token ? <Navigate to="/home" replace /> : <Outlet />;
}

function RequireAuth() {
    const token = useSelector((state) => state.auth.token);
    return token ? <Outlet /> : <Navigate to="/login" replace />;
}

export default function UiDemo() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { token, user } = useSelector((state) => state.auth);
    const { orderloading, ordererror, orderlist } = useSelector((state) => state.orders.orderdata);
    const { acceptloading } = useSelector((state) => state.orders.accpetbooking);
    const [profile, setProfile] = useState(() => ({
        name: user?.name || user?.fullName || user?.email || "Rider",
        phone: user?.phone || user?.mobile || "",
        email: user?.email || "",
        vehicle: user?.vehicle || "Scooter",
        vehicleNumber: user?.vehicleNumber || "",
    }));
    const [form, setForm] = useState({ name: "Alex Rider" });
    const [online, setOnline] = useState(loadOnline);
    const [orderUpdates, setOrderUpdates] = useState({});
    const [notice, setNotice] = useState("");
    const [noticeError, setNoticeError] = useState(false);

    const availableOrders = useMemo(() => orderlist.map(mapAvailableOrder), [orderlist]);
    const orders = useMemo(
        () => availableOrders.map((order) => ({ ...order, ...orderUpdates[order.id] })),
        [availableOrders, orderUpdates],
    );

    useEffect(() => {
        if (token) dispatch(getallorders());
    }, [dispatch, token]);
    useEffect(() => { try { localStorage.setItem(ONLINE_KEY, String(online)); } catch { /* ignore */ } }, [online]);

    const nowTime = () => new Date().toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
    const updateOrder = (id, changes) => setOrderUpdates((current) => ({
        ...current,
        [id]: { ...current[id], ...changes },
    }));
    const showNotice = (message, isError = false) => {
        setNotice(message);
        setNoticeError(isError);
    };

    // Rider accepts a request -> open the new Delivery details page.
    // Only one delivery at a time: the order the rider has accepted but not yet delivered.
    const activeOrder = orders.find((order) => ["Accepted", "Picked up"].includes(order.status)) || null;

    const acceptOrder = async (id) => {
        if (!online) { showNotice("Go online to accept orders"); return; }
        if (activeOrder) { showNotice("Finish your current delivery before accepting a new one"); return; }
        try {
            const responseData = await dispatch(acceptbooking(id)).unwrap();
            const acceptedDelivery = responseData?.data?.data
                || responseData?.data
                || responseData?.delivery
                || responseData?.order
                || responseData;
            if (!acceptedDelivery || typeof acceptedDelivery !== "object") {
                throw new Error("The accept response did not include delivery details.");
            }

            const currentOrder = availableOrders.find((order) => order.id === id);
            const acceptedOrder = mapAvailableOrder({
                ...currentOrder,
                ...acceptedDelivery,
                _id: id,
                orderId: acceptedDelivery.orderId || currentOrder?.orderId,
            });
            updateOrder(id, {
                ...acceptedOrder,
                status: "Accepted",
                acceptedAt: nowTime(),
                deliveryOtp: acceptedDelivery.deliveryOtp || acceptedDelivery.otp || generateOtp(),
            });
            showNotice(`${id} accepted successfully`);
            navigate(`/delivery/${id}`);
        } catch (error) {
            showNotice(typeof error === "string" ? error : error.message || "Unable to accept this delivery. Please try again.", true);
        }
    };
    const rejectOrder = (id) => {
        if (!online || activeOrder) return;
        updateOrder(id, { status: "Rejected" });
        showNotice(`${id} request rejected`);
    };
    const confirmPickup = (id) => {
        updateOrder(id, { status: "Picked up", pickedAt: nowTime() });
        showNotice("Pickup confirmed. Head to the customer.");
    };
    // Delivery is completed only when the OTP entered by the rider matches the customer's OTP.
    // (No backend yet: swap this check for your "verify delivery OTP" API call when it exists.)
    const confirmDelivery = (id, otp) => {
        const order = orders.find((item) => item.id === id);
        if (!order || order.deliveryOtp !== otp) return false;
        updateOrder(id, { status: "Delivered", deliveredAt: nowTime() });
        showNotice("OTP verified. Delivery completed, great job!");
        return true;
    };
    const resendOtp = (id) => {
        updateOrder(id, { deliveryOtp: generateOtp() });
        showNotice("A new OTP was sent to the customer");
    };
    const completeOnboarding = () => {
        showNotice("Rider setup preview complete");
        navigate("/account-ready");
    };
    const continueToDashboard = (authenticatedUser) => {
        if (authenticatedUser) {
            setProfile((current) => ({
                ...current,
                name: authenticatedUser.name || authenticatedUser.fullName || authenticatedUser.email || current.name,
                phone: authenticatedUser.phone || authenticatedUser.mobile || current.phone,
                email: authenticatedUser.email || current.email,
            }));
        }
        showNotice("");
        navigate("/home", { replace: true });
    };
    const logout = async () => {
        setOnline(false);
        showNotice("");
        await dispatch(riderLogout());
        navigate("/login", { replace: true });
    };

    return (
        <Routes>
            <Route path="/" element={<Navigate to={token ? "/home" : "/login"} replace />} />
            <Route element={<GuestOnly />}>
                <Route path="/login" element={<LoginScreen onContinue={continueToDashboard} />} />
                <Route path="/register" element={<RegisterScreen onContinue={({ name, phone, email }) => {
                    setProfile((current) => ({ ...current, name, phone: `+91 ${phone}`, email }));
                    setForm((current) => ({ ...current, name }));
                    navigate("/onboarding/personal");
                }} />} />
            </Route>
            <Route element={<RequireAuth />}>
                <Route path="/onboarding" element={<Navigate to="/onboarding/personal" replace />} />
                <Route path="/onboarding/:step" element={<OnboardingScreen form={form} setForm={setForm} onFinish={completeOnboarding} />} />
                <Route path="/account-ready" element={<AccountReady onContinue={() => continueToDashboard(user)} />} />
                <Route element={<RiderShell profile={profile} onLogout={logout} notice={notice} noticeError={noticeError} onDismiss={() => showNotice("")} />}>
                    <Route path="/home" element={<PickupMapScreen orders={orders} onAccept={acceptOrder} onReject={rejectOrder} online={online} setOnline={setOnline} activeOrder={activeOrder} ordersLoading={orderloading} ordersError={ordererror} onRetry={() => dispatch(getallorders())} acceptLoading={acceptloading} />} />
                    <Route path="/pickup" element={<PickupMapScreen orders={orders} onAccept={acceptOrder} onReject={rejectOrder} online={online} setOnline={setOnline} activeOrder={activeOrder} ordersLoading={orderloading} ordersError={ordererror} onRetry={() => dispatch(getallorders())} acceptLoading={acceptloading} />} />
                    <Route path="/dashboard" element={<DashboardScreen profile={profile} online={online} setOnline={setOnline} orders={orders} onAccept={acceptOrder} activeOrder={activeOrder} />} />
                    <Route path="/delivery/:id" element={<DeliveryDetails orders={orders} onConfirmPickup={confirmPickup} onConfirmDelivery={confirmDelivery} onResendOtp={resendOtp} />} />
                    <Route path="/orders" element={<OrdersScreen orders={orders} />} />
                    <Route path="/earnings" element={<EarningsScreen />} />
                    <Route path="/profile" element={<ProfileScreen profile={profile} setProfile={setProfile} onNotify={setNotice} />} />
                </Route>
            </Route>
            <Route path="*" element={<Navigate to={token ? "/home" : "/login"} replace />} />
        </Routes>
    );
}