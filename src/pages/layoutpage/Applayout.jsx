import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FiHome, FiUser, FiLogOut } from "react-icons/fi";
import { Logo } from "../components/ui";
import { logoutapi } from "../redux/Slices/AuthSlice";
import { showSuccessToast } from "../components/Toast";

const AppLayout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector((s) => s.auth.user);
    const isHome = useLocation().pathname === "/home";
    const logout = async () => {
        await dispatch(logoutapi());
        showSuccessToast("Logged out successfully");
        navigate("/", { replace: true });
    };
    const link = ({ isActive }) => `flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition ${isActive ? "bg-brand-50 text-brand-700" : "text-slate-500 hover:text-slate-800"}`;
    return (
        <div className="min-h-screen bg-slate-50">
            <header className="sticky top-0 z-[1500] border-b border-slate-100 bg-white/90 backdrop-blur">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
                    <Logo />
                    <nav className="flex items-center gap-1">
                        <NavLink to="/home" end className={link}><FiHome /><span className="hidden sm:inline">Home</span></NavLink>
                        <NavLink to="/profile" className={link}><FiUser /><span className="hidden sm:inline">Profile</span></NavLink>
                        <button onClick={logout} className="ml-2 flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"><FiLogOut /><span className="hidden sm:inline">Logout</span></button>
                    </nav>
                </div>
            </header>
            {isHome ? <Outlet /> : (
                <main className="mx-auto max-w-6xl px-5 py-8"><div className="mb-6 hidden text-xs text-slate-400 sm:block">Signed in as {user?.fullName}</div><Outlet /></main>
            )}
        </div>
    );
};
export default AppLayout;