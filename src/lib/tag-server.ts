import { cookies } from 'next/headers';
import type { ApiEnvelope } from '@/types/image';
import {
  normalizeTagResponse,
  TAG_CATEGORY,
  TAG_SOURCE,
  type TagCategoryValue,
  type TagResponse,
} from '@/types/tag';

const BACKEND_URL = 'https://stycue.rocket-coding.com/api/tags';
const ACCESS_TOKEN_COOKIE = 'stycue_access_token';
const POPULAR_LIMIT = 20;
const CATEGORIES = Object.values(TAG_CATEGORY) as TagCategoryValue[];

async function getAuthHeader(): Promise<{ Authorization: string } | null> {
  const store = await cookies();
  const token = store.get(ACCESS_TOKEN_COOKIE)?.value;
  return token ? { Authorization: `Bearer ${token}` } : null;
}

async function searchTagsServer(
  params: { source: number; keyword?: string; tagCategory?: TagCategoryValue; limit?: number },
  authHeader: { Authorization: string } | null,
): Promise<ApiEnvelope<TagResponse[]>> {
  const query = new URLSearchParams({ Source: String(params.source) });
  if (params.keyword) query.set('Keyword', params.keyword);
  if (params.tagCategory !== undefined) query.set('TagCategory', String(params.tagCategory));
  if (params.limit !== undefined) query.set('Limit', String(params.limit));

  try {
    const res = await fetch(`${BACKEND_URL}?${query.toString()}`, {
      headers: authHeader ?? undefined,
      cache: 'no-store',
    });
    const envelope = (await res.json()) as ApiEnvelope<TagResponse[]>;
    return {
      ...envelope,
      data: envelope.data ? envelope.data.map(normalizeTagResponse) : envelope.data,
    };
  } catch {
    return {
      success: false,
      message: '無法連線到伺服器，請稍後再試',
      data: null,
      errorCode: 'UPSTREAM_UNREACHABLE',
    };
  }
}

export type TagPickerInitialData = {
  groupTags: Record<number, TagResponse[]>;
  usingFallback: Record<number, boolean>;
  flatPopular: TagResponse[];
  myFrequent: TagResponse[] | null;
};

// Fetches everything the tag picker's group-browsing view needs up front, on
// the server, so the picker renders with real data on first paint instead of
// blank-then-populate on the client.
export async function fetchInitialTagPickerData(): Promise<TagPickerInitialData> {
  const authHeader = await getAuthHeader();

  const [groupResults, flatPopularRes, myFrequentRes] = await Promise.all([
    Promise.all(
      CATEGORIES.map((category) =>
        searchTagsServer(
          { source: TAG_SOURCE.Popular, tagCategory: category, limit: POPULAR_LIMIT },
          authHeader,
        ),
      ),
    ),
    searchTagsServer({ source: TAG_SOURCE.Popular, limit: POPULAR_LIMIT }, authHeader),
    authHeader
      ? searchTagsServer({ source: TAG_SOURCE.MyFrequent, limit: POPULAR_LIMIT }, authHeader)
      : Promise.resolve(null),
  ]);

  const groupTags: Record<number, TagResponse[]> = {};
  const usingFallback: Record<number, boolean> = {};
  CATEGORIES.forEach((category, index) => {
    const tags = groupResults[index]?.data ?? [];
    groupTags[category] = tags;
    if (tags.length === 0) usingFallback[category] = true;
  });

  return {
    groupTags,
    usingFallback,
    flatPopular: flatPopularRes.data ?? [],
    myFrequent: myFrequentRes?.success ? (myFrequentRes.data ?? []) : null,
  };
}
