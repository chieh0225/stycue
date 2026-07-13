import type { ApiEnvelope } from '@/types/image';
import type {
  DailyPointClaimResponse,
  PagedResponse,
  PointTransactionQuery,
  PointTransactionResponse,
  PointWalletResponse,
} from '@/types/points';

export async function getPointWallet(): Promise<ApiEnvelope<PointWalletResponse>> {
  const res = await fetch('/api/points/me');
  return (await res.json()) as ApiEnvelope<PointWalletResponse>;
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
