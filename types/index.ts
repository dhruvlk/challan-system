export interface Company {
  id: string;
  user_id?: string;
  name: string;
  logo_url?: string | null;
  gst_number?: string | null;
  hsn_code?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  pan_number?: string | null;
  tagline?: string | null;
  bank_name?: string | null;
  account_name?: string | null;
  account_number?: string | null;
  ifsc_code?: string | null;
  branch?: string | null;
  bank_details?: string | null;
  signature_url?: string | null;
  terms_conditions?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

/** @deprecated Use Customer — kept as alias for gradual migration */
export type Party = Customer;

export interface Customer {
  id: string;
  company_id: string;
  name: string;
  contact_person?: string | null;
  mobile?: string | null;
  email?: string | null;
  gst_number?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  broker?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Product {
  id: string;
  company_id: string;
  name: string;
  hsn_code?: string | null;
  unit: string;
  default_rate: number;
  description?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ChallanItem {
  id: string;
  challan_id: string;
  product_id?: string | null;
  description?: string | null;
  quantity?: number | null;
  unit?: string | null;
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
  product?: Product;
}

export type ChallanStatus = 'Draft' | 'Pending' | 'Delivered' | 'Returned' | 'Cancelled';

export interface Challan {
  id: string;
  company_id: string;
  customer_id: string;
  /** @deprecated use customer_id */
  party_id?: string;
  challan_number: string;
  date: string;
  bill_number?: string | null;
  vehicle_number?: string | null;
  driver_name?: string | null;
  driver_mobile?: string | null;
  delivery_location?: string | null;
  broker?: string | null;
  payment_within_value?: number | null;
  payment_within_unit?: string | null;
  payment_terms?: string | null;
  due_date?: string | null;
  amount_in_words?: string | null;
  notes?: string | null;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
  status: ChallanStatus;
  subtotal?: number;
  discount?: number;
  cgst_percent?: number;
  sgst_percent?: number;
  igst_percent?: number;
  cgst_amount?: number;
  sgst_amount?: number;
  igst_amount?: number;
  other_charges?: number;
  grand_total?: number;
  customer?: Customer;
  /** @deprecated use customer */
  party?: Customer;
  items?: ChallanItem[];
}

export interface ChallanFilters {
  search?: string;
  status?: ChallanStatus | '';
  customerId?: string;
  broker?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface DashboardStats {
  totalCustomers: number;
  totalChallans: number;
  todayChallans: number;
  monthlySales: number;
  recentChallans: Challan[];
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
