import { notFound } from 'next/navigation';
import { getPostServer } from '@/lib/post-server';
import EditPostForm from './edit-post-form';

export default async function EditSharePostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getPostServer(id);
  // canEdit is false for both "not the owner" and "anonymous" — either way
  // there's nothing editable to show, same 404 treatment as a missing post.
  if (!result.success || !result.data || !result.data.canEdit) notFound();
  const post = result.data;

  return (
    <EditPostForm
      postId={id}
      initialTitle={post.title}
      initialContent={post.content}
      postType={post.postType}
      initialOutfitStyle={post.outfitStyle ?? ''}
      initialOutfitOccasion={post.outfitOccasion ?? ''}
      initialOutfitDate={post.outfitDate ?? ''}
      initialOutfitLocation={post.outfitLocation ?? ''}
      imageIds={post.images.map((image) => image.imageId)}
      tagIds={post.tags.map((tag) => tag.tagId)}
    />
  );
}
