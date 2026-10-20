import { useCallback, useEffect, useState } from "react";

const NOMINATIM = "https://nominatim.openstreetmap.org";

export const hasPoint = (point) => Number.isFinite(point?.lat) && Number.isFinite(point?.lng);

// Straight-line distance in km between two {lat, lng} points.
export const haversineKm = (a, b) => {
    const rad = (deg) => (deg * Math.PI) / 180;
    const dLat = rad(b.lat - a.lat);
    const dLng = rad(b.lng - a.lng);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
    return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
};

const shortAddress = (name = "") => name.split(",").slice(0, 3).join(",").trim();

/**
 * Rider's live GPS position (browser geolocation).
 * status: "locating" | "live" | "denied" | "unavailable" | "unsupported"
 * position is null until the browser gives us a fix.
 */
export function useRiderLocation() {
    const supported = typeof navigator !== "undefined" && "geolocation" in navigator;
    const [state, setState] = useState({ position: null, accuracy: null, status: supported ? "locating" : "unsupported" });

    const onFix = useCallback((p) => {
        setState({
            position: { lat: p.coords.latitude, lng: p.coords.longitude },
            accuracy: p.coords.accuracy, // metres: smaller = more precise
            status: "live",
        });
    }, []);
    const onError = useCallback((error) => {
        setState((current) => {
            if (error.code === 1) return { position: null, accuracy: null, status: "denied" };
            // timeouts / temporary errors: keep the last known position if we have one
            return current.position ? current : { position: null, accuracy: null, status: "unavailable" };
        });
    }, []);

    useEffect(() => {
        if (!supported) return undefined;
        const watchId = navigator.geolocation.watchPosition(onFix, onError, {
            enableHighAccuracy: true, // ask for GPS, not just Wi-Fi / IP
            maximumAge: 0, // never reuse an old cached position
            timeout: 30000,
        });
        return () => navigator.geolocation.clearWatch(watchId);
    }, [supported, onFix, onError]);

    // Lets the rider try again after allowing location access in the browser.
    const retry = useCallback(() => {
        if (!supported) return;
        setState((current) => ({ ...current, status: current.position ? "live" : "locating" }));
        navigator.geolocation.getCurrentPosition(onFix, onError, { enableHighAccuracy: true, maximumAge: 0, timeout: 30000 });
    }, [supported, onFix, onError]);

    return { ...state, retry };
}

// 25 -> "±25 m", 2300 -> "±2.3 km"
export const formatAccuracy = (meters) => (meters == null ? "" : meters < 1000 ? `±${Math.round(meters)} m` : `±${(meters / 1000).toFixed(1)} km`);
// Laptops / desktops have no GPS, so browsers estimate from Wi-Fi or IP, which can be hundreds of metres or km off.
export const isApproximate = (meters) => meters != null && meters > 150;

/** Human readable address for the rider's current position (OpenStreetMap reverse geocoding). */
export function useAddressOf(point) {
    const [result, setResult] = useState({ key: "", text: "" });
    const key = hasPoint(point) ? `${point.lat.toFixed(3)},${point.lng.toFixed(3)}` : "";

    useEffect(() => {
        if (!key) return undefined;
        const [lat, lng] = key.split(",");
        const controller = new AbortController();
        fetch(`${NOMINATIM}/reverse?format=jsonv2&zoom=17&lat=${lat}&lon=${lng}`, { signal: controller.signal })
            .then((response) => response.json())
            .then((data) => setResult({ key, text: shortAddress(data?.display_name) }))
            .catch(() => { /* ignore: we just don't show an address */ });
        return () => controller.abort();
    }, [key]);

    return result.key === key ? result.text : "";
}

/**
 * Gives the map a coordinate for an order address.
 * Uses the order's own lat/lng when it has them, otherwise looks the address up on OpenStreetMap.
 */
export function useResolvedPoint(point, address) {
    const [found, setFound] = useState({ address: "", point: null });
    const known = hasPoint(point);

    useEffect(() => {
        if (known || !address) return undefined;
        const controller = new AbortController();
        fetch(`${NOMINATIM}/search?format=jsonv2&limit=1&countrycodes=in&q=${encodeURIComponent(address)}`, { signal: controller.signal })
            .then((response) => response.json())
            .then((rows) => {
                const row = rows?.[0];
                if (row) setFound({ address, point: { lat: Number(row.lat), lng: Number(row.lon) } });
            })
            .catch(() => { /* ignore */ });
        return () => controller.abort();
    }, [known, address]);

    if (known) return point;
    return found.address === address ? found.point : null;
}