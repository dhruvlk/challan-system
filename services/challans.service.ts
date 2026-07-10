import { createClient } from '@/lib/supabase/client';
import { calculateTax, sumItemAmounts } from '@/lib/tax';
import type {
  Challan,
  ChallanFilters,
  ChallanItem,
  ChallanStatus,
  PaginatedResult,
  PaginationParams,
} from '@/types';

const supabase = () => createClient();

const CHALLAN_SELECT = `
  *,
  customer:customers(*),
  items:challan_items(*, product:products(*))
`;

function mapChallan(row: Record<string, unknown>): Challan {
  const customer = row.customer as Challan['customer'];
  const items = (row.items as ChallanItem[] | null) ?? [];
  return {
    ...(row as unknown as Challan),
    customer,
    party: customer,
    customer_id: (row.customer_id as string) ?? (row.party_id as string),
    party_id: (row.customer_id as string) ?? (row.party_id as string),
    items,
  };
}

type ChallanRpcClient = {
  rpc(
    fn: 'generate_challan_number',
    args: { p_company_id: string }
  ): PromiseLike<{ data: string | null; error: { message: string } | null }>;
};

export async function generateChallanNumber(companyId: string): Promise<string> {
  const { data, error } = await (supabase() as unknown as ChallanRpcClient).rpc(
    'generate_challan_number',
    { p_company_id: companyId }
  );
  if (error) throw error;
  if (!data) throw new Error('Failed to generate challan number');
  return data;
}

export async function getChallans(
  companyId: string,
  filters: ChallanFilters = {}
): Promise<Challan[]> {
  let query = supabase()
    .from('challans')
    .select(CHALLAN_SELECT)
    .eq('company_id', companyId)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });

  if (filters.status) query = query.eq('status', filters.status);
  if (filters.customerId) query = query.eq('customer_id', filters.customerId);
  if (filters.broker) query = query.ilike('broker', `%${filters.broker}%`);
  if (filters.dateFrom) query = query.gte('date', filters.dateFrom);
  if (filters.dateTo) query = query.lte('date', filters.dateTo);

  const { data, error } = await query;
  if (error) throw error;

  let challans = (data ?? []).map(mapChallan);

  if (filters.search?.trim()) {
    const q = filters.search.trim().toLowerCase();
    challans = challans.filter(
      (c) =>
        c.challan_number.toLowerCase().includes(q) ||
        c.customer?.name?.toLowerCase().includes(q) ||
        c.party?.name?.toLowerCase().includes(q) ||
        c.customer?.gst_number?.toLowerCase().includes(q) ||
        c.broker?.toLowerCase().includes(q) ||
        c.items?.some(
          (i) =>
            i.fabric_name?.toLowerCase().includes(q) ||
            i.quality?.toLowerCase().includes(q) ||
            i.product?.name?.toLowerCase().includes(q) ||
            i.description?.toLowerCase().includes(q)
        )
    );
  }

  return challans;
}

export async function getChallansPaginated(
  companyId: string,
  filters: ChallanFilters = {},
  { page = 1, pageSize = 15 }: PaginationParams = {}
): Promise<PaginatedResult<Challan>> {
  const all = await getChallans(companyId, filters);
  const total = all.length;
  const from = (page - 1) * pageSize;
  const data = all.slice(from, from + pageSize);
  return {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize) || 1,
  };
}

export async function getChallanById(id: string): Promise<Challan | undefined> {
  const { data, error } = await supabase()
    .from('challans')
    .select(CHALLAN_SELECT)
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return undefined;
    throw error;
  }
  return mapChallan(data);
}

type ChallanInput = Omit<Challan, 'id' | 'created_at' | 'updated_at' | 'customer' | 'party' | 'items'> & {
  items: Omit<ChallanItem, 'id' | 'challan_id' | 'created_at' | 'updated_at' | 'product'>[];
};

