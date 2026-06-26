"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@kifolio/ui";
import { DashboardCard } from "@/components/shell/DashboardCard";
import type { OnboardingChecklistItem } from "@/lib/orgs/onboarding";
import { ChecklistImage } from "./ChecklistImage";

type SkippableChecklistId = "instructors" | "parents";

function readSkippedItems(orgId: string): Record<SkippableChecklistId, boolean> {
  if (typeof window === "undefined") {
    return { instructors: false, parents: false };
  }

  const legacyInstructors = window.localStorage.getItem(
    `onboarding-team-skipped-${orgId}`
  );
  const instructors = window.localStorage.getItem(
    `onboarding-instructors-skipped-${orgId}`
  );
  const parents = window.localStorage.getItem(
    `onboarding-parents-skipped-${orgId}`
  );

  return {
    instructors: legacyInstructors === "1" || instructors === "1",
    parents: parents === "1",
  };
}

export function GettingStartedChecklist({
  items,
  orgId,
}: {
  items: OnboardingChecklistItem[];
  orgId: string;
}) {
  const [skippedItems, setSkippedItems] = useState<
    Record<SkippableChecklistId, boolean>
  >({ instructors: false, parents: false });

  useEffect(() => {
    setSkippedItems(readSkippedItems(orgId));
  }, [orgId]);

  const skipItem = (id: SkippableChecklistId) => {
    window.localStorage.setItem(`onboarding-${id}-skipped-${orgId}`, "1");
    setSkippedItems((current) => ({ ...current, [id]: true }));
  };

  const displayItems = items.map((item) => {
    if (item.id === "instructors" && skippedItems.instructors) {
      return { ...item, done: true };
    }
    if (item.id === "parents" && skippedItems.parents) {
      return { ...item, done: true };
    }
    return item;
  });

  return (
    <DashboardCard>
      <h3 className="text-lg font-semibold text-discovery-black">
        Quick setup checklist
      </h3>
      <ul className="mt-4 divide-y divide-gray-100">
        {displayItems.map((item) => (
          <li
            key={item.id}
            className="flex flex-col gap-4 py-5 first:pt-0 last:pb-0 sm:flex-row sm:items-start"
          >
            {/* Image + copy — vertical stack on mobile, row on sm+ */}
            <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
              <ChecklistImage
                imageFile={item.imageFile}
                label={item.label}
                done={item.done}
              />
              <div className="min-w-0 flex-1">
                <p
                  className={`text-xl font-semibold ${
                    item.done
                      ? "text-discovery-grey line-through"
                      : "text-discovery-black"
                  }`}
                >
                  {item.label}
                  {item.optional && !item.done && (
                    <span className="ml-2 text-xs font-normal text-discovery-grey">
                      (optional)
                    </span>
                  )}
                </p>
                <p
                  className={`mt-1 w-full text-sm leading-snug sm:max-w-[90%] ${
                    item.done ? "text-discovery-grey/80" : "text-discovery-grey"
                  }`}
                >
                  {item.description}
                </p>
              </div>
            </div>

            {/* CTA + status — full width row on mobile, right column on sm+ */}
            <div className="flex w-full shrink-0 flex-col items-center gap-2 sm:w-auto sm:self-center">
              <div className="flex w-full items-center gap-3 sm:w-auto">
                <ChecklistCta
                  label={item.ctaLabel}
                  href={item.href}
                  done={item.done}
                />
                {item.done && <ChecklistStatus />}
              </div>
              {item.optional &&
                !item.done &&
                (item.id === "instructors" || item.id === "parents") && (
                  <button
                    type="button"
                    onClick={() =>
                      skipItem(item.id as SkippableChecklistId)
                    }
                    className="text-sm text-discovery-grey hover:text-discovery-black"
                  >
                    I'll do this later
                  </button>
                )}
            </div>
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
  const router = useRouter();

  if (done) {
    return (
      <span className="flex-1 text-sm font-medium text-discovery-grey sm:flex-none">
        Completed
      </span>
    );
  }

  return (
    <Button
      type="button"
      variant="primary"
      className="w-full flex-1 sm:w-auto sm:flex-none"
      onClick={() => router.push(href)}
    >
      {label}
    </Button>
  );
}

function ChecklistStatus() {
  return (
    <span
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-discovery-green text-xs font-medium text-white"
      aria-hidden
    >
      ✓
    </span>
  );
}
