import { useEffect } from "react";
import { FiAlertTriangle, FiX } from "react-icons/fi";

const DeleteConfirmModal = ({
    open,
    onClose,
    onConfirm,
    loading = false,
    title = "Delete Address",
    message = "Are you sure you want to delete this address? This action cannot be undone.",
    confirmLabel = "Delete",
}) => {
    // close on Escape + lock body scroll while open
    useEffect(() => {
        if (!open) return undefined;

        const onKeyDown = (event) => {
            if (event.key === "Escape" && !loading) onClose();
        };
        document.addEventListener("keydown", onKeyDown);
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", onKeyDown);
            document.body.style.overflow = previousOverflow;
        };
    }, [open, loading, onClose]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !loading) onClose();
            }}
        >
            <div
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="delete-modal-title"
                className="w-full max-w-sm overflow-hidden bg-white shadow-lg"
            >
                <div className="flex items-start justify-between gap-3 px-5 pt-5">
                    <div className="flex items-start gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                            <FiAlertTriangle className="h-4 w-4" />
                        </span>
                        <div>
                            <h2 id="delete-modal-title" className="text-base font-bold text-gray-900">
                                {title}
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">{message}</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        aria-label="Close"
                        className="cursor-pointer rounded-full p-1.5 text-gray-500 transition-colors hover:bg-gray-100 disabled:opacity-50"
                    >
                        <FiX className="h-4 w-4" />
                    </button>
                </div>

                <div className="mt-5 flex gap-3 border-t border-gray-100 px-5 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 cursor-pointer border border-gray-300 bg-white py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex-1 cursor-pointer bg-red-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {loading ? "Deleting..." : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmModal;