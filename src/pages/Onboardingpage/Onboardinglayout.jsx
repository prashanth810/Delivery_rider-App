import { Link, Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FiCheck, FiLogOut } from "react-icons/fi";
import { Logo } from "../components/ui";
import { STEPS, stepPath } from "../constants/onboarding";
import { logoutapi } from "../redux/Slices/AuthSlice";

const OnboardingLayout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const user = useSelector((s) => s.auth.user);
    const current = STEPS.findIndex((s) => pathname.endsWith(s.key)) + 1 || 1;
    const reached = user?.onboarding?.step || 1;

    // riders can't jump ahead of steps they haven't completed
    if (current > reached) return <Navigate to={stepPath(STEPS[reached - 1].key)} replace />;

    const logout = async () => { await dispatch(logoutapi()); navigate("/", { replace: true }); };

    return (
        <div className="min-h-screen bg-gradient-to-b from-brand-50 to-slate-50">
            <header className="border-b border-brand-100 bg-brand-900">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
                    <Logo light />
                    <button onClick={logout} className="flex items-center gap-2 text-sm text-emerald-100 hover:text-white"><FiLogOut /> Logout</button>
                </div>
            </header>

            <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[320px_1fr]">
                <aside className="h-fit rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 lg:sticky lg:top-6">
                    <h2 className="text-lg font-extrabold text-brand-900">Verify Your Account</h2>
                    <p className="mt-1 text-xs text-slate-500">Complete these steps to start delivering</p>
                    <ol className="mt-5 hidden space-y-1 lg:block">
                        {STEPS.map((s) => {
                            const done = s.n < reached || (s.n === current && false);
                            const active = s.n === current;
                            const can = s.n <= reached;
                            const row = (
                                <div className={`flex items-center gap-3 rounded-2xl p-3 transition ${active ? "bg-brand-50 ring-1 ring-brand-200" : ""} ${can ? "cursor-pointer hover:bg-brand-50/60" : "opacity-60"}`}>
                                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${done ? "bg-brand-600 text-white" : active ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                                        {done ? <FiCheck /> : s.n}
                                    </span>
                                    <div><p className="text-sm font-bold text-slate-800">{s.title}</p><p className="text-xs text-slate-500">{s.desc}</p></div>
                                </div>
                            );
                            return <li key={s.key}>{can ? <Link to={stepPath(s.key)}>{row}</Link> : row}</li>;
                        })}
                    </ol>
                    {/* mobile progress */}
                    <div className="mt-4 lg:hidden">
                        <div className="flex justify-between text-xs font-semibold text-slate-600"><span>Step {current} of {STEPS.length}</span><span>{STEPS[current - 1]?.title}</span></div>
                        <div className="mt-2 h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-brand-600 transition-all" style={{ width: `${(current / STEPS.length) * 100}%` }} /></div>
                    </div>
                </aside>

                <main className="animate-fade-up rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
export default OnboardingLayout;