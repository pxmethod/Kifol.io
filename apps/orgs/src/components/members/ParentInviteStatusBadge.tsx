const STYLES: Record<string, string> = {
  connected: "bg-green-50 text-green-800 border-green-200",
  pending: "bg-amber-50 text-amber-800 border-amber-200",
  expired: "bg-discovery-beige-100 text-discovery-grey border-discovery-beige-300",
  disconnected: "bg-gray-50 text-gray-700 border-gray-200",
  revoked: "bg-red-50 text-red-800 border-red-200",
};

const LABELS: Record<string, string> = {
  connected: "Connected",
  pending: "Pending",
  expired: "Expired",
  disconnected: "Disconnected",
  revoked: "Revoked",
};

export function ParentInviteStatusBadge({ status }: { status: string }) {
  const style = STYLES[status] ?? STYLES.pending;
  const label = LABELS[status] ?? status;
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${style}`}
    >
      {label}
    </span>
  );
}
