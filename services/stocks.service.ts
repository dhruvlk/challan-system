import { createClient } from '@/lib/supabase/client';
import type {
  Stock,
  StockFilters,
  StockMovement,
  StockStatus,
  StockSummary,
  StockTransactionType,
} from '@/types';
import { getStockStatus } from '@/types';
import type { StockMovementRow, StockRow } from '@/types/database';

const supabase = () => createClient();

type QualityStockRpcClient = {
  rpc(
    fn: 'process_quality_stock_change',
    args: {
      p_company_id: string;
      p_stock_id: string;
      p_delta: number;
      p_transaction_type: string;
      p_reference_type?: string | null;
      p_reference_id?: string | null;
      p_challan_id?: string | null;
      p_delivery_challan_id?: string | null;
      p_notes?: string | null;
      p_user_id?: string | null;
    }
  ): PromiseLike<{ data: null; error: { message: string } | null }>;
};

function mapStock(row: StockRow): Stock {
  const total = Number(row.total_taka) || 0;
  const sold = Number(row.sold_taka) || 0;
  return {
    id: row.id,
    company_id: row.company_id,
    quality_name: row.quality_name,
    total_taka: total,
    sold_taka: sold,
    available_taka: Number(row.available_taka) || Math.max(0, total - sold),
    hsn_code: row.hsn_code,
    remarks: row.remarks,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function mapMovement(row: StockMovementRow): StockMovement {
  return {
    id: row.id,
    stock_id: row.stock_id,
    company_id: row.company_id,
    transaction_type: row.transaction_type as StockTransactionType,
    challan_id: row.challan_id,
    delivery_challan_id: row.delivery_challan_id,
    quantity: Number(row.quantity) || 0,
    previous_stock: Number(row.previous_stock) || 0,
    current_stock: Number(row.current_stock) || 0,
    notes: row.notes,
    created_by: row.created_by,
    created_at: row.created_at,
  };
}

export function parseStockError(error: unknown): string {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'object' && error && 'message' in error
        ? String((error as { message: unknown }).message)
        : 'Stock update failed';

  const onlyMatch = message.match(/Only\s+([\d.]+)\s+Taka Available\.?/i);
  if (onlyMatch) return `Only ${onlyMatch[1]} Taka Available.`;
  return message;
}

export async function processQualityStockChange(params: {
  companyId: string;
  stockId: string;
  delta: number;
  transactionType: StockTransactionType;
  referenceType?: 'delivery_challan' | 'manual' | null;
  referenceId?: string | null;
  deliveryChallanId?: string | null;
  notes?: string | null;
  userId?: string | null;
}): Promise<void> {
  if (params.delta === 0) return;

  const { error } = await (supabase() as unknown as QualityStockRpcClient).rpc(
    'process_quality_stock_change',
    {
      p_company_id: params.companyId,
      p_stock_id: params.stockId,
      p_delta: params.delta,
      p_transaction_type: params.transactionType,
      p_reference_type: params.referenceType ?? null,
      p_reference_id: params.referenceId ?? null,
      p_challan_id: null,
      p_delivery_challan_id: params.deliveryChallanId ?? null,
      p_notes: params.notes ?? null,
      p_user_id: params.userId ?? null,
    }
  );

  if (error) throw new Error(parseStockError(error));
}

/**
 * Apply delivery challan stock deltas.
 * Positive delta increases Sold Taka and decreases Available Taka.
 */
export async function applyDeliveryStockDeltas(params: {
  companyId: string;
  previous: Map<string, number>;
  next: Map<string, number>;
  deliveryChallanId: string;
  userId?: string | null;
  isCreate?: boolean;
  isDelete?: boolean;
}): Promise<void> {
  const stockIds = new Set([...params.previous.keys(), ...params.next.keys()]);

  for (const stockId of stockIds) {
    const prevQty = params.previous.get(stockId) || 0;
    const nextQty = params.next.get(stockId) || 0;
    const delta = nextQty - prevQty;
    if (delta === 0) continue;

    let transactionType: StockTransactionType;
    if (params.isDelete) {
      transactionType = 'Delivery Challan Delete';
    } else if (params.isCreate) {
      transactionType = 'Delivery Challan';
    } else {
      transactionType = 'Delivery Challan Edit';
    }

    await processQualityStockChange({
      companyId: params.companyId,
      stockId,
      delta,
      transactionType,
      referenceType: 'delivery_challan',
      referenceId: params.deliveryChallanId,
      deliveryChallanId: params.deliveryChallanId,
      userId: params.userId,
    });
  }
}

export async function getStocks(
  companyId: string,
  filters: StockFilters = {}
): Promise<Stock[]> {
  let query = supabase()
    .from('stocks')
    .select('*')
    .eq('company_id', companyId)
    .order('quality_name');

  if (filters.search?.trim()) {
    query = query.ilike('quality_name', `%${filters.search.trim()}%`);
  }

  const { data, error } = await query;
  if (error) throw error;

  let stocks = (data ?? []).map(mapStock);
  if (filters.status) {
    stocks = stocks.filter((s) => getStockStatus(s) === (filters.status as StockStatus));
  }
  return stocks;
}

export async function getStockById(id: string): Promise<Stock | null> {
  const { data, error } = await supabase().from('stocks').select('*').eq('id', id).single();
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return mapStock(data);
}

export async function getStockSummary(companyId: string): Promise<StockSummary> {
  const stocks = await getStocks(companyId);
  return {
    totalQualities: stocks.length,
    totalTaka: stocks.reduce((sum, s) => sum + s.total_taka, 0),
    totalSoldTaka: stocks.reduce((sum, s) => sum + s.sold_taka, 0),
    totalAvailableTaka: stocks.reduce((sum, s) => sum + s.available_taka, 0),
    lowStockCount: stocks.filter((s) => getStockStatus(s) === 'Low Stock').length,
    outOfStockCount: stocks.filter((s) => getStockStatus(s) === 'Out Of Stock').length,
  };
}

export async function getStockMovements(
  companyId: string,
  stockId?: string
): Promise<StockMovement[]> {
  let query = supabase()
    .from('stock_movements')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })
    .limit(100);

  if (stockId) query = query.eq('stock_id', stockId);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(mapMovement);
}

