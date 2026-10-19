import { useRef, useState } from "react";
import { FiUploadCloud, FiCheckCircle, FiFileText, FiX } from "react-icons/fi";
import { Button } from "../../components/ui";
import { StepHeader } from "../../components/StepHeader";
import { showErrorToast } from "../../components/Toast";
import useStepSave from "../../hooks/useStepSave";

const DOCS = [
    { key: "aadhaar", title: "Aadhaar Card", hint: "Upload front side" },
    { key: "license", title: "Driving License", hint: "Upload front side" },
    { key: "rc", title: "RC Document", hint: "Upload vehicle registration" },
];
const MAX = 5 * 1024 * 1024;
const OK = ["image/jpeg", "image/png", "application/pdf"];

const UploadDocuments = () => {
    const { save, back, saved, loading } = useStepSave("documents");
    const [files, setFiles] = useState(saved || {});
    const refs = useRef({});

    const pick = (key, file) => {
        if (!file) return;
        if (!OK.includes(file.type)) return showErrorToast("Only JPG, PNG or PDF allowed");
        if (file.size > MAX) return showErrorToast("File must be under 5MB");
        setFiles((f) => ({ ...f, [key]: { name: file.name, size: file.size, type: file.type } }));
    };
    const submit = () => {
        const missing = DOCS.find((d) => !files[d.key]);
        if (missing) return showErrorToast(`Please upload your ${missing.title}`);
        save(files);
    };

    return (
        <div>
            <StepHeader n={2} title="Upload Documents" subtitle="Upload clear photos of required documents" />
            <div className="space-y-4">
                {DOCS.map((d) => {
                    const file = files[d.key];
                    return (
                        <div key={d.key} className={`flex items-center gap-4 rounded-2xl border p-4 transition ${file ? "border-brand-200 bg-brand-50/50" : "border-slate-200"}`}>
                            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-600"><FiFileText size={22} /></span>
                            <div className="min-w-0 flex-1">
                                <p className="font-bold text-slate-800">{d.title}</p>
                                {file ? <p className="flex items-center gap-1 truncate text-xs text-brand-700"><FiCheckCircle /> {file.name} · {(file.size / 1024).toFixed(0)} KB</p>
                                    : <p className="text-xs text-slate-500">{d.hint}</p>}
                            </div>
                            {file && <button onClick={() => setFiles((f) => { const n = { ...f }; delete n[d.key]; return n; })} className="rounded-full p-2 text-slate-400 hover:bg-white" aria-label="Remove"><FiX /></button>}
                            <input ref={(el) => (refs.current[d.key] = el)} type="file" accept=".jpg,.jpeg,.png,.pdf" hidden onChange={(e) => { pick(d.key, e.target.files[0]); e.target.value = ""; }} />
                            <Button variant="outline" onClick={() => refs.current[d.key].click()} className="flex-col gap-0.5 px-4 py-2 text-xs"><FiUploadCloud size={18} />{file ? "Replace" : "Upload"}</Button>
                        </div>
                    );
                })}
            </div>
            <p className="mt-4 text-xs text-slate-500">Accepted formats: JPG, PNG, PDF (Max 5MB)</p>
            <div className="mt-8 flex justify-between"><Button variant="outline" onClick={back} className="min-w-28">Back</Button><Button onClick={submit} loading={loading} className="min-w-28">Next</Button></div>
        </div>
    );
};
export default UploadDocuments;