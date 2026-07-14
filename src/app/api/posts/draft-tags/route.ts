import { NextResponse } from 'next/server';

// Mock endpoint: in-memory only, resets on server restart. Swap for a real
// draft-tags table (keyed by user + draft post) once the API exists.
let draftTags: { tagId: number; name: string }[] = [];

export async function GET() {
  return NextResponse.json({ tags: draftTags });
}

export async function POST(request: Request) {
  const body = (await request.json()) as { tags?: { tagId: number; name: string }[] };
  draftTags = Array.isArray(body.tags) ? body.tags : [];
  return NextResponse.json({ tags: draftTags });
}
