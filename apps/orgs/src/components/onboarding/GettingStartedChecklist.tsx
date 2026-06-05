import Link from "next/link";
import { DashboardCard } from "@/components/shell/DashboardCard";
import type { OnboardingChecklistItem } from "@/lib/orgs/onboarding";
import { ChecklistImage } from "./ChecklistImage";

/** Set to true when checklist CTA destinations are ready */
const CTAS_ENABLED = false;

export function GettingStartedChecklist({
  items,
}: {
  items: OnboardingChecklistItem[];
}) {
  return (
    <DashboardCard>
      <h3 className="text-lg font-semibold text-discovery-black">
        Setup checklist
      </h3>
      <ul className="mt-4 divide-y divide-gray-100">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex min-h-[5.5rem] items-center gap-4 py-4 first:pt-0 last:pb-0"
          >
            <ChecklistImage imageFile={item.imageFile} label={item.label} />
            <p
              className={`min-w-0 flex-1 text-base font-medium ${
                item.done
                  ? "text-discovery-grey line-through"
                  : "text-discovery-black"
              }`}
            >
              {item.label}
            </p>
            <ChecklistCta
              label={item.ctaLabel}
              href={item.href}
              done={item.done}
            />
            <ChecklistStatus done={item.done} />
          </li>
        ))}
      </ul>
    </DashboardCard>
  );
}

function ChecklistCta({
  label,
  href,
  done,
}: {
  label: string;
  href: string;
  done: boolean;
}) {
  const className = "shrink-0 text-sm font-medium";

  if (done) {
    return (
      <span className={`${className} text-discovery-grey`}>Completed</span>
    );
  }

  if (!CTAS_ENABLED) {
    return (
      <span
        className={`${className} cursor-not-allowed text-discovery-primary/40`}
        aria-disabled
      >
        {label} →
      </span>
    );
  }

  return (
    <Link href={href} className={`${className} text-discovery-primary hover:underline`}>
      {label} →
    </Link>
  );
}

function ChecklistStatus({ done }: { done: boolean }) {
  return (
    <span
      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
        done
          ? "bg-discovery-green text-white"
          : "border border-discovery-beige-300 text-discovery-gray-700"
      }`}
      aria-hidden
    >
      {done ? "✓" : ""}
    </span>
  );
}
