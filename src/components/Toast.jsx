import toast from "react-hot-toast";
import { FiAlertTriangle, FiCheckCircle, FiXCircle } from "react-icons/fi";

const TOAST_ID = "single-toast";

const toastVariants = {
    success: {
        Icon: FiCheckCircle,
        className: "border-emerald-200 bg-emerald-50 text-emerald-800",
    },
    error: {
        Icon: FiXCircle,
        className: "border-red-200 bg-red-50 text-red-800",
    },
    warning: {
        Icon: FiAlertTriangle,
        className: "border-amber-200 bg-amber-50 text-amber-800",
    },
};

const ToastMessage = ({ type, message, visible }) => {
    const variant = toastVariants[type] || toastVariants.success;
    const { Icon } = variant;

    return (
        <div
            className={`flex items-center gap-3 border px-4 py-2 text-xs font-medium shadow-lg transition-opacity ${variant.className} ${visible ? "opacity-100" : "opacity-0"}`}
        >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{message}</span>
        </div>
    );
};

export const showToast = (type, message) =>
    toast.custom(
        (toastItem) => (
            <ToastMessage
                type={type}
                message={message}
                visible={toastItem.visible}
            />
        ),
        {
            id: TOAST_ID, // same id => new toast replaces the old one, so only one shows at a time
            duration: 4000,
        }
    );

export const showSuccessToast = (message) => showToast("success", message);
export const showErrorToast = (message) => showToast("error", message);
export const showWarningToast = (message) => showToast("warning", message);

export default ToastMessage;