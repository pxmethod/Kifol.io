export function DashboardPage({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="mx-auto max-w-4xl space-y-6">{children}</div>;
}

export function DashboardPageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-discovery-black">{title}</h2>
      {description ? (
        <p className="mt-1 text-discovery-grey">{description}</p>
      ) : null}
    </div>
  );
}
