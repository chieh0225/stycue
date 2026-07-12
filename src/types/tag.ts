export const TAG_CATEGORY = {
  Occasion: 1,
  Style: 2,
  Season: 3,
  Color: 4,
  Fit: 5,
} as const;

export type TagCategoryValue = (typeof TAG_CATEGORY)[keyof typeof TAG_CATEGORY];

export const TAG_SOURCE = {
  Search: 1,
  Popular: 2,
  MyFrequent: 3,
} as const;

export type TagSourceValue = (typeof TAG_SOURCE)[keyof typeof TAG_SOURCE];

export type TagResponse = {
  tagId: number;
  name: string;
  tagCategory: TagCategoryValue | null;
  usageCount: number | null;
};
