export type ImagePurpose = 'commissions' | 'comments';

export type ImageResponse = {
  imageId: string; // wire value is a big-int-safe string; never coerce to number
  purpose: string;
  url: string;
  category: number | null;
  brand: string | null;
};

export type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T | null;
  errorCode: string | null;
};
