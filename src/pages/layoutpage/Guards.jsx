import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { CgSpinner } from "react-icons/cg";
// logged-in only
export const RequireAuth = () => {
    const { token, user, booting } = useSelector((s) => s.auth);
    if (booting) return <CgSpinner />;
    if (!token || !user) return <Navigate to="/" replace />;
    return <Outlet />;
};
// only riders who finished all verification steps
export const RequireOnboarded = () => {
    const user = useSelector((s) => s.auth.user);
    return user?.onboarding?.completed ? <Outlet /> : <Navigate to={"/"} replace />;
};
// onboarding screens: only riders who are NOT finished yet
export const RequireNotOnboarded = () => {
    const user = useSelector((s) => s.auth.user);
    return user?.onboarding?.completed ? <Navigate to="/home" replace /> : <Outlet />;
};
// login / register: skip if already signed in
export const GuestOnly = () => {
    const { token, user, booting } = useSelector((s) => s.auth);
    if (booting) return <CgSpinner />;
    if (token && user) return <Navigate to={nextPathFor(user)} replace />;
    return <Outlet />;
};