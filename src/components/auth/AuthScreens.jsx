import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
    FiArrowRight,
    FiCheck,
    FiCheckCircle,
    FiLock,
    FiMail,
    FiMapPin,
    FiPhone,
    FiShield,
    FiUser,
    FiX,
} from "react-icons/fi";
import { FaMotorcycle } from "react-icons/fa";
import Brand from "../common/Brand";
import { handleriderlogin } from "../../redux/Slices/AuthSlice";

function AuthFrame({ children, mode }) {
    return (
        <main className="auth-screen">
            <aside className="auth-promo">
                <Link to="/login" className="auth-brand"><Brand light /></Link>
                <div className="auth-copy">
                    <span className="eyebrow eyebrow-light">YOUR CITY. YOUR ROUTE.</span>
                    <h1>Make every<br />ride <span>count.</span></h1>
                    <p>Flexible work, reliable payouts, and the freedom to ride on your schedule.</p>
                    <div className="auth-perks">
                        <span><FiCheckCircle /> Weekly payouts</span>
                        <span><FiCheckCircle /> Flexible hours</span>
                    </div>
                </div>
                <div className="promo-route" aria-hidden="true">
                    <span className="route-point route-point-start"><FiMapPin /></span>
                    <span className="route-dash" />
                    <span className="route-bike"><FaMotorcycle /></span>
                    <span className="route-dash" />
                    <span className="route-point route-point-end"><FiCheck /></span>
                    <span className="route-caption">A better way to deliver</span>
                </div>
                <p className="promo-footnote">A rider-first experience, built for your city.</p>
            </aside>
            <section className="auth-panel">
                <div className="auth-mobile-brand"><Brand /></div>
                <div className="auth-card">{children}</div>
                <p className="auth-switch">{mode === "login" ? "New to QuickRider?" : "Already riding with us?"}{" "}
                    <Link to={mode === "login" ? "/register" : "/login"}>{mode === "login" ? "Create an account" : "Sign in"}</Link>
                </p>
            </section>
        </main>
    );
}


export function LoginScreen({ onContinue }) {
    const dispatch = useDispatch();
    const loading = useSelector((state) => state.auth.riderlogin.loginloading);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const submit = async (event) => {
        event.preventDefault();
        setError("");

        const result = await dispatch(handleriderlogin({
            email: email.trim(),
            password,
        }));

        if (handleriderlogin.fulfilled.match(result)) {
            onContinue(result.payload.user);
        } else {
            setError(result.payload || "Login failed. Please check your details and try again.");
        }
    };

    return (
        <AuthFrame mode="login">
            <span className="eyebrow">RIDER PORTAL</span>
            <h2>Welcome back</h2>
            <p className="auth-subtitle">
                Sign in to pick up where you left off.
            </p>

            <form
                className="demo-form"
                onSubmit={submit}
            >
                <label htmlFor="login-email">Email address</label>
                <div className="input-wrap">
                    <FiMail aria-hidden="true" />
                    <input
                        id="login-email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required
                    />
                </div>

                <label htmlFor="login-password">Password</label>
                <div className="input-wrap">
                    <FiLock aria-hidden="true" />
                    <input
                        id="login-password"
                        type="password"
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        required
                    />
                </div>

                {error && <p className="field-error" role="alert">{error}</p>}

                <button
                    type="button"
                    className="forgot-link"
                    onClick={() =>
                        window.alert(
                            "Password reset is not connected in this UI preview."
                        )
                    }
                >
                    Forgot password?
                </button>

                <button
                    className="primary-button auth-submit"
                    type="submit"
                    disabled={loading}
                >
                    {loading ? "Signing in..." : <>Sign in <FiArrowRight /></>}
                </button>
            </form>
        </AuthFrame>
    );
}


