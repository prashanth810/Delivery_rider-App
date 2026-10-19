import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FiX, FiShield } from "react-icons/fi";
import { Button } from "./ui";
import { cancelOtp, resendOtp, verifyOtp, clearError } from "../redux/Slices/AuthSlice";
import { showErrorToast, showSuccessToast } from "./Toast";

const LEN = 6;
const RESEND_SECONDS = 30;
const DEMO = import.meta.env.VITE_USE_MOCK !== "false";

const OtpModal = ({ phone, onVerified }) => {
    const dispatch = useDispatch();
    const { loading, error } = useSelector((s) => s.auth);
    const [digits, setDigits] = useState(Array(LEN).fill(""));
    const [seconds, setSeconds] = useState(RESEND_SECONDS);
    const refs = useRef([]);

    useEffect(() => { refs.current[0]?.focus(); dispatch(clearError()); }, [dispatch]);
    useEffect(() => {
        if (seconds <= 0) return;
        const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
        return () => clearTimeout(t);
    }, [seconds]);

    const setAt = (i, v) => setDigits((d) => d.map((x, idx) => (idx === i ? v : x)));
    const onChange = (i, e) => {
        const v = e.target.value.replace(/\D/g, "").slice(-1);
        setAt(i, v);
        if (v && i < LEN - 1) refs.current[i + 1]?.focus();
    };
    const onKeyDown = (i, e) => {
        if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
        if (e.key === "Enter") submit();
    };
    const onPaste = (e) => {
        const p = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, LEN);
        if (!p) return;
        e.preventDefault();
        setDigits(Array.from({ length: LEN }, (_, i) => p[i] || ""));
        refs.current[Math.min(p.length, LEN - 1)]?.focus();
    };

    const otp = digits.join("");
    const submit = async () => {
        if (otp.length < LEN) return showErrorToast("Enter the 6-digit OTP");
        const res = await dispatch(verifyOtp({ phone, otp }));
        if (verifyOtp.fulfilled.match(res)) {
            showSuccessToast("Registered successfully! Complete your verification to start earning.");
            onVerified();
        } else {
            showErrorToast(res.payload || "Verification failed");
            setDigits(Array(LEN).fill(""));
            refs.current[0]?.focus();
        }
    };
    const resend = async () => {
        const res = await dispatch(resendOtp({ phone }));
        if (resendOtp.fulfilled.match(res)) { showSuccessToast("OTP sent again"); setSeconds(RESEND_SECONDS); }
        else showErrorToast(res.payload || "Could not resend OTP");
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
            <div className="animate-pop relative w-full max-w-sm rounded-3xl bg-white p-7 shadow-2xl">
                <button onClick={() => dispatch(cancelOtp())} className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100" aria-label="Close">
                    <FiX />
                </button>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-600"><FiShield size={26} /></div>
                <h3 className="mt-4 text-center text-xl font-extrabold text-brand-900">Verify phone number</h3>
                <p className="mt-1 text-center text-sm text-slate-500">Enter the 6-digit code sent to<br /><b className="text-slate-700">+91 {phone}</b></p>

                <div className="mt-6 flex justify-between gap-2" onPaste={onPaste}>
                    {digits.map((d, i) => (
                        <input
                            key={i} ref={(el) => (refs.current[i] = el)}
                            value={d} inputMode="numeric" maxLength={1}
                            onChange={(e) => onChange(i, e)} onKeyDown={(e) => onKeyDown(i, e)}
                            className={`h-12 w-11 rounded-xl border-2 text-center text-lg font-bold outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100 ${d ? "border-brand-500 bg-brand-50" : "border-slate-200"}`}
                        />
                    ))}
                </div>
                {error && <p className="mt-3 text-center text-xs text-red-500">{error}</p>}
                {DEMO && <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-center text-xs text-amber-700">Demo mode – use OTP <b>123456</b></p>}

                <Button onClick={submit} loading={loading} className="mt-5 w-full">Verify & Register</Button>
                <p className="mt-4 text-center text-sm text-slate-500">
                    {seconds > 0 ? <>Resend OTP in <b>0:{String(seconds).padStart(2, "0")}</b></> :
                        <button onClick={resend} className="font-bold text-brand-600 hover:underline">Resend OTP</button>}
                </p>
            </div>
        </div>
    );
};
export default OtpModal;