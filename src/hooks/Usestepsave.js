import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { saveStep } from "../redux/Slices/AuthSlice";
import { showErrorToast, showSuccessToast } from "../components/Toast";
import { STEPS, stepPath } from "../constants/onboarding";

// save one onboarding step, then go to the next one
export default function useStepSave(key) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, loading } = useSelector((s) => s.auth);
    const idx = STEPS.findIndex((s) => s.key === key);
    const saved = user?.onboarding?.data?.[key];
    const save = async (data) => {
        const res = await dispatch(saveStep({ step: key, data }));
        if (saveStep.fulfilled.match(res)) {
            showSuccessToast(`${STEPS[idx].title} saved`);
            navigate(stepPath(STEPS[idx + 1].key));
        } else showErrorToast(res.payload || "Could not save. Try again.");
    };
    const back = () => navigate(idx === 0 ? "/onboarding/personal" : stepPath(STEPS[idx - 1].key));
    return { save, back, saved, loading, user, isFirst: idx === 0 };
}