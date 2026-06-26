import type { Database } from "@kifolio/db-types";

type OrganizationRow = Database["public"]["Tables"]["organizations"]["Row"];
type OrgMemberRow = Database["public"]["Tables"]["org_members"]["Row"];

export type OnboardingChecklistId =
  | "create"
  | "profileSeal"
  | "instructors"
  | "parents";

export type OnboardingChecklistItem = {
  id: OnboardingChecklistId;
  label: string;
  /** Short explanation shown below the label */
  description: string;
  done: boolean;
  optional?: boolean;
  ctaLabel: string;
  href: string;
  imageFile: string;
};

const CHECKLIST_DEF: Omit<OnboardingChecklistItem, "done">[] = [
  {
    id: "create",
    label: "Create your organization account",
    description:
      "Your organization account is set up. Update your organization details anytime in settings.",
    ctaLabel: "View organization",
    href: "/dashboard/settings/profile",
    imageFile: "create_org.svg",
  },
  {
    id: "profileSeal",
    label: "Set up your profile & verified badge",
    description:
      "Add your logo and create your official verified badge. Your verified badge will appear on all achievements you and your verified instructors issue.",
    ctaLabel: "Set up",
    href: "/dashboard/settings/profile",
    imageFile: "org_seal.svg",
  },
  {
    id: "instructors",
    label: "Add verified instructors",
    description:
      "Add verified staff on your team who can write endorsements, promotions, and other achievements for your members.",
    optional: true,
    ctaLabel: "Add instructors",
    href: "/dashboard/instructors",
    imageFile: "add_instructors.svg",
  },
  {
    id: "parents",
    label: "Invite members",
    description:
      "Invite members to your organization so they can track and view their child's achievements. Members will receive an email to join and will appear in your member list once accepted.",
    optional: true,
    ctaLabel: "Invite members",
    href: "/dashboard/members",
    imageFile: "invite_members.svg",
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
  organization: Pick<
    OrganizationRow,
    "logo_url" | "about" | "seal_template_id"
  >;
  instructorCount: number;
  pendingInviteCount: number;
  parentInviteCount: number;
}): OnboardingChecklistItem[] {
  const profileSealDone = Boolean(
    input.organization.logo_url &&
      input.organization.about?.trim() &&
      input.organization.seal_template_id
  );
  const instructorsDone =
    input.instructorCount > 0 || input.pendingInviteCount > 0;
  const parentsDone = input.parentInviteCount > 0;

  const doneById: Record<OnboardingChecklistId, boolean> = {
    create: true,
    profileSeal: profileSealDone,
    instructors: instructorsDone,
    parents: parentsDone,
  };

  return CHECKLIST_DEF.map((item) => ({
    ...item,
    done: doneById[item.id],
  }));
}

/** Profile + seal required; instructors and members are optional until later phases. */
export function isOnboardingComplete(items: OnboardingChecklistItem[]): boolean {
  return items
    .filter((item) => item.id !== "instructors" && item.id !== "parents")
    .every((item) => item.done);
}

export type OnboardingChecklistFlags = {
  profile: boolean;
  seal: boolean;
  instructors: boolean;
  parents: boolean;
};

export function resolveOnboardingFlags(input: {
  organization: Pick<
    OrganizationRow,
    "logo_url" | "about" | "seal_template_id"
  >;
  instructorCount: number;
  pendingInviteCount: number;
  parentInviteCount: number;
}): OnboardingChecklistFlags {
  return {
    profile: Boolean(
      input.organization.logo_url && input.organization.about?.trim()
    ),
    seal: Boolean(input.organization.seal_template_id),
    instructors: input.instructorCount > 0 || input.pendingInviteCount > 0,
    parents: input.parentInviteCount > 0,
  };
}
