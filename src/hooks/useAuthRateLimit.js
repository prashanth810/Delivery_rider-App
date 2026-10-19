import { useCallback, useEffect, useState } from "react";

const AUTH_COOLDOWN_KEY = "authRateLimitUntil";
const AUTH_COOLDOWN_SECONDS = 5 * 60;

const getRemainingSeconds = () => {
    const expiresAt = Number(sessionStorage.getItem(AUTH_COOLDOWN_KEY));

    if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
        sessionStorage.removeItem(AUTH_COOLDOWN_KEY);
        return 0;
    }

    return Math.ceil((expiresAt - Date.now()) / 1000);
};

export const isRateLimitError = (error) => {
    if (error?.status === 429 || error?.response?.status === 429) {
        return true;
    }

    const message = typeof error === "string"
        ? error
        : error?.message || error?.data?.message || error?.response?.data?.message;

    return /too many requests|rate.?limit/i.test(message || "");
};

const formatCountdown = (seconds) =>
    `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

const useAuthRateLimit = () => {
    const [remainingSeconds, setRemainingSeconds] = useState(getRemainingSeconds);

    useEffect(() => {
        const timer = window.setInterval(() => {
            setRemainingSeconds(getRemainingSeconds());
        }, 1000);

        return () => window.clearInterval(timer);
    }, []);

    const startCooldown = useCallback((error) => {
        if (!isRateLimitError(error)) return false;

        const existingExpiry = Number(sessionStorage.getItem(AUTH_COOLDOWN_KEY));
        if (!Number.isFinite(existingExpiry) || existingExpiry <= Date.now()) {
            sessionStorage.setItem(
                AUTH_COOLDOWN_KEY,
                String(Date.now() + AUTH_COOLDOWN_SECONDS * 1000),
            );
        }

        setRemainingSeconds(getRemainingSeconds());
        return true;
    }, []);

    return {
        remainingSeconds,
        countdownLabel: formatCountdown(remainingSeconds),
        startCooldown,
    };
};

export default useAuthRateLimit;
