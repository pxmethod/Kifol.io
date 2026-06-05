import type { Database } from "@kifolio/db-types";

type OrganizationRow = Database["public"]["Tables"]["organizations"]["Row"];
type OrgMemberRow = Database["public"]["Tables"]["org_members"]["Row"];

export type OnboardingChecklistId =
  | "create"
  | "profile"
  | "stamp"
  | "team"
  | "parents";

export type OnboardingChecklistItem = {
  id: OnboardingChecklistId;
  label: string;
  done: boolean;
  ctaLabel: string;
  /** Target route when the CTA is enabled */
  href: string;
  /** Filename under `public/onboarding/` (add manually) */
  imageFile: string;
};

const CHECKLIST_DEF: Omit<OnboardingChecklistItem, "done">[] = [
  {
    id: "create",
    label: "Create your org",
    ctaLabel: "View organization",
    href: "/dashboard/settings",
    imageFile: "checklist-create.png",
  },
  {
    id: "profile",
    label: "Set up your org profile",
    ctaLabel: "Set up profile",
    href: "/dashboard/settings",
    imageFile: "checklist-profile.png",
  },
  {
    id: "stamp",
    label: "Create your org stamp",
    ctaLabel: "Create stamp",
    href: "/dashboard/settings",
    imageFile: "checklist-stamp.png",
  },
  {
    id: "team",
    label: "Add your team verfied instructors",
    ctaLabel: "Add instructors",
    href: "/dashboard/members",
    imageFile: "checklist-team.png",
  },
  {
    id: "parents",
    label: "Invite members / parents",
    ctaLabel: "Invite",
    href: "/dashboard/parents",
    imageFile: "checklist-parents.png",
  },
];

export function resolveOrgMemberDisplayName(
  member: Pick<OrgMemberRow, "display_name">,
  user: { email?: string | null; user_metadata?: Record<string, unknown> }
): string {
  const fromMember = member.display_name?.trim();
  if (fromMember) return fromMember;

  const metaName = user.user_metadata?.name;
  if (typeof metaName === "string" && metaName.trim()) {
    return metaName.trim();
  }

  const emailLocal = user.email?.split("@")[0]?.trim();
  if (emailLocal) return emailLocal;

  return "there";
}

export function resolveOnboardingChecklist(input: {
  organization: Pick<OrganizationRow, "logo_url" | "seal_template_id">;
  instructorCount: number;
  pendingInviteCount: number;
  parentInviteCount: number;
}): OnboardingChecklistItem[] {
  const profileDone = Boolean(input.organization.logo_url);
  const stampDone = Boolean(input.organization.seal_template_id);
  const teamDone =
    input.instructorCount > 0 || input.pendingInviteCount > 0;
  const parentsDone = input.parentInviteCount > 0;

  const doneById: Record<OnboardingChecklistId, boolean> = {
    create: true,
    profile: profileDone,
    stamp: stampDone,
    team: teamDone,
    parents: parentsDone,
  };

  return CHECKLIST_DEF.map((item) => ({
    ...item,
    done: doneById[item.id],
  }));
}

export function isOnboardingComplete(items: OnboardingChecklistItem[]): boolean {
  return items.every((item) => item.done);
}
