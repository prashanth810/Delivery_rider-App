import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import {
    FiArrowLeft, FiArrowRight, FiCamera, FiCheck, FiCheckCircle, FiFileText, FiRefreshCw,
    FiShield, FiTruck, FiUploadCloud, FiUser, FiUsers, FiX,
} from "react-icons/fi";
import Brand from "../common/Brand";

const STEPS = [
    { key: "personal", title: "Personal details", note: "Tell us a little about yourself", icon: FiUser },
    { key: "documents", title: "Documents", note: "Add your identity documents", icon: FiFileText },
    { key: "vehicle", title: "Vehicle details", note: "How will you make deliveries?", icon: FiTruck },
    { key: "photo", title: "Profile photo", note: "Add a clear selfie of yourself", icon: FiUsers },
    { key: "review", title: "Review", note: "Check your details and create your account", icon: FiCheckCircle },
];
const DOCS = [
    { key: "identityCard", label: "Identity card (Aadhaar)" },
    { key: "drivingLicence", label: "Driving licence" },
    { key: "vehicleRegistration", label: "Vehicle registration (RC)" },
];
const ALLOWED = ["image/jpeg", "image/png", "application/pdf"];
const MAX_BYTES = 5 * 1024 * 1024;

const ageOf = (dob) => {
    const d = new Date(dob), t = new Date();
    let a = t.getFullYear() - d.getFullYear();
    if (t.getMonth() < d.getMonth() || (t.getMonth() === d.getMonth() && t.getDate() < d.getDate())) a -= 1;
    return a;
};
const normVehicleNo = (v = "") => v.replace(/[\s-]/g, "").toUpperCase();
const validVehicleNo = (v) => /^[A-Z]{2}\d{1,2}[A-Z]{1,3}\d{4}$/.test(normVehicleNo(v));

// returns { fieldKey: "message" } – an empty object means the step is valid
const validate = (step, form, files) => {
    const e = {};
    if (step === "personal") {
        if ((form.name || "").trim().length < 3) e.name = "Enter your full name (at least 3 characters).";
        if (!form.dob) e.dob = "Select your date of birth.";
        else if (Number.isNaN(ageOf(form.dob)) || ageOf(form.dob) < 18) e.dob = "You must be at least 18 years old.";
        else if (ageOf(form.dob) > 70) e.dob = "Enter a valid date of birth.";
        if (!form.gender) e.gender = "Select your gender.";
        if (!(form.city || "").trim()) e.city = "Enter your city.";
        if (!/^\d{6}$/.test(form.pincode || "")) e.pincode = "Enter a valid 6-digit postal code.";
        if ((form.address || "").trim().length < 5) e.address = "Enter your full home address.";
    }
    if (step === "documents") {
        DOCS.forEach((d) => { if (!files[d.key]) e[d.key] = `Upload your ${d.label.toLowerCase()}.`; });
    }
    if (step === "vehicle") {
        if (!form.vehicleType) e.vehicleType = "Select your vehicle type.";
        if (!validVehicleNo(form.vehicleNumber || "")) e.vehicleNumber = "Enter a valid number, e.g. TS08AB1234.";
        if ((form.vehicleModel || "").trim().length < 2) e.vehicleModel = "Enter your vehicle make and model.";
    }
    if (step === "photo" && !form.photo) e.photo = "Take or upload a clear selfie to continue.";
    return e;
};

// shrink a camera frame / image to a small JPEG data-URL
const shrink = (source, w, h) => {
    const canvas = document.createElement("canvas");
    const scale = Math.min(360 / w, 360 / h, 1);
    canvas.width = Math.round(w * scale);
    canvas.height = Math.round(h * scale);
    canvas.getContext("2d").drawImage(source, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.8);
};

