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

const CATEGORY_NAME_TO_VALUE: Record<string, TagCategoryValue> = {
  occasion: TAG_CATEGORY.Occasion,
  style: TAG_CATEGORY.Style,
  season: TAG_CATEGORY.Season,
  color: TAG_CATEGORY.Color,
  fit: TAG_CATEGORY.Fit,
};

// The backend has returned tagCategory as either a number (1-5) or a
// lowercase enum name ("occasion", ...) — normalize to the numeric
// TagCategoryValue the rest of the app is built around.
export function normalizeTagCategory(value: unknown): TagCategoryValue | null {
  if (typeof value === 'number') {
    return (Object.values(TAG_CATEGORY) as number[]).includes(value)
      ? (value as TagCategoryValue)
      : null;
  }
  if (typeof value === 'string') {
    return CATEGORY_NAME_TO_VALUE[value.toLowerCase()] ?? null;
  }
  return null;
}

export function normalizeTagResponse(tag: {
  tagId: number;
  name: string;
  tagCategory: unknown;
  usageCount: number | null;
}): TagResponse {
  return { ...tag, tagCategory: normalizeTagCategory(tag.tagCategory) };
}
