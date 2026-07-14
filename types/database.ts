export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type CompanyMemberRow = {
  id: string;
  company_id: string;
  user_id: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ProfileRow = {
  id: string;
  full_name: string;
  mobile: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type CompanyRow = {
  id: string;
  user_id: string;
  name: string;
  logo_url: string | null;
  gst_number: string | null;
  hsn_code: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  pan_number: string | null;
  tagline: string | null;
  bank_name: string | null;
  account_name: string | null;
  account_number: string | null;
  ifsc_code: string | null;
  branch: string | null;
  bank_details: string | null;
  signature_url: string | null;
  terms_conditions: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type CustomerRow = {
  id: string;
  company_id: string;
  name: string;
  contact_person: string | null;
  mobile: string | null;
  email: string | null;
  gst_number: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  broker: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type ProductRow = {
  id: string;
  company_id: string;
  name: string;
  hsn_code: string | null;
  unit: string;
  default_rate: number;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ChallanRow = {
  id: string;
  company_id: string;
  customer_id: string;
  created_by: string | null;
  challan_number: string;
  date: string;
  bill_number: string | null;
  vehicle_number: string | null;
  delivered_by: string | null;
  driver_mobile: string | null;
  delivery_location: string | null;
  broker: string | null;
  payment_within_value: number | null;
  payment_within_unit: string | null;
  payment_terms: string | null;
  due_date: string | null;
  amount_in_words: string | null;
  notes: string | null;
  status: string;
  subtotal: number;
  discount: number;
  cgst_percent: number;
  sgst_percent: number;
  igst_percent: number;
  cgst_amount: number;
  sgst_amount: number;
  igst_amount: number;
  other_charges: number;
  grand_total: number;
  payment_status: string;
  payment_received_date: string | null;
  payment_amount_received: number;
  payment_reference: string | null;
  payment_notes: string | null;
  payment_mode: string | null;
  created_at: string;
  updated_at: string;
};

export type ChallanPaymentRow = {
  id: string;
  challan_id: string;
  company_id: string;
  amount: number;
  payment_date: string;
  payment_mode: string | null;
  reference_number: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
};

export type ChallanItemRow = {
  id: string;
  challan_id: string;
  product_id: string | null;
  description: string | null;
  quantity: number | null;
  quantity_display: string | null;
  unit: string | null;
  total_pieces: number;
  quality: string | null;
  fabric_name: string | null;
  color: string | null;
  design: string | null;
  roll_number: string | null;
  lot_number: string | null;
  meter: number | null;
  weight: number | null;
  rate: number | null;
  amount: number | null;
  remarks: string | null;
  created_at: string;
  updated_at: string;
};

export type ChallanSequenceRow = {
  company_id: string;
  last_number: number;
  updated_at: string;
};

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: CompanyRow;
        Insert: Omit<CompanyRow, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<CompanyRow>;
        Relationships: [];
      };
      customers: {
        Row: CustomerRow;
        Insert: Omit<CustomerRow, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<CustomerRow>;
        Relationships: [];
      };
      products: {
        Row: ProductRow;
        Insert: Omit<ProductRow, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<ProductRow>;
        Relationships: [];
      };
      challans: {
        Row: ChallanRow;
        Insert: Omit<ChallanRow, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<ChallanRow>;
        Relationships: [];
      };
      challan_items: {
        Row: ChallanItemRow;
        Insert: Omit<ChallanItemRow, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<ChallanItemRow>;
        Relationships: [];
      };
      challan_sequences: {
        Row: ChallanSequenceRow;
        Insert: ChallanSequenceRow;
        Update: Partial<ChallanSequenceRow>;
        Relationships: [];
      };
      challan_payments: {
        Row: ChallanPaymentRow;
        Insert: Omit<ChallanPaymentRow, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<ChallanPaymentRow>;
        Relationships: [];
      };
      profiles: {
        Row: ProfileRow;
        Insert: Omit<ProfileRow, 'created_at' | 'updated_at'> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<ProfileRow>;
        Relationships: [];
      };
      company_members: {
        Row: CompanyMemberRow;
        Insert: Omit<CompanyMemberRow, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<CompanyMemberRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      generate_challan_number: {
        Args: { p_company_id: string };
        Returns: string;
      };
      register_company_account: {
        Args: {
          p_company_name: string;
          p_owner_name: string;
          p_mobile: string;
          p_gst_number?: string | null;
          p_address?: string | null;
        };
        Returns: string;
      };
      provision_pending_company_account: {
        Args: Record<string, never>;
        Returns: string | null;
      };
      user_belongs_to_company: {
        Args: { p_company_id: string };
        Returns: boolean;
      };
      user_company_role: {
        Args: { p_company_id: string };
        Returns: string | null;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
