import type { HomepageFeedResponse, HomepageQuery } from '@/types/homepage';
import type { ApiEnvelope } from '@/types/image';

export async function getHomepageFeed(
  query: HomepageQuery = {},
): Promise<ApiEnvelope<HomepageFeedResponse>> {
  const params = new URLSearchParams();
  if (query.sortBy) params.set('SortBy', query.sortBy);
  if (query.filter) params.set('Filter', query.filter);
  if (query.page !== undefined) params.set('Page', String(query.page));
  if (query.pageSize !== undefined) params.set('PageSize', String(query.pageSize));

  const queryString = params.toString();
  const res = await fetch(`/api/homepage${queryString ? `?${queryString}` : ''}`);
  return (await res.json()) as ApiEnvelope<HomepageFeedResponse>;
}
