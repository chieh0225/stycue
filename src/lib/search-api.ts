import type { HomepageFeedResponse } from '@/types/homepage';
import type { ApiEnvelope } from '@/types/image';
import type { SearchHistoryResponse, SearchQuery } from '@/types/search';

export async function searchPosts(query: SearchQuery): Promise<ApiEnvelope<HomepageFeedResponse>> {
  const params = new URLSearchParams();
  if (query.keyword) params.set('Keyword', query.keyword);
  if (query.page !== undefined) params.set('Page', String(query.page));
  if (query.pageSize !== undefined) params.set('PageSize', String(query.pageSize));

  const queryString = params.toString();
  const res = await fetch(`/api/search${queryString ? `?${queryString}` : ''}`);
  return (await res.json()) as ApiEnvelope<HomepageFeedResponse>;
}

export async function getSearchHistory(
  limit?: number,
): Promise<ApiEnvelope<SearchHistoryResponse[]>> {
  const params = new URLSearchParams();
  if (limit !== undefined) params.set('Limit', String(limit));

  const queryString = params.toString();
  const res = await fetch(`/api/search-history${queryString ? `?${queryString}` : ''}`);
  return (await res.json()) as ApiEnvelope<SearchHistoryResponse[]>;
}
