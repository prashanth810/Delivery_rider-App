// Extra delivery details (store contact, customer, items, codes) are added per order
// so the new "Delivery details" page has everything it needs after a rider accepts.
const details = {
    "QR-4821": {
        orderNo: "FR-20481",
        pickupAddress: "Fresh Mart, Banjara Hills, Hyderabad",
        pickupLine2: "Plot No. 12, Road No. 3, Banjara Hills, Hyderabad - 500034",
        storePhone: "+91 98765 43210",
        customer: { name: "Ananya Reddy", phone: "+91 98765 11122" },
        dropAddress: "Road No. 12, Banjara Hills, Hyderabad",
        dropLine2: "House No. 12, Near KBR Park, Hyderabad - 500034",
        notes: "Please call when you arrive.",
        drop: { lat: 17.4207, lng: 78.4399 },
        dropDistance: "2.1 km",
        dropTime: "9 min",
        items: [{ name: "Grocery package", qty: 1, note: "Fresh items and household essentials" }],
    },
    "QR-4822": {
        orderNo: "FR-20482",
        pickupAddress: "Green Basket, Madhapur, Hyderabad",
        pickupLine2: "Shop No. 4, Hitech City Main Rd, Madhapur - 500081",
        storePhone: "+91 98765 43211",
        customer: { name: "Sneha Kumar", phone: "+91 98765 22233" },
        dropAddress: "Cyber Towers, Hitech City, Hyderabad",
        dropLine2: "Tower B, 3rd Floor, Hitech City - 500081",
        notes: "Leave the package with reception.",
        drop: { lat: 17.4435, lng: 78.3772 },
        dropDistance: "1.6 km",
        dropTime: "7 min",
        items: [{ name: "Fruits & vegetables", qty: 1, note: "Fresh produce bag" }],
    },
    "QR-4823": {
        orderNo: "FR-20483",
        pickupAddress: "Daily Needs, Srnagar, Hyderabad",
        pickupLine2: "Shop No. 7, Srnagar Main Road - 500038",
        storePhone: "+91 98765 43212",
        customer: { name: "Ravi Teja", phone: "+91 98765 33344" },
        dropAddress: "Botanical Garden Rd, Kondapur, Hyderabad",
        dropLine2: "Flat 204, Sai Residency, Kondapur - 500084",
        notes: "Ring the bell twice.",
        drop: { lat: 17.46, lng: 78.364 },
        dropDistance: "3.0 km",
        dropTime: "12 min",
        items: [{ name: "Daily needs pack", qty: 1, note: "Milk, bread and household items" }],
    },
    "QR-4824": {
        orderNo: "FR-20484",
        pickupAddress: "Hyderabad Dum Biryani, Ameerpet, Hyderabad",
        pickupLine2: "Opp. Metro Station, Ameerpet - 500016",
        storePhone: "+91 98765 43213",
        customer: { name: "Meena S", phone: "+91 98765 44455" },
        dropAddress: "KPHB Colony, Phase 3, Hyderabad",
        dropLine2: "Plot 18, KPHB Phase 3 - 500072",
        notes: "Keep the food upright.",
        drop: { lat: 17.4849, lng: 78.3915 },
        dropDistance: "4.2 km",
        dropTime: "16 min",
        items: [{ name: "Chicken dum biryani", qty: 2, note: "Hot meal, handle with care" }],
    },
    "QR-4825": {
        orderNo: "FR-20485",
        pickupAddress: "Soft drinks, Miyapur, Hyderabad",
        pickupLine2: "Shop No. 2, Miyapur Cross Roads - 500049",
        storePhone: "+91 98765 43214",
        customer: { name: "Kiran P", phone: "+91 98765 55566" },
        dropAddress: "Madinaguda, Hyderabad",
        dropLine2: "Flat 8, Lakshmi Towers, Madinaguda - 500049",
        notes: "Call before reaching.",
        drop: { lat: 17.4948, lng: 78.3596 },
        dropDistance: "2.8 km",
        dropTime: "11 min",
        items: [{ name: "Soft drinks pack", qty: 1, note: "6 bottles, 750 ml each" }],
    },
};

const base = [
    { id: "QR-4821", store: "Fresh Mart", address: "Banjara Hills, Road No. 12", area: "Banjara Hills", distance: "2.4 km", payout: 64, time: "12 min", status: "New", pickup: { lat: 17.4156, lng: 78.4347 } },
    { id: "QR-4822", store: "Green Basket", address: "Madhapur, Hitech City", area: "Madhapur", distance: "3.8 km", payout: 82, time: "18 min", status: "New", pickup: { lat: 17.4486, lng: 78.3908 } },
    { id: "QR-4823", store: "Daily Needs", address: "Srnagar, Hyderabad", area: "Srnagar", distance: "3.1 km", payout: 71, time: "8 min", status: "New", pickup: { lat: 17.4401, lng: 78.3489 } },
    { id: "QR-4824", store: "Hyderabad Dum Biryani", address: "Ameerpet, Hyderabad", area: "Ameerpet", distance: "5.8 km", payout: 71, time: "6 min", status: "New", pickup: { lat: 17.4401, lng: 78.3489 } },
    { id: "QR-4825", store: "Soft drinks", address: "Miyapur, Hyderabad", area: "Miyapur", distance: "7.4 km", payout: 71, time: "20 min", status: "New", pickup: { lat: 17.4401, lng: 78.3489 } },
];

export const INITIAL_ORDERS = base.map((order) => ({ ...order, ...details[order.id] }));

// Past orders shown on the "My deliveries" page (no accept buttons there).
const daysAgo = (days, hour, minute) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    date.setHours(hour, minute, 0, 0);
    return date.getTime();
};

export const HISTORY_ORDERS = [
    { id: "FR-20470", orderNo: "FR-20470", store: "Fresh Mart", area: "Banjara Hills", customerName: "Kiran P", items: 4, distance: "2.9 km", payout: 66, status: "Delivered", at: daysAgo(0, 9, 20) },
    { id: "FR-20466", orderNo: "FR-20466", store: "Green Basket", area: "Madhapur", customerName: "Divya R", items: 5, distance: "3.4 km", payout: 74, status: "Delivered", at: daysAgo(1, 19, 5) },
    { id: "FR-20459", orderNo: "FR-20459", store: "Daily Needs", area: "Kondapur", customerName: "Suresh B", items: 2, distance: "1.8 km", payout: 49, status: "Cancelled", at: daysAgo(2, 13, 40) },
    { id: "FR-20452", orderNo: "FR-20452", store: "Hyderabad Dum Biryani", area: "Ameerpet", customerName: "Harsha V", items: 3, distance: "4.6 km", payout: 78, status: "Delivered", at: daysAgo(3, 21, 10) },
    { id: "FR-20447", orderNo: "FR-20447", store: "Fresh Mart", area: "Jubilee Hills", customerName: "Lakshmi N", items: 6, distance: "3.2 km", payout: 69, status: "Delivered", at: daysAgo(4, 11, 25) },
    { id: "FR-20439", orderNo: "FR-20439", store: "Soft drinks", area: "Miyapur", customerName: "Arjun M", items: 1, distance: "2.1 km", payout: 52, status: "Delivered", at: daysAgo(5, 17, 50) },
];

export const RIDER_LOCATION = { lat: 17.4435, lng: 78.3772 };