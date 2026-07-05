export default async function CloseCommissionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">提前關閉委託 #{id}</h1>
    </div>
  );
}
