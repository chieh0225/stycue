export type ImagePurpose = 'commissions' | 'comments' | 'posts';

export type ImageResponse = {
  imageId: number; // wire value is a plain JSON number, despite the OpenAPI schema allowing string|integer
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