function buildChallanPayload(
  challan: ChallanInput,
  userId?: string
) {
  const subtotal = sumItemAmounts(challan.items);
  const tax = calculateTax({
    subtotal,
    discount: challan.discount ?? 0,
    cgstPercent: challan.cgst_percent ?? 2.5,
    sgstPercent: challan.sgst_percent ?? 2.5,
    igstPercent: challan.igst_percent ?? 0,
    otherCharges: challan.other_charges ?? 0,
  });

  return {
    company_id: challan.company_id,
    customer_id: challan.customer_id ?? challan.party_id!,
    challan_number: challan.challan_number,
    date: challan.date,
    bill_number: challan.bill_number ?? null,
    vehicle_number: challan.vehicle_number ?? null,
    driver_name: challan.driver_name ?? null,
    driver_mobile: challan.driver_mobile ?? null,
    delivery_location: challan.delivery_location ?? null,
    broker: challan.broker ?? null,
    payment_within_value: challan.payment_within_value ?? null,
    payment_within_unit: challan.payment_within_unit ?? null,
    payment_terms: challan.payment_terms ?? null,
    due_date: challan.due_date ?? null,
    amount_in_words: challan.amount_in_words ?? null,
    notes: challan.notes ?? null,
    status: challan.status,
    created_by: userId ?? challan.created_by ?? null,
    subtotal: tax.subtotal,
    discount: tax.discount,
    cgst_percent: tax.cgstPercent,
    sgst_percent: tax.sgstPercent,
    igst_percent: tax.igstPercent,
    cgst_amount: tax.cgstAmount,
    sgst_amount: tax.sgstAmount,
    igst_amount: tax.igstAmount,
    other_charges: tax.otherCharges,
    grand_total: tax.grandTotal,
  };
}

function buildItemPayload(item: Omit<ChallanItem, 'id' | 'challan_id' | 'created_at' | 'updated_at' | 'product'>) {
  return {
    product_id: item.product_id ?? null,
    description: item.description ?? null,
    quantity: item.quantity ?? item.meter ?? null,
    unit: item.unit ?? 'Mtrs',
    quality: item.quality ?? null,
    fabric_name: item.fabric_name ?? null,
    color: item.color ?? null,
    design: item.design ?? null,
    roll_number: item.roll_number ?? null,
    lot_number: item.lot_number ?? null,
    meter: item.meter ?? item.quantity ?? null,
    weight: item.weight ?? null,
    rate: item.rate ?? null,
    amount: item.amount ?? null,
    remarks: item.remarks ?? null,
  };
}

export async function addChallan(
  challan: ChallanInput,
  userId?: string
): Promise<Challan> {
  const payload = buildChallanPayload(challan, userId);

  const { data, error } = await supabase()
    .from('challans')
    .insert(payload)
    .select('id')
    .single();

  if (error) throw error;

  const itemsPayload = challan.items.map((item) => ({
    ...buildItemPayload(item),
    challan_id: data.id,
  }));

  const { error: itemsError } = await supabase().from('challan_items').insert(itemsPayload);
  if (itemsError) throw itemsError;

  const created = await getChallanById(data.id);
  if (!created) throw new Error('Failed to load created challan');
  return created;
}

export async function updateChallan(challan: Challan & { items: ChallanItem[] }): Promise<Challan> {
  const payload = buildChallanPayload(challan, challan.created_by ?? undefined);

  const { error } = await supabase()
    .from('challans')
    .update(payload)
    .eq('id', challan.id);

  if (error) throw error;

  await supabase().from('challan_items').delete().eq('challan_id', challan.id);

  const itemsPayload = challan.items.map((item) => ({
    ...buildItemPayload(item),
    challan_id: challan.id,
  }));

  const { error: itemsError } = await supabase().from('challan_items').insert(itemsPayload);
  if (itemsError) throw itemsError;

  const updated = await getChallanById(challan.id);
  if (!updated) throw new Error('Failed to load updated challan');
  return updated;
}

export async function deleteChallan(id: string): Promise<void> {
  const { error } = await supabase().from('challans').delete().eq('id', id);
  if (error) throw error;
}

export async function duplicateChallan(
  challanId: string,
  companyId: string,
  userId?: string
): Promise<Challan> {
  const source = await getChallanById(challanId);
  if (!source) throw new Error('Challan not found');

  const challanNumber = await generateChallanNumber(companyId);

  return addChallan(
    {
      company_id: companyId,
      customer_id: source.customer_id,
      challan_number: challanNumber,
      date: new Date().toISOString().split('T')[0],
      bill_number: source.bill_number,
      vehicle_number: source.vehicle_number,
      driver_name: source.driver_name,
      driver_mobile: source.driver_mobile,
      delivery_location: source.delivery_location,
      broker: source.broker,
      payment_within_value: source.payment_within_value,
      payment_within_unit: source.payment_within_unit,
      payment_terms: source.payment_terms,
      due_date: source.due_date,
      amount_in_words: source.amount_in_words,
      notes: source.notes,
      status: 'Draft' as ChallanStatus,
      subtotal: source.subtotal,
      discount: source.discount,
      cgst_percent: source.cgst_percent,
      sgst_percent: source.sgst_percent,
      igst_percent: source.igst_percent,
      other_charges: source.other_charges,
      items: (source.items ?? []).map(({ id: _id, challan_id: _cid, product: _p, ...item }) => item),
    },
    userId
  );
}
