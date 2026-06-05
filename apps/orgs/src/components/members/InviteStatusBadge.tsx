const STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-800 border-amber-200",
  accepted: "bg-green-50 text-green-800 border-green-200",
  expired: "bg-discovery-beige-100 text-discovery-grey border-discovery-beige-300",
  revoked: "bg-red-50 text-red-800 border-red-200",
};

export function InviteStatusBadge({ status }: { status: string }) {
  const style = STYLES[status] ?? STYLES.expired;
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${style}`}
    >
      {status === "pending" ? "Sent" : status}
    </span>
  );
}
