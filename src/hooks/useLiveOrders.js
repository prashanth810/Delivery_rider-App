import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { io } from "socket.io-client";
import { getallorders, getacceptrides, liveOrderAdded, liveOrderRemoved } from "../redux/Slices/OrdersSlice";

// socket.io must connect to the server origin only (a path would be read as a namespace)
const socketOrigin = () => {
    try { return new URL(import.meta.env.VITE_DELIVERY_API_URL).origin; }
    catch { return import.meta.env.VITE_DELIVERY_API_URL; }
};

// Keeps the "latest orders" list updated automatically, no manual refresh needed.
const useLiveOrders = (token, online) => {
    const dispatch = useDispatch();

    // live socket events from the rider service
    useEffect(() => {
        if (!token) return undefined;

        const socket = io(socketOrigin(), { auth: { token } });
        const refetch = () => dispatch(getallorders({ silent: true }));

        socket.on("delivery:new-job", (job) => dispatch(liveOrderAdded(job)));
        socket.on("delivery:unavailable", ({ deliveryId }) => dispatch(liveOrderRemoved(deliveryId)));
        socket.on("delivery:sync", refetch);
        socket.on("delivery:assigned", () => dispatch(getacceptrides()));
        socket.on("delivery:cancelled", () => dispatch(getacceptrides()));

        return () => socket.disconnect();
    }, [token, dispatch]);

    // when the rider goes online: load once, then a slow safety-net refresh
    useEffect(() => {
        if (!token || !online) return undefined;
        dispatch(getallorders({ silent: true }));
        const timer = setInterval(() => dispatch(getallorders({ silent: true })), 30000);
        return () => clearInterval(timer);
    }, [token, online, dispatch]);
};

export default useLiveOrders;