import { Party } from "@/types";

const firstNames = ["Rajesh", "Amit", "Suresh", "Ramesh", "Dinesh", "Kiran", "Mukesh", "Vijay", "Anil", "Sunil", "Prakash", "Sanjay", "Mahesh", "Ashok", "Bharat", "Chetan", "Deepak", "Gopal", "Harish", "Jayesh"];
const lastNames = ["Patel", "Shah", "Desai", "Mehta", "Joshi", "Bhatt", "Trivedi", "Vyas", "Gandhi", "Modi"];
const cityNames = ["Surat", "Ahmedabad", "Mumbai", "Delhi", "Bhilwara", "Tirupur", "Ludhiana", "Panipat", "Ichalkaranji", "Bhiwandi"];
const states = ["Gujarat", "Gujarat", "Maharashtra", "Delhi", "Rajasthan", "Tamil Nadu", "Punjab", "Haryana", "Maharashtra", "Maharashtra"];

const generateParties = (companyId: string, prefix: string): Party[] => {
  return Array.from({ length: 20 }).map((_, i) => {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const cityIdx = Math.floor(Math.random() * cityNames.length);
    
    return {
      id: `party-${prefix}-${i + 1}`,
      company_id: companyId,
      name: `${firstName} ${lastName} Textiles`,
      contact_person: `${firstName} ${lastName}`,
      mobile: `+91 9${Math.floor(100000000 + Math.random() * 900000000)}`,
      gst_number: `24${firstName.substring(0, 5).toUpperCase().padEnd(5, 'A')}${Math.floor(1000 + Math.random() * 9000)}A1Z5`,
      address: `${Math.floor(1 + Math.random() * 500)}, Textile Market, Ring Road`,
      city: cityNames[cityIdx],
      state: states[cityIdx],
      pincode: `39${Math.floor(1000 + Math.random() * 9000)}`,
      notes: "Regular customer",
    }
  });
};

export const mockParties: Party[] = [
  ...generateParties("comp-1", "c1"),
  ...generateParties("comp-2", "c2")
];