export function OnboardingScreen({ form, setForm, files, setFile, hasPassword, onSubmit, onCancel }) {
    const navigate = useNavigate();
    const { step } = useParams();
    const activeIndex = STEPS.findIndex((item) => item.key === step);
    const reached = Math.min(form.reached || 0, STEPS.length - 1);

    // messages belong to one step – they disappear automatically when the step changes
    const [errState, setErrState] = useState({ step: "", map: {} });
    const [noteState, setNoteState] = useState({ step: "", submit: "", camera: "" });
    const errors = errState.step === step ? errState.map : {};
    const setErrors = (next) => setErrState((prev) => {
        const base = prev.step === step ? prev.map : {};
        return { step, map: typeof next === "function" ? next(base) : next };
    });
    const submitError = noteState.step === step ? noteState.submit : "";
    const cameraError = noteState.step === step ? noteState.camera : "";
    const setSubmitError = (submit) => setNoteState((prev) => ({ step, camera: prev.step === step ? prev.camera : "", submit }));
    const setCameraError = (camera) => setNoteState((prev) => ({ step, submit: prev.step === step ? prev.submit : "", camera }));
    const [maxDob] = useState(() => new Date().toISOString().slice(0, 10));
    const [agree, setAgree] = useState(false);
    const [passwordAgain, setPasswordAgain] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [cameraStep, setCameraStep] = useState("");
    const camera = cameraStep === step;
    const video = useRef(null);
    const stream = useRef(null);

    const stopCamera = () => { stream.current?.getTracks().forEach((t) => t.stop()); stream.current = null; setCameraStep(""); };
    // switch the camera off when leaving the step / page
    useEffect(() => () => { stream.current?.getTracks().forEach((t) => t.stop()); stream.current = null; }, [step]);

    // unknown step, or trying to jump ahead of unfinished steps
    if (activeIndex === -1 || activeIndex > reached) return <Navigate to={`/onboarding/${STEPS[reached].key}`} replace />;

    const current = STEPS[activeIndex];
    const needsPassword = step === "review" && !hasPassword;
    const update = (key, value) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
    };
    const goTo = (index) => navigate(`/onboarding/${STEPS[index].key}`);

    const saveAndContinue = () => {
        const found = validate(step, form, files);
        setErrors(found);
        if (Object.keys(found).length) return;
        setForm((prev) => ({ ...prev, reached: Math.max(prev.reached || 0, activeIndex + 1) }));
        goTo(activeIndex + 1);
    };

    const pickDoc = (key, file) => {
        if (!file) return;
        if (!ALLOWED.includes(file.type)) return setErrors((p) => ({ ...p, [key]: "Only JPG, PNG or PDF files are allowed." }));
        if (file.size > MAX_BYTES) return setErrors((p) => ({ ...p, [key]: "File must be 5 MB or smaller." }));
        setFile(key, file);
        setErrors((p) => ({ ...p, [key]: "" }));
    };

    const openCamera = async () => {
        setCameraError("");
        try {
            stream.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
            setCameraStep(step);
            requestAnimationFrame(() => { if (video.current) video.current.srcObject = stream.current; });
        } catch {
            setCameraError("Camera isn't available. Please upload a selfie instead.");
        }
    };
    const capture = () => {
        const v = video.current;
        if (!v?.videoWidth) return;
        update("photo", shrink(v, v.videoWidth, v.videoHeight));
        stopCamera();
    };
    const pickPhoto = (file) => {
        if (!file) return;
        if (!file.type.startsWith("image/")) return setErrors((p) => ({ ...p, photo: "Please choose an image file." }));
        const img = new Image();
        img.onload = () => { update("photo", shrink(img, img.width, img.height)); URL.revokeObjectURL(img.src); };
        img.src = URL.createObjectURL(file);
    };

    const finish = async () => {
        setSubmitError("");
        // re-check every earlier step so nothing is missing (e.g. documents lost on refresh)
        for (const s of STEPS.slice(0, 4)) {
            const found = validate(s.key, form, files);
            if (Object.keys(found).length) {
                // send the rider back to the step that has a problem, with its errors visible
                setErrState({ step: s.key, map: found });
                navigate(`/onboarding/${s.key}`);
                return;
            }
        }
        if (needsPassword && passwordAgain.length < 8) return setSubmitError("Re-enter your account password (min 8 characters).");
        if (!agree) return setSubmitError("Please accept the terms to create your account.");
        setSubmitting(true);
        const result = await onSubmit(passwordAgain);
        setSubmitting(false);
        if (!result.ok) setSubmitError(result.message);
    };

    const errorList = Object.entries(errors).filter(([, m]) => m);
    const err = (k) => (errors[k] ? <p className="field-error" role="alert">{errors[k]}</p> : null);
    const input = (k) => ({ "aria-invalid": Boolean(errors[k]), className: "text-input" });

    return (
        <div className="onboarding-page">
            <header className="onboarding-header">
                <Link to="/login"><Brand /></Link>
                <button type="button" className="onboarding-cancel" onClick={onCancel}>Cancel registration</button>
            </header>
            <div className="onboarding-layout">
                <aside className="onboarding-aside">
                    <span className="eyebrow">RIDER APPLICATION</span>
                    <h1>Let’s get you<br />ready to ride.</h1>
                    <p>Complete these steps. Your rider account is created only after you review and submit everything.</p>
                    <ol className="step-list">
                        {STEPS.map((item, index) => {
                            const Icon = item.icon;
                            const body = (
                                <>
                                    <span className="step-icon">{index < reached ? <FiCheck /> : <Icon />}</span>
                                    <span><strong>{item.title}</strong><small>{item.note}</small></span>
                                </>
                            );
                            return (
                                <li className={`${index === activeIndex ? "active" : ""} ${index < reached ? "complete" : ""}`} key={item.key}>
                                    {index <= reached ? <Link to={`/onboarding/${item.key}`} className="step-link">{body}</Link> : body}
                                </li>
                            );
                        })}
                    </ol>
                    <p className="step-progress">Step {activeIndex + 1} of {STEPS.length}</p>
                </aside>

                <main className="onboarding-card">
                    <div className="onboarding-card-heading">
                        <span className="step-count">STEP 0{activeIndex + 1}</span>
                        <h2>{current.title}</h2>
                        <p>{current.note}</p>
                    </div>

                    {errorList.length > 1 && (
                        <div className="form-error-summary" role="alert">
                            <strong>Please fix the following:</strong>
                            <ul>{errorList.map(([k, m]) => <li key={k}>{m}</li>)}</ul>
                        </div>
                    )}

                    {step === "personal" && (
                        <div className="form-grid">
                            <label>Full name<input {...input("name")} value={form.name || ""} onChange={(e) => update("name", e.target.value)} placeholder="Your full name" />{err("name")}</label>
                            <label>Date of birth<input {...input("dob")} type="date" max={maxDob} value={form.dob || ""} onChange={(e) => update("dob", e.target.value)} />{err("dob")}</label>
                            <label>Gender
                                <select {...input("gender")} value={form.gender || ""} onChange={(e) => update("gender", e.target.value)}>
                                    <option value="">Select gender</option><option>Male</option><option>Female</option><option>Other</option>
                                </select>{err("gender")}
                            </label>
                            <label>City<input {...input("city")} value={form.city || ""} onChange={(e) => update("city", e.target.value)} placeholder="e.g. Hyderabad" />{err("city")}</label>
                            <label>Postal code<input {...input("pincode")} inputMode="numeric" maxLength={6} value={form.pincode || ""} onChange={(e) => update("pincode", e.target.value.replace(/\D/g, ""))} placeholder="6-digit postal code" />{err("pincode")}</label>
                            <label className="span-full">Home address<input {...input("address")} value={form.address || ""} onChange={(e) => update("address", e.target.value)} placeholder="Street, area, landmark" />{err("address")}</label>
                        </div>
                    )}

                    {step === "documents" && (
                        <div className="upload-list">
                            {DOCS.map((d) => {
                                const file = files[d.key];
                                return (
                                    <div key={d.key}>
                                        <div className={`upload-card${file ? " is-done" : ""}${errors[d.key] ? " has-error" : ""}`}>
                                            <span className="upload-icon">{file ? <FiCheckCircle /> : <FiFileText />}</span>
                                            <span><strong>{d.label}</strong><small>{file ? `${file.name} · ${(file.size / 1024).toFixed(0)} KB` : "JPG, PNG or PDF · Max 5 MB"}</small></span>
                                            {file && <button type="button" className="upload-remove" aria-label={`Remove ${d.label}`} onClick={() => setFile(d.key, null)}><FiX /></button>}
                                            <span className="upload-action"><FiUploadCloud /> {file ? "Replace" : "Browse"}
                                                <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => { pickDoc(d.key, e.target.files?.[0]); e.target.value = ""; }} />
                                            </span>
                                        </div>
                                        {err(d.key)}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {step === "vehicle" && (
                        <div className="form-grid">
                            <label className="span-full">Vehicle type
                                <select {...input("vehicleType")} value={form.vehicleType || ""} onChange={(e) => update("vehicleType", e.target.value)}>
                                    <option value="">Select your vehicle</option><option>Motorcycle</option><option>Scooter</option><option>Electric bike</option>
                                </select>{err("vehicleType")}
                            </label>
                            <label>Registration number<input {...input("vehicleNumber")} value={form.vehicleNumber || ""} onChange={(e) => update("vehicleNumber", e.target.value.toUpperCase())} placeholder="TS 08 AB 1234" />{err("vehicleNumber")}</label>
                            <label>Make and model<input {...input("vehicleModel")} value={form.vehicleModel || ""} onChange={(e) => update("vehicleModel", e.target.value)} placeholder="e.g. Honda Activa" />{err("vehicleModel")}</label>
                        </div>
                    )}

                    {step === "photo" && (
                        <div className="photo-upload">
                            <div className="photo-frame">
                                {camera ? <video ref={video} autoPlay playsInline muted />
                                    : form.photo ? <img src={form.photo} alt="Your selfie" />
                                        : <FiUser />}
                            </div>
                            <h3>{form.photo ? "Looking good!" : "Add a profile selfie"}</h3>
                            <p>Face the camera in good light. No cap, mask or sunglasses.</p>
                            <div className="photo-actions">
                                {camera ? (
                                    <button type="button" className="primary-button" onClick={capture}><FiCamera /> Capture</button>
                                ) : (
                                    <>
                                        <button type="button" className="primary-button" onClick={openCamera}>{form.photo ? <FiRefreshCw /> : <FiCamera />} {form.photo ? "Retake" : "Open camera"}</button>
                                        <label className="secondary-button photo-button"><FiUploadCloud /> Upload photo
                                            <input type="file" accept="image/*" onChange={(e) => { pickPhoto(e.target.files?.[0]); e.target.value = ""; }} />
                                        </label>
                                    </>
                                )}
                            </div>
                            {cameraError && <p className="field-error">{cameraError}</p>}
                            {err("photo")}
                        </div>
                    )}

                    {step === "review" && (
                        <div className="review-list">
                            <ReviewRow label="Name" value={form.name} />
                            <ReviewRow label="Mobile" value={form.phone ? `+91 ${form.phone}` : ""} />
                            <ReviewRow label="Email" value={form.email} />
                            <ReviewRow label="Date of birth / gender" value={[form.dob, form.gender].filter(Boolean).join(" · ")} />
                            <ReviewRow label="Address" value={[form.address, form.city, form.pincode].filter(Boolean).join(", ")} />
                            <ReviewRow label="Documents" value={`${DOCS.filter((d) => files[d.key]).length} of ${DOCS.length} uploaded`} />
                            <ReviewRow label="Vehicle" value={[form.vehicleType, normVehicleNo(form.vehicleNumber), form.vehicleModel].filter(Boolean).join(" · ")} />
                            <div className="review-photo"><span>Selfie</span>{form.photo ? <img src={form.photo} alt="Your selfie" /> : <strong>Not provided</strong>}</div>

                            {needsPassword && (
                                <label className="review-password">Re-enter your account password
                                    <input className="text-input" type="password" autoComplete="new-password" value={passwordAgain} onChange={(e) => setPasswordAgain(e.target.value)} placeholder="The password you used to register" />
                                </label>
                            )}
                            <label className="terms-row"><input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} /> I confirm these details are correct and agree to the Terms & Privacy Policy.</label>
                            {submitError && <p className="field-error" role="alert">{submitError}</p>}
                            <p className="review-note"><FiShield /> Your rider account is created when you press “Create my account”. You’ll then sign in to start riding.</p>
                        </div>
                    )}

                    <div className="wizard-actions">
                        {activeIndex > 0
                            ? <button type="button" className="secondary-button" onClick={() => goTo(activeIndex - 1)}><FiArrowLeft /> Back</button>
                            : <button type="button" className="secondary-button" onClick={onCancel}><FiArrowLeft /> Back</button>}
                        {step === "review"
                            ? <button type="button" className="primary-button" onClick={finish} disabled={submitting}>{submitting ? "Creating account..." : <>Create my account <FiCheck /></>}</button>
                            : <button type="button" className="primary-button" onClick={saveAndContinue}>Save & continue <FiArrowRight /></button>}
                    </div>
                </main>
            </div>
        </div>
    );
}

function ReviewRow({ label, value }) {
    return <div className="review-row"><span>{label}</span><strong>{value || "Not provided"}</strong></div>;
}

// Shown only right after the account was really created.
export function AccountReady({ onDone }) {
    const navigate = useNavigate();
    const { state } = useLocation();
    const created = Boolean(state?.created);
    useEffect(() => { if (created) onDone(); }, [created, onDone]);
    if (!created) return <Navigate to="/login" replace />;

    return (
        <main className="ready-screen">
            <div className="ready-card">
                <Brand />
                <span className="ready-check"><FiCheck /></span>
                <span className="eyebrow">ACCOUNT CREATED</span>
                <h1>Your rider account is ready!</h1>
                <p>Verification is complete. Sign in with your email and password to start delivering and earning.</p>
                <button className="primary-button" onClick={() => navigate("/login", { replace: true, state: { email: state.email, message: "Account created successfully. Please sign in to continue." } })}>Go to sign in <FiArrowRight /></button>
            </div>
        </main>
    );
}