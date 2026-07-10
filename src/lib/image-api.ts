import type { ApiEnvelope, ImagePurpose, ImageResponse } from '@/types/image';

export async function uploadImage(
  purpose: ImagePurpose,
  file: File,
  category?: number,
  brand?: string,
): Promise<ApiEnvelope<ImageResponse>> {
  const formData = new FormData();
  formData.append('File', file);
  if (category !== undefined) formData.append('Category', String(category));
  if (brand) formData.append('Brand', brand);

  const res = await fetch(`/api/images/${purpose}`, { method: 'POST', body: formData });
  return (await res.json()) as ApiEnvelope<ImageResponse>;
}

export async function deleteImage(imageId: string): Promise<ApiEnvelope<unknown>> {
  const res = await fetch(`/api/images/${imageId}`, { method: 'DELETE' });
  return (await res.json()) as ApiEnvelope<unknown>;
}
