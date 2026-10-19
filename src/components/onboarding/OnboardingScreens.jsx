import { Link, useNavigate, useParams } from "react-router-dom";
import {
    FiArrowLeft,
    FiArrowRight,
    FiCheck,
    FiCheckCircle,
    FiFileText,
    FiShield,
    FiTruck,
    FiUploadCloud,
    FiUser,
    FiUsers,
} from "react-icons/fi";
import Brand from "../common/Brand";

const ONBOARDING_STEPS = [
    { key: "personal", title: "Personal details", note: "Tell us a little about yourself", icon: FiUser },
    { key: "documents", title: "Documents", note: "Add your identity documents", icon: FiFileText },
    { key: "vehicle", title: "Vehicle details", note: "How will you make deliveries?", icon: FiTruck },
    { key: "photo", title: "Profile photo", note: "Add a clear photo of yourself", icon: FiUsers },
    { key: "review", title: "Review", note: "Check your details", icon: FiCheckCircle },
];

export function OnboardingScreen({ form, setForm, onFinish }) {
    const navigate = useNavigate();
    const { step = "personal" } = useParams();
    const activeIndex = Math.max(0, ONBOARDING_STEPS.findIndex((item) => item.key === step));
    const current = ONBOARDING_STEPS[activeIndex];
    const update = (key, value) => setForm((previous) => ({ ...previous, [key]: value }));
    const go = (direction) => {
        const next = Math.min(ONBOARDING_STEPS.length - 1, Math.max(0, activeIndex + direction));
        navigate(`/onboarding/${ONBOARDING_STEPS[next].key}`);
    };

    return (
        <div className="onboarding-page">
            <header className="onboarding-header"><Link to="/login"><Brand /></Link><span className="preview-label"><FiShield /> UI preview</span></header>
            <div className="onboarding-layout">
                <aside className="onboarding-aside">
                    <span className="eyebrow">RIDER APPLICATION</span>
                    <h1>Let’s get you<br />ready to ride.</h1>
                    <p>Complete your profile in a few simple steps. You can review everything before you finish.</p>
                    <ol className="step-list">
                        {ONBOARDING_STEPS.map((item, index) => {
                            const Icon = item.icon;
                            return (
                                <li className={`${index === activeIndex ? "active" : ""} ${index < activeIndex ? "complete" : ""}`} key={item.key}>
                                    <span className="step-icon">{index < activeIndex ? <FiCheck /> : <Icon />}</span>
                                    <span><strong>{item.title}</strong><small>{item.note}</small></span>
                                </li>
                            );
                        })}
                    </ol>
                    <p className="step-progress">Step {activeIndex + 1} of {ONBOARDING_STEPS.length}</p>
                </aside>
                <main className="onboarding-card">
                    <div className="onboarding-card-heading">
                        <span className="step-count">STEP 0{activeIndex + 1}</span>
                        <h2>{current.title}</h2>
                        <p>{current.note}</p>
                    </div>
                    {step === "personal" && (
                        <div className="form-grid">
                            <label>Full name<input className="text-input" value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="Your full name" /></label>
                            <label>Date of birth<input className="text-input" type="date" value={form.dob || ""} onChange={(event) => update("dob", event.target.value)} /></label>
                            <label>City<input className="text-input" value={form.city || ""} onChange={(event) => update("city", event.target.value)} placeholder="e.g. Hyderabad" /></label>
                            <label>Postal code<input className="text-input" inputMode="numeric" value={form.pincode || ""} onChange={(event) => update("pincode", event.target.value)} placeholder="6-digit postal code" /></label>
                            <label className="span-full">Home address<input className="text-input" value={form.address || ""} onChange={(event) => update("address", event.target.value)} placeholder="Street, area, landmark" /></label>
                        </div>
                    )}
                    {step === "documents" && (
                        <div className="upload-list">
                            {["Identity card", "Driving licence", "Vehicle registration"].map((label, index) => {
                                const key = `document-${index}`;
                                return <label className="upload-card" key={key}><span className="upload-icon"><FiFileText /></span><span><strong>{label}</strong><small>{form[key] || "JPG, PNG or PDF · Max 5 MB"}</small></span><span className="upload-action"><FiUploadCloud /> Browse<input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={(event) => update(key, event.target.files?.[0]?.name || "")} /></span></label>;
                            })}
                        </div>
                    )}
                    {step === "vehicle" && (
                        <div className="form-grid">
                            <label className="span-full">Vehicle type<select className="text-input" value={form.vehicleType || ""} onChange={(event) => update("vehicleType", event.target.value)}><option value="">Select your vehicle</option><option>Motorcycle</option><option>Scooter</option><option>Electric bike</option></select></label>
                            <label>Registration number<input className="text-input" value={form.vehicleNumber || ""} onChange={(event) => update("vehicleNumber", event.target.value.toUpperCase())} placeholder="TS 08 AB 1234" /></label>
                            <label>Make and model<input className="text-input" value={form.vehicleModel || ""} onChange={(event) => update("vehicleModel", event.target.value)} placeholder="e.g. Honda Activa" /></label>
                        </div>
                    )}
                    {step === "photo" && (
                        <div className="photo-upload">
                            <div className="photo-placeholder"><FiUser /></div>
                            <h3>{form.photoName || "Add a profile photo"}</h3>
                            <p>Choose a recent, clear photo where your face is easy to see.</p>
                            <label className="secondary-button photo-button"><FiUploadCloud /> Choose photo<input type="file" accept="image/*" onChange={(event) => update("photoName", event.target.files?.[0]?.name || "")} /></label>
                        </div>
                    )}
                    {step === "review" && (
                        <div className="review-list">
                            <ReviewRow label="Name" value={form.name} />
                            <ReviewRow label="City" value={form.city} />
                            <ReviewRow label="Identity documents" value={["document-0", "document-1", "document-2"].filter((key) => form[key]).length ? `${["document-0", "document-1", "document-2"].filter((key) => form[key]).length} files selected` : "Not added yet"} />
                            <ReviewRow label="Vehicle" value={[form.vehicleType, form.vehicleNumber].filter(Boolean).join(" · ")} />
                            <ReviewRow label="Profile photo" value={form.photoName} />
                            <p className="review-note"><FiShield /> This is a local UI preview. Your information is not submitted or saved.</p>
                        </div>
                    )}
                    <div className="wizard-actions">
                        {activeIndex > 0 ? <button type="button" className="secondary-button" onClick={() => go(-1)}><FiArrowLeft /> Back</button> : <Link className="secondary-button" to="/register"><FiArrowLeft /> Back</Link>}
                        {step === "review" ? <button type="button" className="primary-button" onClick={onFinish}>Finish preview <FiCheck /></button> : <button type="button" className="primary-button" onClick={() => go(1)}>Save & continue <FiArrowRight /></button>}
                    </div>
                </main>
            </div>
        </div>
    );
}

function ReviewRow({ label, value }) {
    return <div className="review-row"><span>{label}</span><strong>{value || "Not provided"}</strong></div>;
}

export function AccountReady({ onContinue }) {
    return (
        <main className="ready-screen">
            <div className="ready-card">
                <Brand />
                <span className="ready-check"><FiCheck /></span>
                <span className="eyebrow">PREVIEW COMPLETE</span>
                <h1>All set for the ride.</h1>
                <p>You’ve explored the rider setup screens. Move on to the interactive dashboard preview.</p>
                <button className="primary-button" onClick={onContinue}>Explore dashboard <FiArrowRight /></button>
            </div>
        </main>
    );
}
