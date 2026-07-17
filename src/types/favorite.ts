export type FavoriteTargetType = 'commission' | 'post';

export type FavoriteResponse = {
  targetType: FavoriteTargetType;
  targetId: number;
  isFavorited: boolean;
  favoriteCount: number;
};