export type StockInput = {
  company_id: string;
  quality_name: string;
  total_taka: number;
  hsn_code?: string | null;
  remarks?: string | null;
};

export async function addStock(input: StockInput, userId?: string): Promise<Stock> {
  const total = Math.max(0, Number(input.total_taka) || 0);

  const { data, error } = await supabase()
    .from('stocks')
    .insert({
      company_id: input.company_id,
      quality_name: input.quality_name.trim(),
      total_taka: total,
      sold_taka: 0,
      available_taka: total,
      hsn_code: input.hsn_code?.trim() || null,
      remarks: input.remarks?.trim() || null,
      created_by: userId ?? null,
    })
    .select()
    .single();

  if (error) throw error;

  const { error: movementError } = await supabase()
    .from('stock_movements')
    .insert({
      company_id: input.company_id,
      stock_id: data.id,
      transaction_type: 'Opening Stock',
      quantity: total,
      previous_stock: 0,
      current_stock: total,
      reference_type: 'manual',
      reference_id: null,
      challan_id: null,
      delivery_challan_id: null,
      notes: 'Opening stock',
      created_by: userId ?? null,
    });

  if (movementError) throw movementError;
  return mapStock(data);
}

export async function updateStock(
  id: string,
  input: StockInput,
  userId?: string
): Promise<Stock> {
  const existing = await getStockById(id);
  if (!existing) throw new Error('Stock not found');

  const nextTotal = Math.max(0, Number(input.total_taka) || 0);
  if (nextTotal < existing.sold_taka) {
    throw new Error(
      `Total Taka cannot be less than Sold Taka (${existing.sold_taka}).`
    );
  }

  const nextAvailable = nextTotal - existing.sold_taka;
  const prevAvailable = existing.available_taka;

  const { data, error } = await supabase()
    .from('stocks')
    .update({
      quality_name: input.quality_name.trim(),
      total_taka: nextTotal,
      sold_taka: existing.sold_taka,
      available_taka: nextAvailable,
      hsn_code: input.hsn_code?.trim() || null,
      remarks: input.remarks?.trim() || null,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  if (nextTotal !== existing.total_taka) {
    const { error: movementError } = await supabase()
      .from('stock_movements')
      .insert({
        company_id: existing.company_id,
        stock_id: id,
        transaction_type: 'Manual Stock Adjustment',
        quantity: Math.abs(nextTotal - existing.total_taka),
        previous_stock: prevAvailable,
        current_stock: nextAvailable,
        reference_type: 'manual',
        reference_id: null,
        challan_id: null,
        delivery_challan_id: null,
        notes: 'Manual total stock adjustment',
        created_by: userId ?? null,
      });

    if (movementError) throw movementError;
  }

  return mapStock(data);
}

export async function deleteStock(id: string): Promise<void> {
  const { error } = await supabase().from('stocks').delete().eq('id', id);
  if (error) throw error;
}
