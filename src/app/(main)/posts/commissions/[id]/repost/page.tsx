export default async function RepostCommissionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold text-foreground">/posts/commissions/{id}/repost</h1>
    </div>
  );
}
