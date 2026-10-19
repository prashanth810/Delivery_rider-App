import { useState } from "react";
import { FaMotorcycle } from "react-icons/fa";
import { MdElectricBike, MdOutlineElectricMoped } from "react-icons/md";
import { Button, Field, Select } from "../../components/ui";
import { StepHeader } from "../../components/StepHeader";
import useStepSave from "../../hooks/useStepSave";
import { BRANDS, COLORS, VEHICLES, normVehicleNo, validVehicleNo } from "../../constants/onboarding";

const ICONS = { Bike: FaMotorcycle, Scooter: MdOutlineElectricMoped, "Electric Bike": MdElectricBike };

const VehicleInfo = () => {
    const { save, back, saved, loading, user } = useStepSave("vehicle");
    const [f, setF] = useState(saved || { type: user?.vehicleType || "", number: user?.vehicleNumber || "", brand: "", model: "", color: "", year: "" });
    const [er, setEr] = useState({});
    const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));

    const submit = (e) => {
        e.preventDefault();
        const x = {};
        if (!f.type) x.type = "Select a vehicle type";
        if (!validVehicleNo(f.number)) x.number = "Format e.g. TS08AB1234";
        if (!f.brand) x.brand = "Required";
        if (!f.model.trim()) x.model = "Required";
        if (!f.color) x.color = "Required";
        const y = Number(f.year);
        if (!(y >= 2005 && y <= new Date().getFullYear())) x.year = "Enter a valid year (2005+)";
        setEr(x);
        if (!Object.keys(x).length) save({ ...f, number: normVehicleNo(f.number) });
    };

    return (
        <form onSubmit={submit} noValidate>
            <StepHeader n={3} title="Vehicle Information" subtitle="Add your vehicle details" />
            <p className="mb-2 text-sm font-semibold text-slate-700">Vehicle Type</p>
            <div className="grid grid-cols-3 gap-3">
                {VEHICLES.map((v) => {
                    const Icon = ICONS[v]; const on = f.type === v;
                    return (
                        <button type="button" key={v} onClick={() => setF((x) => ({ ...x, type: v }))}
                            className={`flex flex-col items-center gap-1.5 rounded-2xl border-2 py-4 text-sm font-semibold transition ${on ? "border-brand-500 bg-brand-50 text-brand-700" : "border-slate-200 text-slate-500 hover:border-brand-200"}`}>
                            <Icon size={28} />{v}
                        </button>
                    );
                })}
            </div>
            {er.type && <p className="mt-1 text-xs text-red-500">{er.type}</p>}

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Field label="Vehicle Number" placeholder="e.g. TS08AB1234" value={f.number} onChange={(e) => setF((x) => ({ ...x, number: e.target.value.toUpperCase() }))} error={er.number} className="sm:col-span-2" />
                <Select label="Vehicle Brand" options={BRANDS} placeholder="Select brand" value={f.brand} onChange={set("brand")} error={er.brand} />
                <Field label="Vehicle Model" placeholder="e.g. Activa 6G" value={f.model} onChange={set("model")} error={er.model} />
                <Select label="Vehicle Color" options={COLORS} placeholder="Select color" value={f.color} onChange={set("color")} error={er.color} />
                <Field label="Manufacture Year" inputMode="numeric" maxLength={4} placeholder="e.g. 2022" value={f.year} onChange={(e) => setF((x) => ({ ...x, year: e.target.value.replace(/\D/g, "") }))} error={er.year} />
            </div>
            <div className="mt-8 flex justify-between"><Button type="button" variant="outline" onClick={back} className="min-w-28">Back</Button><Button type="submit" loading={loading} className="min-w-28">Next</Button></div>
        </form>
    );
};
export default VehicleInfo;