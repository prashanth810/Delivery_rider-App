import { Link } from "react-router-dom";
import { Logo, Illustration } from "../components/ui";

const AuthLayout = ({ title, subtitle, children, footer }) => (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
        <aside className="relative hidden overflow-hidden bg-gradient-to-br from-brand-900 via-brand-700 to-brand-500 p-12 text-white lg:flex lg:flex-col">
            <Link to="/"><Logo light size="text-2xl" /></Link>
            <div className="mt-14 max-w-md">
                <h2 className="text-4xl font-extrabold leading-tight">Deliver smart.<br />Earn on your schedule.</h2>
                <p className="mt-4 text-emerald-50/80">Join thousands of riders delivering groceries, food and parcels across the city. Weekly payouts, flexible hours.</p>
                <div className="mt-8 flex gap-8 text-sm">
                    {[["₹25k+", "avg. monthly"], ["Weekly", "payouts"], ["24/7", "support"]].map(([a, b]) => (
                        <div key={b}><p className="text-2xl font-extrabold">{a}</p><p className="text-emerald-100/70">{b}</p></div>
                    ))}
                </div>
            </div>
            <Illustration className="mt-auto w-full max-w-xl self-center" />
        </aside>

        <main className="flex items-center justify-center bg-white px-5 py-10 sm:px-10 lg:bg-slate-50">
            <div className="w-full max-w-md animate-fade-up">
                <div className="mb-8 lg:hidden"><Logo /></div>
                <h1 className="text-3xl font-extrabold text-brand-900">{title}</h1>
                <p className="mt-1.5 text-slate-500">{subtitle}</p>
                <div className="mt-7">{children}</div>
                {footer && <p className="mt-6 text-center text-sm text-slate-500">{footer}</p>}
            </div>
        </main>
    </div>
);
export default AuthLayout;