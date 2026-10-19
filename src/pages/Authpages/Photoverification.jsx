import { useEffect, useRef, useState } from "react";
import { FiCamera, FiUpload, FiRefreshCw } from "react-icons/fi";
import { Button } from "../../components/ui";
import { StepHeader } from "../../components/StepHeader";
import { showErrorToast } from "../../components/Toast";
import useStepSave from "../../hooks/useStepSave";

// shrink to a small JPEG so it is light to store/upload
const shrink = (source, w, h) => {
    const c = document.createElement("canvas");
    const size = 320; const scale = Math.min(size / w, size / h, 1);
    c.width = w * scale; c.height = h * scale;
    c.getContext("2d").drawImage(source, 0, 0, c.width, c.height);
    return c.toDataURL("image/jpeg", 0.75);
};

const PhotoVerification = () => {
    const { save, back, saved, loading } = useStepSave("photo");
    const [photo, setPhoto] = useState(saved?.selfie || null);
    const [camOn, setCamOn] = useState(false);
    const video = useRef(null); const stream = useRef(null); const fileRef = useRef(null);

    const stop = () => { stream.current?.getTracks().forEach((t) => t.stop()); stream.current = null; setCamOn(false); };
    useEffect(() => stop, []);

    const openCam = async () => {
        try {
            stream.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
            setCamOn(true);
            requestAnimationFrame(() => { if (video.current) video.current.srcObject = stream.current; });
        } catch { showErrorToast("Camera not available. Please upload a selfie instead."); }
    };
    const capture = () => {
        const v = video.current;
        setPhoto(shrink(v, v.videoWidth, v.videoHeight));
        stop();
    };
    const upload = (file) => {
        if (!file) return;
        if (!file.type.startsWith("image/")) return showErrorToast("Please choose an image file");
        const img = new Image();
        img.onload = () => setPhoto(shrink(img, img.width, img.height));
        img.src = URL.createObjectURL(file);
    };

    return (
        <div>
            <StepHeader n={4} title="Photo Verification" subtitle="Take a clear selfie so we can match it with your documents" />
            <div className="mx-auto flex max-w-sm flex-col items-center">
                <div className="relative flex h-64 w-64 items-center justify-center overflow-hidden rounded-full border-4 border-dashed border-brand-200 bg-brand-50">
                    {camOn ? <video ref={video} autoPlay playsInline muted className="h-full w-full -scale-x-100 object-cover" />
                        : photo ? <img src={photo} alt="Your selfie" className="h-full w-full object-cover" />
                            : <FiCamera size={56} className="text-brand-200" />}
                </div>
                <ul className="mt-5 space-y-1 text-xs text-slate-500">
                    <li>• Face the camera in good lighting</li><li>• No cap, mask or sunglasses</li><li>• Only you should be in the photo</li>
                </ul>
                <div className="mt-5 flex flex-wrap justify-center gap-3">
                    {camOn ? <Button onClick={capture}><FiCamera /> Capture</Button> : (
                        <>
                            <Button onClick={openCam} variant={photo ? "outline" : "primary"}>{photo ? <FiRefreshCw /> : <FiCamera />}{photo ? "Retake" : "Open Camera"}</Button>
                            <Button variant="outline" onClick={() => fileRef.current.click()}><FiUpload /> Upload</Button>
                        </>
                    )}
                    <input ref={fileRef} type="file" accept="image/*" capture="user" hidden onChange={(e) => { upload(e.target.files[0]); e.target.value = ""; }} />
                </div>
            </div>
            <div className="mt-8 flex justify-between">
                <Button variant="outline" onClick={back} className="min-w-28">Back</Button>
                <Button loading={loading} className="min-w-28" onClick={() => (photo ? save({ selfie: photo }) : showErrorToast("Please take or upload a selfie"))}>Next</Button>
            </div>
        </div>
    );
};
export default PhotoVerification;