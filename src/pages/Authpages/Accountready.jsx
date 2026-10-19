import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { FiCheck } from "react-icons/fi";
import { Button, Logo } from "../components/ui";
import { logout } from "../redux/Slices/AuthSlice";

// Account is created -> sign the rider out so they log in fresh.
const AccountReady = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    useEffect(() => { dispatch(logout()); }, [dispatch]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-brand-50 to-white px-5 text-center">
            <Logo />
            <div className="animate-pop mt-10 flex h-24 w-24 items-center justify-center rounded-full bg-brand-600 text-white shadow-xl shadow-brand-600/30"><FiCheck size={48} /></div>
            <h1 className="mt-7 text-3xl font-extrabold text-brand-900">Your rider account is ready!</h1>
            <p className="mt-2 max-w-md text-slate-500">Verification complete. Please login with your phone number and password to start delivering and earning.</p>
            <Button className="mt-8 min-w-56 py-3.5 text-base" onClick={() => navigate("/", { replace: true, state: { message: "Account created successfully. Please login to continue." } })}>Go to Login</Button>
        </div>
    );
};
export default AccountReady;