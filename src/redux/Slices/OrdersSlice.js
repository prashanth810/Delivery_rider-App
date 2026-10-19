import { createSlice } from "@reduxjs/toolkit";

const KEY = "qr_orders_v1";
export const DEFAULT_LOCATION = { lat: 17.4435, lng: 78.3772 }; // Hitech City, Hyderabad

const o = (id, store, customer, items, amount, pay, km, p, d, status = "new", extra = {}) => ({
    id, store, customer, items, amount, pay, km,
    pickup: { address: p[0], lat: p[1], lng: p[2] },
    drop: { address: d[0], lat: d[1], lng: d[2] },
    status, ...extra,
});

const seed = () => [
    o("QR4821", "Fresh Mart", "Anil Reddy", 6, 64, "Paid", 2.4, ["Banjara Hills, Rd No. 1", 17.4156, 78.4347], ["Jubilee Hills, Rd No. 36", 17.4326, 78.4071]),
    o("QR4822", "Green Basket", "Sneha K", 3, 82, "COD", 3.8, ["Madhapur, Ayyappa Society", 17.4486, 78.3908], ["Hitech City, Cyber Towers", 17.4435, 78.3772]),
    o("QR4823", "Daily Needs", "Ravi Teja", 9, 71, "Paid", 3.1, ["Gachibowli, DLF Rd", 17.4401, 78.3489], ["Kondapur, Botanical Garden", 17.46, 78.364]),
    o("QR4824", "Spice Kitchen", "Meena S", 2, 58, "COD", 2.2, ["Kukatpally, JNTU", 17.4948, 78.3996], ["KPHB Colony, Phase 3", 17.4849, 78.3915]),
    o("QR4790", "Fresh Mart", "Kiran P", 4, 66, "Paid", 2.9, ["Banjara Hills", 17.4156, 78.4347], ["Film Nagar", 17.4128, 78.4059], "delivered", { at: Date.now() - 3600000 }),
    o("QR4788", "Green Basket", "Divya R", 5, 74, "Paid", 3.4, ["Madhapur", 17.4486, 78.3908], ["Gachibowli", 17.4401, 78.3489], "delivered", { at: Date.now() - 90000000 }),
    o("QR4781", "Daily Needs", "Suresh B", 2, 49, "COD", 1.8, ["Kondapur", 17.46, 78.364], ["Madhapur", 17.4486, 78.3908], "cancelled", { at: Date.now() - 172800000, reason: "Customer unavailable" }),
];

const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || seed(); } catch { return seed(); } };
const persist = (orders) => { try { localStorage.setItem(KEY, JSON.stringify(orders)); } catch { /* ignore */ } };

const NEXT = { accepted: "picked", picked: "delivered" };

const OrdersSlice = createSlice({
    name: "orders",
    initialState: { list: load() },
    reducers: {
        acceptOrder: (s, { payload }) => {
            const x = s.list.find((i) => i.id === payload);
            if (x?.status === "new") x.status = "accepted";
            persist(s.list);
        },
        cancelOrder: (s, { payload: { id, reason } }) => {
            const x = s.list.find((i) => i.id === id);
            if (x && ["new", "accepted"].includes(x.status)) { x.status = "cancelled"; x.reason = reason; x.at = Date.now(); }
            persist(s.list);
        },
        advanceOrder: (s, { payload }) => {
            const x = s.list.find((i) => i.id === payload);
            if (x && NEXT[x.status]) { x.status = NEXT[x.status]; if (x.status === "delivered") x.at = Date.now(); }
            persist(s.list);
        },
        resetOrders: (s) => { s.list = seed(); persist(s.list); },
    },
});

export const { acceptOrder, cancelOrder, advanceOrder, resetOrders } = OrdersSlice.actions;
export default OrdersSlice.reducer;