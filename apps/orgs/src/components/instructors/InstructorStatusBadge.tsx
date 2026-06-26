const STYLES: Record<string, string> = {
  admin: "bg-discovery-blue/10 text-discovery-blue border-discovery-blue/20",
  active: "bg-green-50 text-green-800 border-green-200",
  pending: "bg-amber-50 text-amber-800 border-amber-200",
};

const LABELS: Record<string, string> = {
  admin: "Admin",
  active: "Active",
  pending: "Pending",
};

export function InstructorStatusBadge({ status }: { status: string }) {
  const style = STYLES[status] ?? STYLES.active;
  const label = LABELS[status] ?? status;
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${style}`}
    >
      {label}
    </span>
  );
}
