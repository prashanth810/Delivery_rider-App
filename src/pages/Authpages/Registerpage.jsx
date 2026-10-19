import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FiUser, FiPhone, FiMail, FiLock } from "react-icons/fi";
import AuthLayout from "../layouts/AuthLayout";
import { Button, Field, Select } from "../components/ui";
import OtpModal from "../components/OtpModal";
import { registerRider } from "../redux/Slices/AuthSlice";
import { showErrorToast, showSuccessToast } from "../components/Toast";
import { VEHICLES, normVehicleNo, validPhone, validVehicleNo } from "../constants/onboarding";

const Registerpage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, pendingRegistration } = useSelector((s) => s.auth);
    const [form, setForm] = useState({ fullName: "", phone: "", email: "", password: "", vehicleType: "", vehicleNumber: "" });
    const [errors, setErrors] = useState({});
    const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

    const validate = () => {
        const er = {};
        if (form.fullName.trim().length < 3) er.fullName = "Enter your full name";
        if (!validPhone(form.phone)) er.phone = "Enter a valid 10-digit mobile number";
        if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) er.email = "Enter a valid email";
        if (form.password.length < 8) er.password = "Minimum 8 characters";
        if (!form.vehicleType) er.vehicleType = "Select a vehicle type";
        if (!validVehicleNo(form.vehicleNumber)) er.vehicleNumber = "Format e.g. TS08AB1234";
        setErrors(er);
        return !Object.keys(er).length;
    };

    const submit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        const res = await dispatch(registerRider({ ...form, vehicleNumber: normVehicleNo(form.vehicleNumber), fullName: form.fullName.trim() }));
        if (registerRider.fulfilled.match(res)) showSuccessToast("OTP sent to your phone");
        else showErrorToast(res.payload || "Registration failed");
    };

    return (
        <AuthLayout
            title="Create Rider Account"
            subtitle="Join us and start earning"
            footer={<>Already have an account? <Link to="/" className="font-bold text-brand-600 hover:underline">Login</Link></>}
        >
            <form onSubmit={submit} className="space-y-4" noValidate>
                <Field label="Full Name" icon={FiUser} placeholder="Enter your full name" value={form.fullName} onChange={set("fullName")} error={errors.fullName} />
                <Field label="Phone Number" icon={FiPhone} inputMode="numeric" maxLength={10} placeholder="10-digit mobile number"
                    value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, "") }))} error={errors.phone} />
                <Field label="Email (Optional)" icon={FiMail} type="email" placeholder="Enter your email" value={form.email} onChange={set("email")} error={errors.email} />
                <Field label="Password" icon={FiLock} type="password" placeholder="Create a password" value={form.password} onChange={set("password")} error={errors.password} autoComplete="new-password" />
                <div className="grid gap-4 sm:grid-cols-2">
                    <Select label="Vehicle Type" options={VEHICLES} placeholder="Select vehicle type" value={form.vehicleType} onChange={set("vehicleType")} error={errors.vehicleType} />
                    <Field label="Vehicle Number" placeholder="TS08AB1234" value={form.vehicleNumber} onChange={(e) => setForm((f) => ({ ...f, vehicleNumber: e.target.value.toUpperCase() }))} error={errors.vehicleNumber} />
                </div>
                <Button type="submit" loading={loading} className="w-full py-3.5 text-base">Register</Button>
                <p className="text-center text-xs text-slate-400">We'll send a 6-digit OTP to verify your number.</p>
            </form>

            {pendingRegistration && (
                <OtpModal phone={pendingRegistration.phone} onVerified={() => navigate("/onboarding/personal", { replace: true })} />
            )}
        </AuthLayout>
    );
};
export default Registerpage;