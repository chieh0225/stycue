export const DRAFT_STORAGE_KEY = 'stycue:commission-post-draft';
export const TITLE_MAX_LENGTH = 40;
export const budgetOptions = ['1000 - 3000', '3000 - 5000', '5000 - 10000', '10000 以上'];
export const postTypes = ['委託', '提問', '分享'] as const;
export const pointsOptions = ['50', '75', '100'];

export type Draft = {
  title: string;
  description: string;
  height: string;
  weight: string;
  age: string;
  selectedBudget: string;
  postType: string;
  points: string;
};

export const emptyDraft: Draft = {
  title: '',
  description: '',
  height: '',
  weight: '',
  age: '',
  selectedBudget: budgetOptions[0],
  postType: postTypes[0],
  points: pointsOptions[0],
};
