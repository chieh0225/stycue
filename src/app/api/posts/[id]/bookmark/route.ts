import { NextResponse } from 'next/server';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { bookmarked } = (await request.json()) as { bookmarked: boolean };

  // Mock endpoint: no persistence yet. Swap this for a real write once the posts API exists.
  return NextResponse.json({ id, bookmarked });
}
