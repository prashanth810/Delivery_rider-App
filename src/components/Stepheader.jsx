import { FiCheckCircle } from "react-icons/fi";
export const StepHeader = ({ n, title, subtitle, done }) => (
    <div className="mb-7 flex items-start gap-3">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${done ? "bg-brand-600 text-white" : "bg-brand-100 font-bold text-brand-700"}`}>
            {done ? <FiCheckCircle size={20} /> : n}
        </span>
        <div><h1 className="text-2xl font-extrabold text-brand-900">{title}</h1><p className="text-sm text-slate-500">{subtitle}</p></div>
    </div>
);