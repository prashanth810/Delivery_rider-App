import { FaMotorcycle } from "react-icons/fa";

export default function Brand({ light = false }) {
    return (
        <span className={`brand-lockup${light ? " brand-lockup-light" : ""}`}>
            <span className="brand-mark" aria-hidden="true"><FaMotorcycle /></span>
            <span> Fresh<span className="brand-accent">rider</span></span>
        </span>
    );
}
