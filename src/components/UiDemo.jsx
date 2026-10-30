import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Outlet, Route, Routes, useNavigate } from "react-router-dom";
import { LoginScreen, RegisterScreen } from "./auth/AuthScreens";
import { AccountReady, OnboardingScreen } from "./onboarding/OnboardingScreens";
import { DashboardScreen, EarningsScreen, OrdersScreen, ProfileScreen } from "./portal/PortalScreens";
import RiderShell from "./layout/RiderShell";
import PickupMapScreen from "./pickup/PickupMapScreen";
import DeliveryDetails from "./pickup/Deliverydetails";
import { acceptbooking, acceptpickup, deliverysuccess, getacceptrides, getallorders } from "../redux/Slices/OrdersSlice";
import useLiveOrders from "../hooks/useLiveOrders";
import { riderLogout } from "../redux/Slices/AuthSlice";
import { RiderRegisterApi } from "../redux/services/Apis";
import { draft } from "../services/onboardingDraft";
import "./UiDemo.css";

const ONLINE_KEY = "freshrider_online_v1";
const loadOnline = () => { try { return localStorage.getItem(ONLINE_KEY) === "true"; } catch { return false; } };

const API_ORDER_STATUSES = {
    ACCEPTED: "Accepted",
    PICKED_UP: "Picked up",
    PICKEDUP: "Picked up",
    DELIVERED: "Delivered",
};

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

    const statusKey = String(delivery.status || "").toUpperCase().replace(/[\s-]+/g, "_");

    return {
        ...delivery,
        id: delivery._id,
        orderNo,
        store: delivery.storeName || `Order #${String(orderNo || "").slice(-6)}`,
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
        status: API_ORDER_STATUSES[statusKey] || "New",
    };
};

// Random 4-digit OTP for the customer handoff.
const generateOtp = () => String(1000 + (crypto.getRandomValues(new Uint32Array(1))[0] % 9000));

function GuestOnly() {
    const token = useSelector((state) => state.auth.token);
    return token ? <Navigate to="/home" replace /> : <Outlet />;
}

// Onboarding steps are only for a rider who passed the OTP on /register (account is NOT created yet).
function RequireSignup({ verified }) {
    return verified ? <Outlet /> : <Navigate to="/register" replace />;
}

const dataUrlToBlob = (dataUrl) => {
    const [head, body] = dataUrl.split(",");
    const mime = /data:(.*?);/.exec(head)?.[1] || "image/jpeg";
    const bytes = Uint8Array.from(atob(body), (c) => c.charCodeAt(0));
    return new Blob([bytes], { type: mime });
};
const apiError = (error) =>
    error?.response?.data?.message || error?.response?.data?.error ||
    (typeof error?.response?.data === "string" ? error.response.data : null) ||
    error?.message || "Could not create your account. Please try again.";

function RequireAuth() {
    const token = useSelector((state) => state.auth.token);
    return token ? <Outlet /> : <Navigate to="/login" replace />;
}

