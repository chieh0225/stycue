import { NextResponse } from 'next/server';
import type { DraftPhoto } from '@/app/(main)/posts/new/draft';
import { addPostImages } from '../../store';

// Mirrors the real 委託文章圖片上傳 API shape: images are attached to an
// already-created post via its id, as a separate call from creating the post.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = (await request.json()) as { photos?: DraftPhoto[] };
  const photos = Array.isArray(body.photos) ? body.photos : [];

  const ok = addPostImages(id, photos);
  if (!ok) {
    return NextResponse.json({ success: false, message: '找不到這篇文章' }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
