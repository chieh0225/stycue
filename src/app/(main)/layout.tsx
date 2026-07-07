import BottomNav from './bottom-nav';

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col pb-6">{children}</div>
      <BottomNav />
    </div>
  );
}
