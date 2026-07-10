// Mirrors the backend's ImageCategory enum (C#). Keep ids in sync with backend —
// note 99 for "其他" is not the next sequential id.
// id 7 is backend's "Onepiece" category — displayed as '洋裝'.
export const IMAGE_CATEGORIES = [
  { id: 1, label: '上衣' },
  { id: 2, label: '下身' },
  { id: 3, label: '鞋子' },
  { id: 4, label: '配件' },
  { id: 5, label: '包包' },
  { id: 6, label: '外套' },
  { id: 7, label: '洋裝' },
  { id: 99, label: '其他' },
] as const;

export type ImageCategoryId = (typeof IMAGE_CATEGORIES)[number]['id'];

export const DEFAULT_IMAGE_CATEGORY_ID: ImageCategoryId = IMAGE_CATEGORIES[0].id;

const LABEL_BY_ID = new Map<number, string>(IMAGE_CATEGORIES.map((c) => [c.id, c.label]));

export function categoryLabel(id: number): string {
  return LABEL_BY_ID.get(id) ?? '其他';
}