export function RegisterScreen({ onContinue }) {
    const [form, setForm] = useState({ name: "", phone: "", email: "", password: "" });
    const [errors, setErrors] = useState({});
    const [showOtp, setShowOtp] = useState(false);
    const [showErrorSummary, setShowErrorSummary] = useState(false);
    const submitRef = useRef(null);
    const errorSummaryRef = useRef(null);
    const set = (key) => (event) => {
        const value = key === "phone" ? event.target.value.replace(/\D/g, "").slice(0, 10) : event.target.value;
        setForm((current) => ({ ...current, [key]: value }));
        if (errors[key]) setErrors((current) => ({ ...current, [key]: validateField(key, value) }));
    };
    const validateField = (key, value) => {
        if (key === "name" && value.trim().length < 3) return "Enter your full name (at least 3 characters).";
        if (key === "phone" && !/^[6-9]\d{9}$/.test(value)) return "Enter a valid 10-digit Indian mobile number.";
        if (key === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return "Enter a valid email address.";
        if (key === "password" && (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value) || value.length < 8)) {
            return "Use at least 8 characters with an uppercase letter, a lowercase letter, and a number.";
        }
        return "";
    };
    const validate = () => {
        const nextErrors = Object.fromEntries(
            Object.entries(form).map(([key, value]) => [key, validateField(key, value)]).filter(([, error]) => error),
        );
        setErrors(nextErrors);
        setShowErrorSummary(Object.keys(nextErrors).length > 0);
        return Object.keys(nextErrors).length === 0;
    };
    useEffect(() => {
        if (showErrorSummary) errorSummaryRef.current?.focus();
    }, [showErrorSummary]);
    const submit = (event) => {
        event.preventDefault();
        if (validate()) setShowOtp(true);
    };
    const closeOtp = useCallback(() => {
        setShowOtp(false);
        requestAnimationFrame(() => submitRef.current?.focus());
    }, []);
    const fieldProps = (key) => ({
        id: `register-${key}`,
        "aria-invalid": Boolean(errors[key]),
        "aria-describedby": errors[key] ? `register-${key}-error` : undefined,
        onBlur: () => {
            const error = validateField(key, form[key]);
            setErrors((current) => ({ ...current, [key]: error }));
        },
    });
    const renderError = (key) => errors[key] ? <p className="field-error" id={`register-${key}-error`}>{errors[key]}</p> : null;

    return (
        <AuthFrame mode="register">
            <span className="eyebrow">START RIDING</span>
            <h2>Create your account</h2>
            <p className="auth-subtitle">Add your details, then verify your phone to get started.</p>
            <form className="demo-form" onSubmit={submit} noValidate>
                {showErrorSummary && Object.keys(errors).length > 0 && (
                    <div className="form-error-summary" role="alert" tabIndex="-1" ref={errorSummaryRef}>
                        <strong>Please check the following:</strong>
                        <ul>{Object.entries(errors).filter(([, message]) => message).map(([key, message]) => (
                            <li key={key}><a href={`#register-${key}`} onClick={(event) => {
                                event.preventDefault();
                                document.getElementById(`register-${key}`)?.focus();
                            }}>{message}</a></li>
                        ))}</ul>
                    </div>
                )}
                <label htmlFor="register-name">Full name</label>
                <div className="input-wrap"><FiUser aria-hidden="true" /><input {...fieldProps("name")} type="text" autoComplete="name" placeholder="Your full name" value={form.name} onChange={set("name")} /></div>
                {renderError("name")}
                <label htmlFor="register-phone">Mobile number</label>
                <div className="input-wrap"><FiPhone aria-hidden="true" /><span className="country-code">+91</span><input {...fieldProps("phone")} type="tel" inputMode="numeric" autoComplete="tel-national" maxLength={10} placeholder="98765 43210" value={form.phone} onChange={set("phone")} /></div>
                {renderError("phone")}
                <label htmlFor="register-email">Email address</label>
                <div className="input-wrap"><FiMail aria-hidden="true" /><input {...fieldProps("email")} type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={set("email")} /></div>
                {renderError("email")}
                <label htmlFor="register-password">Password</label>
                <div className="input-wrap"><FiLock aria-hidden="true" /><input {...fieldProps("password")} type="password" autoComplete="new-password" placeholder="At least 8 characters" value={form.password} onChange={set("password")} /></div>
                {renderError("password")}
                <p className="password-hint">Use at least 8 characters, including uppercase, lowercase, and a number.</p>
                <button ref={submitRef} className="primary-button auth-submit" type="submit">Register <FiArrowRight /></button>
            </form>
            <p className="verification-note"><FiShield aria-hidden="true" /> We’ll verify your phone number before moving to your rider profile.</p>
            {showOtp && (
                <RegisterOtpModal
                    phone={form.phone}
                    onClose={closeOtp}
                    onVerified={() => onContinue({ ...form, name: form.name.trim() })}
                />
            )}
        </AuthFrame>
    );
}

