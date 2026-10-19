import { useState } from "react";
import { FiUser, FiMapPin, FiPhone } from "react-icons/fi";
import { Button, Field, Select } from "../../components/ui";
import { StepHeader } from "../../components/StepHeader";
import useStepSave from "../../hooks/useStepSave";
import { validPhone } from "../../constants/onboarding";

const PersonalDetails = () => {
    const { save, saved, loading, user } = useStepSave("personal");
    const [f, setF] = useState(saved || { fullName: user?.fullName || "", dob: "", gender: "", address: "", city: "", pincode: "", emergencyName: "", emergencyPhone: "" });
    const [er, setEr] = useState({});
    const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));

    const submit = (e) => {
        e.preventDefault();
        const x = {};
        if (f.fullName.trim().length < 3) x.fullName = "Required";
        if (!f.dob) x.dob = "Required";
        else if ((Date.now() - new Date(f.dob)) / 31557600000 < 18) x.dob = "You must be 18 or older";
        if (!f.gender) x.gender = "Required";
        if (f.address.trim().length < 5) x.address = "Enter your full address";
        if (!f.city.trim()) x.city = "Required";
        if (!/^\d{6}$/.test(f.pincode)) x.pincode = "6-digit pincode";
        if (!f.emergencyName.trim()) x.emergencyName = "Required";
        if (!validPhone(f.emergencyPhone)) x.emergencyPhone = "Valid 10-digit number";
        else if (f.emergencyPhone === user?.phone) x.emergencyPhone = "Use a different number than yours";
        setEr(x);
        if (!Object.keys(x).length) save(f);
    };

    return (
        <form onSubmit={submit} noValidate>
            <StepHeader n={1} title="Personal Details" subtitle="Add your basic information" />
            <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full Name (as per Aadhaar)" icon={FiUser} value={f.fullName} onChange={set("fullName")} error={er.fullName} className="sm:col-span-2" />
                <Field label="Date of Birth" type="date" value={f.dob} onChange={set("dob")} error={er.dob} max={new Date().toISOString().slice(0, 10)} />
                <Select label="Gender" options={["Male", "Female", "Other"]} value={f.gender} onChange={set("gender")} error={er.gender} />
                <Field label="Address" icon={FiMapPin} placeholder="House no, street, area" value={f.address} onChange={set("address")} error={er.address} className="sm:col-span-2" />
                <Field label="City" value={f.city} onChange={set("city")} error={er.city} />
                <Field label="Pincode" inputMode="numeric" maxLength={6} value={f.pincode} onChange={(e) => setF((x) => ({ ...x, pincode: e.target.value.replace(/\D/g, "") }))} error={er.pincode} />
                <Field label="Emergency Contact Name" value={f.emergencyName} onChange={set("emergencyName")} error={er.emergencyName} />
                <Field label="Emergency Contact Phone" icon={FiPhone} inputMode="numeric" maxLength={10} value={f.emergencyPhone} onChange={(e) => setF((x) => ({ ...x, emergencyPhone: e.target.value.replace(/\D/g, "") }))} error={er.emergencyPhone} />
            </div>
            <div className="mt-8 flex justify-end"><Button type="submit" loading={loading} className="min-w-40">Save & Continue</Button></div>
        </form>
    );
};
export default PersonalDetails;