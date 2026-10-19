import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FiPhone, FiLock } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import AuthLayout from "../layouts/AuthLayout";
import { Button, Field } from "../components/ui";
import { loginRider } from "../redux/Slices/AuthSlice";
import { showErrorToast, showSuccessToast, showWarningToast } from "../components/Toast";
import useAuthRateLimit from "../hooks/useAuthRateLimit";
import { nextPathFor, validPhone } from "../constants/onboarding";

const Loginpage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { state } = useLocation();
    const loading = useSelector((s) => s.auth.loading);
    const { remainingSeconds, countdownLabel, startCooldown } = useAuthRateLimit();
    const [form, setForm] = useState({ phone: "", password: "", remember: true });
    const [errors, setErrors] = useState({});
    const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

    const submit = async (e) => {
        e.preventDefault();
        const er = {};
        if (!validPhone(form.phone)) er.phone = "Enter a valid 10-digit mobile number";
        if (!form.password) er.password = "Password is required";
        setErrors(er);
        if (Object.keys(er).length) return;

        const res = await dispatch(loginRider(form));
        if (loginRider.fulfilled.match(res)) {
            showSuccessToast("Welcome back!");
            navigate(nextPathFor(res.payload.data), { replace: true });
        } else {
            if (startCooldown(res.payload)) showWarningToast("Too many attempts. Please wait.");
            else showErrorToast(res.payload || "Login failed");
        }
    };

    return (
        <AuthLayout
            title="Welcome Back"
            subtitle="Login to your rider account"
            footer={<>Don't have an account? <Link to="/register" className="font-bold text-brand-600 hover:underline">Register</Link></>}
        >
            {state?.message && (
                <div className="mb-5 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm font-medium text-brand-700">{state.message}</div>
            )}
            <form onSubmit={submit} className="space-y-4" noValidate>
                <Field label="Phone Number" icon={FiPhone} inputMode="numeric" maxLength={10} placeholder="Enter your phone number"
                    value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, "") }))} error={errors.phone} />
                <Field label="Password" icon={FiLock} type="password" placeholder="Enter your password"
                    value={form.password} onChange={set("password")} error={errors.password} autoComplete="current-password" />
                <div className="flex items-center justify-between text-sm">
                    <label className="flex cursor-pointer items-center gap-2 text-slate-600">
                        <input type="checkbox" checked={form.remember} onChange={(e) => setForm((f) => ({ ...f, remember: e.target.checked }))} className="h-4 w-4 accent-emerald-600" />
                        Remember me
                    </label>
                    <button type="button" onClick={() => showWarningToast("Password reset is coming soon")} className="font-semibold text-brand-600 hover:underline">Forgot Password?</button>
                </div>
                <Button type="submit" loading={loading} disabled={remainingSeconds > 0} className="w-full py-3.5 text-base">
                    {remainingSeconds > 0 ? `Try again in ${countdownLabel}` : "Login"}
                </Button>
            </form>

            <div className="my-6 flex items-center gap-3 text-xs text-slate-400"><span className="h-px flex-1 bg-slate-200" />Or continue with<span className="h-px flex-1 bg-slate-200" /></div>
            <Button variant="outline" className="w-full" type="button" onClick={() => showWarningToast("Google login is coming soon")}>
                <FcGoogle size={20} /> Login with Google
            </Button>
        </AuthLayout>
    );
};
export default Loginpage;