export function PageCardBase({ children }: { children: React.ReactNode }) {
  return (
    <main className="isolate grow overflow-hidden md:p-4">{children}</main>
  );
}

export function PageCard({ children }: { children: React.ReactNode }) {
  return (
    <PageCardBase>
      <div className="h-full w-full overflow-hidden bg-card shadow-lg md:rounded-lg md:border">
        {children}
      </div>
    </PageCardBase>
  );
}
