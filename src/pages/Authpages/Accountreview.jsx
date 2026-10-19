import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../../components/ui";
import { StepHeader } from "../../components/StepHeader";
import { submitOnboarding } from "../../redux/Slices/AuthSlice";
import { showErrorToast } from "../../components/Toast";
import { stepPath } from "../../constants/onboarding";

const Card = ({ title, to, children }) => (
    <div className="rounded-2xl border border-slate-200 p-4">
        <div className="mb-2 flex items-center justify-between"><h3 className="font-bold text-slate-800">{title}</h3><Link to={to} className="text-xs font-semibold text-brand-600 hover:underline">Edit</Link></div>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">{children}</dl>
    </div>
);
const Row = ({ k, v }) => (<><dt className="text-slate-500">{k}</dt><dd className="truncate font-medium text-slate-800">{v || "—"}</dd></>);

const AccountReview = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, loading } = useSelector((s) => s.auth);
    const [agree, setAgree] = useState(false);
    const d = user.onboarding.data;
    const p = d.personal || {}, v = d.vehicle || {}, docs = d.documents || {}, photo = d.photo?.selfie;

    const submit = async () => {
        if (!agree) return showErrorToast("Please accept the terms to continue");
        const res = await dispatch(submitOnboarding());
        if (submitOnboarding.fulfilled.match(res)) navigate("/account-ready", { replace: true });
        else showErrorToast(res.payload || "Submission failed");
    };

    return (
        <div>
            <StepHeader n={5} title="Account Review" subtitle="Check your details. We'll verify them and activate your account." />
            <div className="grid gap-4 md:grid-cols-2">
                <Card title="Personal" to={stepPath("personal")}>
                    <Row k="Name" v={p.fullName} /><Row k="Phone" v={user.phone} /><Row k="DOB" v={p.dob} /><Row k="City" v={p.city} /><Row k="Pincode" v={p.pincode} />
                </Card>
                <Card title="Vehicle" to={stepPath("vehicle")}>
                    <Row k="Type" v={v.type} /><Row k="Number" v={v.number} /><Row k="Brand" v={v.brand} /><Row k="Model" v={v.model} /><Row k="Color" v={v.color} />
                </Card>
                <Card title="Documents" to={stepPath("documents")}>
                    <Row k="Aadhaar" v={docs.aadhaar?.name} /><Row k="License" v={docs.license?.name} /><Row k="RC" v={docs.rc?.name} />
                </Card>
                <div className="flex items-center gap-4 rounded-2xl border border-slate-200 p-4">
                    {photo ? <img src={photo} alt="Selfie" className="h-20 w-20 rounded-full object-cover" /> : <div className="h-20 w-20 rounded-full bg-slate-100" />}
                    <div><h3 className="font-bold text-slate-800">Selfie</h3><Link to={stepPath("photo")} className="text-xs font-semibold text-brand-600 hover:underline">Retake</Link></div>
                </div>
            </div>
            <label className="mt-6 flex cursor-pointer items-start gap-2.5 text-sm text-slate-600">
                <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 h-4 w-4 accent-emerald-600" />
                I confirm all details are correct and agree to the QuickRider Terms & Privacy Policy.
            </label>
            <div className="mt-8 flex justify-between">
                <Button variant="outline" onClick={() => navigate(stepPath("photo"))} className="min-w-28">Back</Button>
                <Button onClick={submit} loading={loading} className="min-w-40">Submit for Review</Button>
            </div>
        </div>
    );
};
export default AccountReview;