export default function UiDemo() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { token, user } = useSelector((state) => state.auth);
    const { orderloading, ordererror, orderlist } = useSelector((state) => state.orders.orderdata);
    const { acceptloading, acceptdata, accepterror } = useSelector((state) => state.orders.accpetbooking);
    const [profile, setProfile] = useState(() => ({
        name: user?.name || user?.fullName || user?.email || "Rider",
        phone: user?.phone || user?.mobile || "",
        email: user?.email || "",
        vehicle: user?.vehicle || "Scooter",
        vehicleNumber: user?.vehicleNumber || "",
    }));
    // sign-up draft: filled during OTP + onboarding, sent to the server only at the final "Create my account"
    const [form, setForm] = useState(() => draft.load());
    const [docFiles, setDocFiles] = useState(() => draft.getFiles());
    useEffect(() => { if (form.verified) draft.save(form); }, [form]);
    const setDocFile = useCallback((key, file) => setDocFiles(draft.setFile(key, file)), []);
    const resetSignup = useCallback(() => { draft.clear(); setForm({}); setDocFiles({}); }, []);
    const [online, setOnline] = useState(loadOnline);
    useLiveOrders(token, online);
    const [orderUpdates, setOrderUpdates] = useState({});
    const [notice, setNotice] = useState("");
    const [noticeError, setNoticeError] = useState(false);

    const availableOrders = useMemo(() => orderlist.map(mapAvailableOrder), [orderlist]);
    const orders = useMemo(
        () => availableOrders.map((order) => ({ ...order, ...orderUpdates[order.id] })),
        [availableOrders, orderUpdates],
    );
    const acceptedOrders = useMemo(
        () => (Array.isArray(acceptdata) ? acceptdata : [])
            .map(mapAvailableOrder)
            .map((order) => ({ ...order, ...orderUpdates[order.id] })),
        [acceptdata, orderUpdates],
    );
    const activeOrders = acceptedOrders.filter((order) => ["Accepted", "Picked up"].includes(order.status));
    const activeOrder = activeOrders[0] || null;

    useEffect(() => {
        if (token) {
            dispatch(getallorders());
            dispatch(getacceptrides());
        }
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
            dispatch(getacceptrides()).unwrap().catch((error) => {
                showNotice(
                    `Ride accepted, but active deliveries could not be refreshed: ${typeof error === "string" ? error : error.message || "Please refresh the page."}`,
                    true,
                );
            });
        } catch (error) {
            showNotice(typeof error === "string" ? error : error.message || "Unable to accept this delivery. Please try again.", true);
        }
    };
    const rejectOrder = (id) => {
        if (!online || activeOrder) return;
        updateOrder(id, { status: "Rejected" });
        showNotice(`${id} request rejected`);
    };
    // Pickup is saved on the server first, the screen moves to "Picked up" only after success.
    const confirmPickup = async (id) => {
        try {
            await dispatch(acceptpickup(id)).unwrap();
            updateOrder(id, { status: "Picked up", pickedAt: nowTime() });
            showNotice("Pickup confirmed. OTP sent to customer email. Head to the customer.");
        } catch (error) {
            showNotice(typeof error === "string" ? error : error?.message || "Unable to confirm the pickup. Please try again.", true);
        }
    };
    // Delivery is completed only when the server accepts the OTP the customer gave.
    // Returns { ok: true } or { ok: false, message } so the OTP boxes can show the exact error.
    const confirmDelivery = async (id, otp) => {
        try {
            await dispatch(deliverysuccess({ id, otp })).unwrap();
            updateOrder(id, { status: "Delivered", deliveredAt: nowTime() });
            showNotice("OTP verified. Delivery completed, great job!");
            return { ok: true };
        } catch (error) {
            return { ok: false, message: typeof error === "string" ? error : error?.message || "Unable to verify the OTP. Please try again." };
        }
    };
    // OTP passed on /register -> start the 5 onboarding steps (no account yet)
    const startSignup = ({ name, phone, email, password }) => {
        draft.clear();
        draft.setPassword(password);
        setDocFiles({});
        const next = { name, phone, email, verified: true, reached: 0 };
        draft.save(next);
        setForm(next);
        navigate("/onboarding/personal", { replace: true });
    };
    const cancelSignup = () => { resetSignup(); navigate("/register", { replace: true }); };
    // Final step: create the rider account on the server with everything collected.
    const createAccount = async (passwordAgain) => {
        const password = draft.getPassword() || passwordAgain;
        if (!password) return { ok: false, message: "Please enter your password to create the account." };
        const body = new FormData();
        const add = (key, value) => { if (value !== undefined && value !== null && value !== "") body.append(key, value); };
        add("name", form.name); add("fullName", form.name);
        add("email", form.email); add("phone", form.phone); add("password", password);
        add("dob", form.dob); add("gender", form.gender);
        add("address", form.address); add("city", form.city); add("pincode", form.pincode);
        add("vehicleType", form.vehicleType);
        add("vehicleNumber", (form.vehicleNumber || "").replace(/[\s-]/g, "").toUpperCase());
        add("vehicleModel", form.vehicleModel);
        Object.entries(docFiles).forEach(([key, file]) => body.append(key, file));
        if (form.photo) body.append("photo", dataUrlToBlob(form.photo), "selfie.jpg");
        try {
            await RiderRegisterApi(body);
            navigate("/account-ready", { replace: true, state: { created: true, email: form.email } });
            return { ok: true };
        } catch (error) {
            return { ok: false, message: apiError(error) };
        }
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
                <Route path="/register" element={<RegisterScreen onContinue={startSignup} />} />
            </Route>
            <Route element={<RequireSignup verified={Boolean(form.verified)} />}>
                <Route path="/onboarding" element={<Navigate to="/onboarding/personal" replace />} />
                <Route path="/onboarding/:step" element={<OnboardingScreen form={form} setForm={setForm} files={docFiles} setFile={setDocFile} hasPassword={Boolean(draft.getPassword())} onSubmit={createAccount} onCancel={cancelSignup} />} />
            </Route>
            <Route path="/account-ready" element={<AccountReady onDone={resetSignup} />} />
            <Route element={<RequireAuth />}>
                <Route element={<RiderShell profile={profile} onLogout={logout} notice={notice} noticeError={noticeError} onDismiss={() => showNotice("")} />}>
                    <Route path="/home" element={<PickupMapScreen orders={orders} onAccept={acceptOrder} onReject={rejectOrder} online={online} setOnline={setOnline} activeOrder={activeOrder} activeOrders={activeOrders} ordersLoading={orderloading} ordersError={ordererror} onRetry={() => dispatch(getallorders())} acceptLoading={acceptloading} acceptedRidesError={accepterror} />} />
                    <Route path="/pickup" element={<PickupMapScreen orders={orders} onAccept={acceptOrder} onReject={rejectOrder} online={online} setOnline={setOnline} activeOrder={activeOrder} activeOrders={activeOrders} ordersLoading={orderloading} ordersError={ordererror} onRetry={() => dispatch(getallorders())} acceptLoading={acceptloading} acceptedRidesError={accepterror} />} />
                    <Route path="/dashboard" element={<DashboardScreen profile={profile} online={online} setOnline={setOnline} orders={orders} onAccept={acceptOrder} activeOrder={activeOrder} />} />
                    <Route path="/delivery/:id" element={<DeliveryDetails orders={orders} onConfirmPickup={confirmPickup} onConfirmDelivery={confirmDelivery} />} />
                    <Route path="/orders" element={<OrdersScreen orders={orders} />} />
                    <Route path="/earnings" element={<EarningsScreen />} />
                    <Route path="/profile" element={<ProfileScreen profile={profile} setProfile={setProfile} onNotify={setNotice} />} />
                </Route>
            </Route>
            <Route path="*" element={<Navigate to={token ? "/home" : "/login"} replace />} />
        </Routes>
    );
}