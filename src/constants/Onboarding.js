export const STEPS = [
    { key: "personal", n: 1, title: "Personal Details", desc: "Add your basic information" },
    { key: "documents", n: 2, title: "Upload Documents", desc: "Upload required documents" },
    { key: "vehicle", n: 3, title: "Vehicle Information", desc: "Add vehicle details" },
    { key: "photo", n: 4, title: "Photo Verification", desc: "Take a clear selfie" },
    { key: "review", n: 5, title: "Account Review", desc: "We will verify your details" },
];
export const stepPath = (key) => `/onboarding/${key}`;
// Where should this rider go next?
export const nextPathFor = (user) => {
    if (!user) return "/";
    if (user.onboarding?.completed) return "/home";
    const idx = Math.min((user.onboarding?.step || 1), STEPS.length) - 1;
    return stepPath(STEPS[idx].key);
};
export const VEHICLES = ["Bike", "Scooter", "Electric Bike"];
export const BRANDS = ["Honda", "Hero", "TVS", "Bajaj", "Suzuki", "Yamaha", "Royal Enfield", "Ola Electric", "Ather", "Other"];
export const COLORS = ["Black", "White", "Red", "Blue", "Grey", "Green", "Yellow", "Silver"];
export const validPhone = (v) => /^[6-9]\d{9}$/.test(v);
export const normVehicleNo = (v) => v.replace(/[\s-]/g, "").toUpperCase();
export const validVehicleNo = (v) => /^[A-Z]{2}\d{1,2}[A-Z]{1,3}\d{4}$/.test(normVehicleNo(v));