import type { ApiEnvelope } from '@/types/image';
import type { TagCategoryValue, TagResponse, TagSourceValue } from '@/types/tag';

export async function searchTags(params: {
  source: TagSourceValue;
  keyword?: string;
  tagCategory?: TagCategoryValue;
  limit?: number;
}): Promise<ApiEnvelope<TagResponse[]>> {
  const query = new URLSearchParams({ Source: String(params.source) });
  if (params.keyword) query.set('Keyword', params.keyword);
  if (params.tagCategory !== undefined) query.set('TagCategory', String(params.tagCategory));
  if (params.limit !== undefined) query.set('Limit', String(params.limit));

  const res = await fetch(`/api/tags?${query.toString()}`);
  return (await res.json()) as ApiEnvelope<TagResponse[]>;
}

export async function createTags(
  tags: { name: string; tagCategory?: TagCategoryValue | null }[],
): Promise<ApiEnvelope<TagResponse[]>> {
  const res = await fetch('/api/tags', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tags }),
  });
  return (await res.json()) as ApiEnvelope<TagResponse[]>;
}
