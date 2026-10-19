import { useState } from "react";
import { FiEye, FiEyeOff, FiChevronDown } from "react-icons/fi";

export const Logo = ({ light = false, size = "text-xl" }) => (
    <div className="flex items-center gap-2">
        <svg width="34" height="34" viewBox="0 0 48 48" fill="none">
            <rect width="48" height="48" rx="12" fill={light ? "#ffffff22" : "#12804a"} />
            <circle cx="14" cy="32" r="5" stroke="#fff" strokeWidth="2.5" />
            <circle cx="35" cy="32" r="5" stroke="#fff" strokeWidth="2.5" />
            <path d="M14 32l6-10h8l7 10M24 22l-2-5h-4M28 22l-1 10" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className={`${size} font-extrabold tracking-tight ${light ? "text-white" : "text-brand-900"}`}>QuicRider</span>
    </div>
);

export const Field = ({ label, icon: Icon, error, hint, type = "text", className = "", ...props }) => {
    const [show, setShow] = useState(false);
    const isPw = type === "password";
    return (
        <label className={`block ${className}`}>
            {label && <span className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</span>}
            <span className={`flex items-center gap-2 rounded-xl border bg-white px-3.5 transition focus-within:ring-4 focus-within:ring-brand-100 ${error ? "border-red-400" : "border-slate-200 focus-within:border-brand-500"}`}>
                {Icon && <Icon className="h-4 w-4 shrink-0 text-slate-400" />}
                <input
                    type={isPw && show ? "text" : type}
                    className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-slate-400"
                    {...props}
                />
                {isPw && (
                    <button type="button" onClick={() => setShow((s) => !s)} className="text-slate-400 hover:text-slate-600" aria-label="Toggle password">
                        {show ? <FiEyeOff /> : <FiEye />}
                    </button>
                )}
            </span>
            {error ? <span className="mt-1 block text-xs text-red-500">{error}</span>
                : hint ? <span className="mt-1 block text-xs text-slate-400">{hint}</span> : null}
        </label>
    );
};

export const Select = ({ label, options, error, className = "", placeholder = "Select", ...props }) => (
    <label className={`block ${className}`}>
        {label && <span className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</span>}
        <span className={`relative flex items-center rounded-xl border bg-white focus-within:ring-4 focus-within:ring-brand-100 ${error ? "border-red-400" : "border-slate-200 focus-within:border-brand-500"}`}>
            <select className="w-full appearance-none bg-transparent px-3.5 py-3 text-sm outline-none" {...props}>
                <option value="">{placeholder}</option>
                {options.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
            <FiChevronDown className="pointer-events-none absolute right-3 text-slate-400" />
        </span>
        {error && <span className="mt-1 block text-xs text-red-500">{error}</span>}
    </label>
);

export const Button = ({ children, loading, variant = "primary", className = "", ...props }) => {
    const styles = {
        primary: "bg-brand-600 text-white hover:bg-brand-700 shadow-lg shadow-brand-600/20 disabled:opacity-60",
        outline: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
        ghost: "text-brand-700 hover:bg-brand-50",
    }[variant];
    return (
        <button
            disabled={loading || props.disabled}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition active:scale-[.98] disabled:cursor-not-allowed ${styles} ${className}`}
            {...props}
        >
            {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
            {children}
        </button>
    );
};

export const Spinner = ({ full = true }) => (
    <div className={`flex items-center justify-center ${full ? "min-h-screen" : "py-16"}`}>
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-brand-100 border-t-brand-600" />
    </div>
);

export const Illustration = ({ className = "" }) => (
    <svg viewBox="0 0 520 420" className={className} fill="none">
        <rect x="40" y="150" width="60" height="200" rx="4" fill="#ffffff22" />
        <rect x="110" y="80" width="70" height="270" rx="4" fill="#ffffff2e" />
        <rect x="360" y="120" width="80" height="230" rx="4" fill="#ffffff22" />
        <rect x="450" y="190" width="50" height="160" rx="4" fill="#ffffff2e" />
        <g stroke="#ffffff44" strokeWidth="3">{[110, 140, 170, 200].map((y) => <path key={y} d={`M125 ${y}h40M375 ${y + 20}h50`} />)}</g>
        <path d="M0 350h520v70H0z" fill="#06291f" />
        <path d="M40 385h60M160 385h60M280 385h60M400 385h60" stroke="#ffffff55" strokeWidth="4" strokeLinecap="round" />
        <g className="animate-floaty">
            <circle cx="170" cy="345" r="38" fill="#0b3d2e" stroke="#fff" strokeWidth="6" />
            <circle cx="340" cy="345" r="38" fill="#0b3d2e" stroke="#fff" strokeWidth="6" />
            <path d="M170 345l50-60h60l60 60M280 285l-20-50h-35" stroke="#34d399" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="100" y="228" width="80" height="62" rx="8" fill="#12804a" stroke="#fff" strokeWidth="4" />
            <path d="M125 259h30M140 244v30" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
            <rect x="228" y="168" width="44" height="76" rx="18" fill="#12804a" />
            <circle cx="252" cy="148" r="22" fill="#fcd9b6" />
            <path d="M228 146a24 24 0 0 1 48 0z" fill="#0b3d2e" />
            <path d="M262 190l40 40" stroke="#fcd9b6" strokeWidth="9" strokeLinecap="round" />
            <path d="M240 240l-8 40 24 20" stroke="#0f172a" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        <g fill="#34d399"><path d="M90 60a14 14 0 1 1 28 0c0 14-14 28-14 28S90 74 90 60z" /><circle cx="104" cy="60" r="5" fill="#fff" /></g>
    </svg>
);