function RegisterOtpModal({ phone, onClose, onVerified }) {
    const [digits, setDigits] = useState(Array(6).fill(""));
    const [error, setError] = useState("");
    const dialogRef = useRef(null);
    const inputRefs = useRef([]);

    useEffect(() => {
        inputRefs.current[0]?.focus();
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                onClose();
                return;
            }
            if (event.key !== "Tab") return;
            const focusable = dialogRef.current?.querySelectorAll("button:not(:disabled), input:not(:disabled)");
            if (!focusable?.length) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    const updateDigits = (startIndex, value) => {
        const nextDigits = [...digits];
        const numericDigits = value.replace(/\D/g, "");
        for (let offset = 0; offset < numericDigits.length && startIndex + offset < nextDigits.length; offset += 1) {
            nextDigits[startIndex + offset] = numericDigits[offset];
        }
        setDigits(nextDigits);
        setError("");
        const nextIndex = Math.min(startIndex + numericDigits.length, nextDigits.length - 1);
        inputRefs.current[nextIndex]?.focus();
    };
    const handlePaste = (event) => {
        const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, digits.length);
        if (!pasted) return;
        event.preventDefault();
        updateDigits(0, pasted);
    };
    const handleDigitKeyDown = (index, event) => {
        if (event.key === "Backspace") {
            if (digits[index]) {
                setDigits((current) => current.map((digit, digitIndex) => digitIndex === index ? "" : digit));
            } else if (index > 0) {
                inputRefs.current[index - 1]?.focus();
            }
            setError("");
        } else if (event.key === "ArrowLeft" && index > 0) {
            event.preventDefault();
            inputRefs.current[index - 1]?.focus();
        } else if (event.key === "ArrowRight" && index < digits.length - 1) {
            event.preventDefault();
            inputRefs.current[index + 1]?.focus();
        }
    };
    const verify = (event) => {
        event.preventDefault();
        const otp = digits.join("");
        if (!/^\d{6}$/.test(otp)) {
            setError("Enter all 6 digits to continue.");
            inputRefs.current[digits.findIndex((digit) => !digit)]?.focus();
            return;
        }
        if (otp !== "123456") {
            setError("That code doesn’t match. Enter the demo code shown below.");
            inputRefs.current[0]?.focus();
            return;
        }
        onVerified();
    };

    return (
        <div className="otp-backdrop">
            <section className="otp-dialog" role="dialog" aria-modal="true" aria-labelledby="otp-title" ref={dialogRef}>
                <button type="button" className="otp-close" onClick={onClose} aria-label="Close verification dialog"><FiX /></button>
                <span className="otp-icon"><FiShield aria-hidden="true" /></span>
                <span className="eyebrow">PHONE VERIFICATION</span>
                <h2 id="otp-title">Verify your number</h2>
                <p className="otp-copy">Enter the 6-digit code for <strong>+91 {phone}</strong>.</p>
                <form className="otp-form" onSubmit={verify} onPaste={handlePaste}>
                    <span className="otp-label" id="register-otp-label">Verification code</span>
                    <div className="otp-digits" role="group" aria-labelledby="register-otp-label" aria-describedby={error ? "register-otp-error" : "register-otp-hint"}>
                        {digits.map((digit, index) => (
                            <input
                                key={index}
                                ref={(element) => { inputRefs.current[index] = element; }}
                                className="otp-digit"
                                type="text"
                                inputMode="numeric"
                                autoComplete={index === 0 ? "one-time-code" : "off"}
                                maxLength={6}
                                value={digit}
                                aria-label={`Digit ${index + 1} of 6`}
                                aria-invalid={Boolean(error)}
                                onChange={(event) => updateDigits(index, event.target.value)}
                                onKeyDown={(event) => handleDigitKeyDown(index, event)}
                            />
                        ))}
                    </div>
                    {error && <p className="field-error" id="register-otp-error" role="alert">{error}</p>}
                    <p className="otp-demo-hint" id="register-otp-hint">UI preview code: <strong>123456</strong></p>
                    <button className="primary-button auth-submit" type="submit" disabled={digits.some((digit) => !digit)}>Verify &amp; continue <FiArrowRight /></button>
                </form>
                <button type="button" className="otp-edit-button" onClick={onClose}>Change registration details</button>
            </section>
        </div>
    );
}
