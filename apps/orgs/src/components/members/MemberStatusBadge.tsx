const STYLES: Record<string, string> = {
  active: "bg-green-50 text-green-800 border-green-200",
  suspended: "bg-amber-50 text-amber-800 border-amber-200",
  removed: "bg-discovery-beige-100 text-discovery-grey border-discovery-beige-300",
};

export function MemberStatusBadge({ status }: { status: string }) {
  const style = STYLES[status] ?? STYLES.removed;
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${style}`}
    >
      {status}
    </span>
  );
}
