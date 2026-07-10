import { Challan, ChallanItem, ChallanStatus } from "@/types";
import { mockParties } from "./parties";

const statuses: ChallanStatus[] = ['Draft', 'Pending', 'Delivered', 'Returned', 'Cancelled'];
const fabrics = ["Cotton", "Polyester", "Silk", "Rayon", "Chiffon", "Georgette", "Crepe"];
const qualities = ["60x60 Cambric", "Semi-Stitched", "Printed", "Dyed", "Embroidered"];
const colors = ["Red", "Blue", "Green", "Yellow", "Black", "White", "Pink"];
const vehicles = ["GJ 05 XX 1111", "GJ 05 YY 2222", "MH 04 ZZ 3333", "DL 01 AB 1234"];
const drivers = ["Ramesh", "Suresh", "Mahesh", "Kamlesh"];
const brokers = ["Mahesh Broker", "Raj Trading", "Shree Agency", "Patel Brokers", "Om Enterprise"];

const generateItems = (challanId: string): ChallanItem[] => {
  const numItems = Math.floor(1 + Math.random() * 5); // 1 to 5 items
  return Array.from({ length: numItems }).map((_, i) => {
    const meter = Math.floor(100 + Math.random() * 900);
    const rate = Math.floor(50 + Math.random() * 150);
    return {
      id: `item-${challanId}-${i + 1}`,
      challan_id: challanId,
      quality: qualities[Math.floor(Math.random() * qualities.length)],
      fabric_name: fabrics[Math.floor(Math.random() * fabrics.length)],
      color: colors[Math.floor(Math.random() * colors.length)],
      design: `DSN-${Math.floor(1000 + Math.random() * 9000)}`,
      roll_number: `R-${Math.floor(100 + Math.random() * 900)}`,
      lot_number: `L-${Math.floor(10 + Math.random() * 90)}`,
      meter,
      weight: meter * 0.15, // roughly
      rate,
      amount: meter * rate,
      remarks: ""
    }
  });
};

const generateChallans = (companyId: string, prefix: string): Challan[] => {
  const companyParties = mockParties.filter(p => p.company_id === companyId);

  return Array.from({ length: 50 }).map((_, i) => {
    const challanId = `chl-${prefix}-${i + 1}`;
    const party = companyParties[Math.floor(Math.random() * companyParties.length)];
    const items = generateItems(challanId);

    // Random date within last 3 months
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 90));

    return {
      id: challanId,
      company_id: companyId,
      challan_number: `CHL-${prefix.toUpperCase()}-${String(i + 1).padStart(6, '0')}`,
      date: date.toISOString().split('T')[0],
      party_id: party.id,
      vehicle_number: vehicles[Math.floor(Math.random() * vehicles.length)],
      driver_name: drivers[Math.floor(Math.random() * drivers.length)],
      driver_mobile: `98765${Math.floor(10000 + Math.random() * 90000)}`,
      delivery_location: party.address,
      broker: brokers[Math.floor(Math.random() * brokers.length)],
      payment_within_value: 45,
      payment_within_unit: "Days",
      due_date: new Date(date.getTime() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      amount_in_words: "", // Will be calculated if needed, or left empty in mock for simplicity
      notes: "Handle with care",
      created_at: new Date(date.getTime() + i * 1000).toISOString(),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      party,
      items
    }
  });
};

export const mockChallans: Challan[] = [
  ...generateChallans("comp-1", "srt"),
  ...generateChallans("comp-2", "kf")
];
