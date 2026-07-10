export interface Company {
  id: string;
  name: string;
  logo_url?: string | null;
  gst_number?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  pan_number?: string | null;
  bank_details?: string | null;
  signature_url?: string | null;
}

export interface Party {
  id: string;
  company_id: string;
  name: string;
  contact_person?: string | null;
  mobile?: string | null;
  gst_number?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  notes?: string | null;
}

export interface ChallanItem {
  id: string;
  challan_id: string;
  quality?: string | null;
  fabric_name?: string | null;
  color?: string | null;
  design?: string | null;
  roll_number?: string | null;
  lot_number?: string | null;
  meter?: number | null;
  weight?: number | null;
  rate?: number | null;
  amount?: number | null;
  remarks?: string | null;
}

export type ChallanStatus = 'Draft' | 'Pending' | 'Delivered' | 'Returned' | 'Cancelled';

export interface Challan {
  id: string;
  company_id: string;
  challan_number: string;
  date: string;
  party_id: string;
  bill_number?: string | null;
  vehicle_number?: string | null;
  driver_name?: string | null;
  driver_mobile?: string | null;
  delivery_location?: string | null;
  broker?: string | null;
  payment_within_value?: number | null;
  payment_within_unit?: string | null;
  due_date?: string | null;
  amount_in_words?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
  status: ChallanStatus;
  
  // Nested relations for ease of use in UI
  party?: Party;
  items?: ChallanItem[];
}
