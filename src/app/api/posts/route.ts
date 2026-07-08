import { NextResponse } from 'next/server';
import { createPost, type CreatedPost } from './store';

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<Omit<CreatedPost, 'createdAt'>>;

  const id = createPost({
    postType: body.postType ?? '委託',
    title: body.title ?? '',
    description: body.description ?? '',
    height: body.height ?? '',
    weight: body.weight ?? '',
    age: body.age ?? '',
    budget: body.budget ?? '',
    points: body.points ?? '',
    tags: Array.isArray(body.tags) ? body.tags : [],
  });

  return NextResponse.json({ id });
}
