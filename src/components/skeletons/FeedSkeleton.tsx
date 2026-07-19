import { Card } from '@/components/ui/card';

// Mirrors the post Card in (main)/page.tsx: avatar/name row, title line,
// two-line preview, image row, action row.
function FeedSkeleton() {
  const items = ['p-1', 'p-2', 'p-3'];

  return (
    <>
      {items.map((key) => (
        <Card key={key} variant="post" className="mb-4">
          <div className="p-4 pb-0">
            <div className="mb-3 flex items-center gap-2.5">
              <div className="shimmer-base h-10 w-10 animate-shimmer rounded-full" />
              <div className="space-y-1.5">
                <div className="shimmer-base h-3.5 w-24 animate-shimmer rounded-full" />
                <div className="shimmer-secondary h-3 w-14 animate-shimmer rounded-full" />
              </div>
            </div>

            <div className="shimmer-base mb-3 h-5 w-3/4 animate-shimmer rounded-full" />
            <div className="mb-3 space-y-2">
              <div className="shimmer-secondary h-3.5 w-full animate-shimmer rounded-full" />
              <div className="shimmer-secondary h-3.5 w-2/3 animate-shimmer rounded-full" />
            </div>

            <div className="mb-3 flex gap-2">
              <div className="shimmer-base h-24 flex-1 animate-shimmer rounded-card" />
              <div className="shimmer-base h-24 flex-1 animate-shimmer rounded-card" />
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 pt-3">
            <div className="shimmer-secondary h-4 w-8 animate-shimmer rounded-full" />
            <div className="shimmer-secondary h-4 w-8 animate-shimmer rounded-full" />
            <div className="shimmer-secondary ml-auto h-4 w-4 animate-shimmer rounded-full" />
          </div>
        </Card>
      ))}
    </>
  );
}

export default FeedSkeleton;
