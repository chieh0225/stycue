export type SearchQuery = {
  keyword?: string;
  page?: number;
  pageSize?: number;
};

export type SearchHistoryResponse = {
  id: number;
  keyword: string;
  searchedAt: string;
};
