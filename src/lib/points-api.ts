import type { ApiEnvelope } from '@/types/image';
import type {
  CreatePointPurchaseResponse,
  DailyPointClaimResponse,
  PagedResponse,
  PointProductResponse,
  PointPurchaseResponse,
  PointTransactionQuery,
  PointTransactionResponse,
  PointWalletResponse,
} from '@/types/points';

// ECPay 的 ClientBackURL 是後端寫死的裸網址，不會帶 orderId query string，
// 所以導去 ECPay 前要自己先把 orderId 存起來，付款結果頁再讀回來。
export const PENDING_POINT_PURCHASE_ORDER_ID_KEY = 'stycue:pending-point-purchase-order-id';

export async function getPointWallet(): Promise<ApiEnvelope<PointWalletResponse>> {
  const res = await fetch('/api/points/me');
  return (await res.json()) as ApiEnvelope<PointWalletResponse>;
}

export async function getPointProducts(): Promise<ApiEnvelope<PointProductResponse[]>> {
  const res = await fetch('/api/points/products');
  return (await res.json()) as ApiEnvelope<PointProductResponse[]>;
}

export async function createPointPurchase(
  pointProductId: number,
): Promise<ApiEnvelope<CreatePointPurchaseResponse>> {
  const res = await fetch('/api/points/purchases', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pointProductId }),
  });
  return (await res.json()) as ApiEnvelope<CreatePointPurchaseResponse>;
}

export async function getPointPurchase(
  orderId: number,
): Promise<ApiEnvelope<PointPurchaseResponse>> {
  const res = await fetch(`/api/points/purchases/${orderId}`);
  return (await res.json()) as ApiEnvelope<PointPurchaseResponse>;
}

export async function claimDailyPoints(): Promise<ApiEnvelope<DailyPointClaimResponse>> {
  const res = await fetch('/api/points/daily', { method: 'POST' });
  return (await res.json()) as ApiEnvelope<DailyPointClaimResponse>;
}

export async function getPointTransactions(
  query: PointTransactionQuery = {},
): Promise<ApiEnvelope<PagedResponse<PointTransactionResponse>>> {
  const params = new URLSearchParams();
  if (query.transactionType !== undefined)
    params.set('TransactionType', String(query.transactionType));
  if (query.referenceType !== undefined) params.set('ReferenceType', String(query.referenceType));
  if (query.referenceId !== undefined) params.set('ReferenceId', String(query.referenceId));
  if (query.startAt) params.set('StartAt', query.startAt);
  if (query.endAt) params.set('EndAt', query.endAt);
  if (query.page !== undefined) params.set('Page', String(query.page));
  if (query.pageSize !== undefined) params.set('PageSize', String(query.pageSize));

  const queryString = params.toString();
  const res = await fetch(`/api/points/transactions${queryString ? `?${queryString}` : ''}`);
  return (await res.json()) as ApiEnvelope<PagedResponse<PointTransactionResponse>>;
}
