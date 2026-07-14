import type { UserSummaryResponse } from '@/types/commission';
import type { ImageResponse } from '@/types/image';
import type { PagedResponse } from '@/types/points';
import type { TagResponse } from '@/types/tag';

export type HomepageSortBy = 'latest' | 'mostLikes' | 'mostComments';
export type HomepageFilter = 'all' | 'postShare' | 'postAsk' | 'commission';

export type HomepageQuery = {
  sortBy?: HomepageSortBy;
  filter?: HomepageFilter;
  page?: number;
  pageSize?: number;
};

export type HomepageItemResponse = {
  itemType: 'postShare' | 'postAsk' | 'commission';
  itemId: number;
  author: UserSummaryResponse;
  title: string;
  contentPreview: string;
  createdAt: string;
  updatedAt: string | null;
  likeCount: number;
  commentCount: number;
  images: ImageResponse[];
  tags: TagResponse[];
  // Wire format for these enum-ish fields isn't fully confirmed (backend has
  // sent plain strings like "open" rather than the documented numeric
  // codes elsewhere) — kept loose rather than guessing the full value set.
  commissionStatus: string | null;
  commissionPoints: number | null;
  expiredAt: string | null;
  postType: string | null;
};

export type HomepageFeedResponse = PagedResponse<HomepageItemResponse>;
