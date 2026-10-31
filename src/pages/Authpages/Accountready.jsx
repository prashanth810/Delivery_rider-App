import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { FiClock } from "react-icons/fi";
import { Button, Logo } from "../components/ui";
import { logout } from "../redux/Slices/AuthSlice";

// Account is submitted -> waiting for admin verification
const AccountReady = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    useEffect(() => { dispatch(logout()); }, [dispatch]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-amber-50 to-white px-5 text-center">
            <Logo />
            <div className="animate-pop mt-10 flex h-24 w-24 items-center justify-center rounded-full bg-amber-500 text-white shadow-xl shadow-amber-500/30">
                <FiClock size={48} />
            </div>
            <span className="mt-6 rounded-full bg-amber-100 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-amber-800">
                Pending Verification
            </span>
            <h1 className="mt-4 text-3xl font-extrabold text-slate-900">Your account is under verification</h1>
            <p className="mt-2.5 max-w-md text-base text-slate-600">
                Please wait <strong>24 – 48 hours</strong> while our admin team verifies your submitted details and documents.
            </p>
            <p className="mt-1 text-sm text-slate-500">
                You will receive a confirmation email once your account has been approved.
            </p>
            <Button
                className="mt-8 min-w-56 py-3.5 text-base"
                onClick={() => navigate("/", { replace: true, state: { message: "Your account is under verification. Please wait 24 - 48 hours for admin approval." } })}
            >
                Go to Login
            </Button>
        </div>
    );
};
export default AccountReady;
