import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FiMail, FiUser } from "react-icons/fi";
import { Button, Field } from "../components/ui";
import { updateProfile } from "../redux/Slices/AuthSlice";
import { showErrorToast, showSuccessToast } from "../components/Toast";

const Profilepage = () => {
    const dispatch = useDispatch();
    const { user, loading } = useSelector((s) => s.auth);
    const [f, setF] = useState({ fullName: user.fullName, email: user.email || "" });
    const d = user.onboarding.data;

    const save = async (e) => {
        e.preventDefault();
        if (f.fullName.trim().length < 3) return showErrorToast("Enter your full name");
        if (f.email && !/^\S+@\S+\.\S+$/.test(f.email)) return showErrorToast("Enter a valid email");
        const res = await dispatch(updateProfile(f));
        if (updateProfile.fulfilled.match(res)) showSuccessToast("Profile updated");
        else showErrorToast(res.payload || "Update failed");
    };

    return (
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
            <section className="h-fit rounded-3xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-100">
                {d.photo?.selfie ? <img src={d.photo.selfie} alt="" className="mx-auto h-28 w-28 rounded-full object-cover ring-4 ring-brand-100" />
                    : <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-brand-100 text-3xl font-extrabold text-brand-700">{user.fullName[0]}</div>}
                <h2 className="mt-4 text-xl font-extrabold text-brand-900">{user.fullName}</h2>
                <p className="text-sm text-slate-500">+91 {user.phone}</p>
                <span className="mt-3 inline-block rounded-full bg-brand-100 px-3 py-1 text-xs font-bold capitalize text-brand-700">● {user.status === "approved" ? "Verified rider" : user.status}</span>
            </section>
            <div className="space-y-6">
                <form onSubmit={save} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
                    <h3 className="mb-4 text-lg font-extrabold text-brand-900">Edit profile</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Full Name" icon={FiUser} value={f.fullName} onChange={(e) => setF({ ...f, fullName: e.target.value })} />
                        <Field label="Email" icon={FiMail} value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
                    </div>
                    <Button type="submit" loading={loading} className="mt-5">Save changes</Button>
                </form>
                <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
                    <h3 className="mb-4 text-lg font-extrabold text-brand-900">Vehicle</h3>
                    <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                        {[["Type", d.vehicle?.type], ["Number", d.vehicle?.number], ["Brand", d.vehicle?.brand], ["Model", d.vehicle?.model], ["Color", d.vehicle?.color], ["Year", d.vehicle?.year]].map(([k, v]) => (
                            <div key={k}><dt className="text-xs text-slate-400">{k}</dt><dd className="font-semibold text-slate-800">{v || "—"}</dd></div>
                        ))}
                    </dl>
                </section>
            </div>
        </div>
    );
};
export default Profilepage;