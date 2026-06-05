/**
 * Matches parent app (apps/web) content cards: white surface, rounded-lg, shadow-md.
 * @see apps/web/src/styles/components/cards.css (.card)
 * @see apps/web/src/components/PortfolioCard.tsx
 */
export const dashboardCardClassName =
  "overflow-hidden rounded-lg bg-white shadow-md";

export function DashboardCard({
  children,
  className = "",
  padding = "default",
}: {
  children: React.ReactNode;
  className?: string;
  /** default = p-6 (card__body), lg = p-8, none = no padding */
  padding?: "default" | "lg" | "none";
}) {
  const paddingClass =
    padding === "none" ? "" : padding === "lg" ? "p-8" : "p-6";

  return (
    <section
      className={[dashboardCardClassName, paddingClass, className]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </section>
  );
}

/** Header block for split layout cards (padding none on parent). */
export function DashboardCardHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="border-b border-gray-100 px-6 py-4">
      <h3 className="text-lg font-semibold text-discovery-black">{title}</h3>
      {description ? (
        <p className="mt-0.5 text-sm text-discovery-grey">{description}</p>
      ) : null}
    </div>
  );
}
