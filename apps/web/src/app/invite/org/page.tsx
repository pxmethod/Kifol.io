import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@kifolio/supabase/server";
import { OrgAvatar } from "@/components/shared/OrgAvatar";
import { InviteWrongAccount } from "@/components/orgs/InviteWrongAccount";
import { getParentInviteByToken } from "@/lib/orgs/pendingInvites";

function emailsMatch(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

export default async function OrgInviteLandingPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  const token = params.token?.trim();

  if (!token) {
    return <InviteError message="Missing invite token." orgName={null} />;
  }

  const invite = await getParentInviteByToken(token);

  if (!invite) {
    return (
      <InviteError
        message="This invite link is invalid."
        orgName={null}
      />
    );
  }

  const orgName = invite.org_name_snapshot ?? "Organization";
  const studentName =
    `${invite.student_first_name ?? ""} ${invite.student_last_name ?? ""}`.trim();

  if (invite.status === "revoked") {
    return (
      <InviteError
        message="This invite has been revoked."
        orgName={orgName}
      />
    );
  }

  if (invite.status !== "pending") {
    return (
      <InviteError
        message="This invite has already been used."
        orgName={orgName}
      />
    );
  }

  if (invite.isExpired) {
    return (
      <InviteError
        message="This invite has expired. Request a new invite from your organization."
        orgName={orgName}
      />
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const inviteEmail = invite.email.trim().toLowerCase();

  if (user?.email && emailsMatch(user.email, inviteEmail)) {
    redirect("/dashboard");
  }

  const signupHref = `/auth/signup?invite_token=${encodeURIComponent(token)}&email=${encodeURIComponent(invite.email)}`;
  const loginHref = `/auth/login?email=${encodeURIComponent(invite.email)}&redirect=${encodeURIComponent("/dashboard")}`;

  if (user?.email) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-discovery-beige-200 px-4 py-12">
        <div className="w-full max-w-lg rounded-xl bg-white p-8 text-center shadow-md">
          <div className="mb-6 flex justify-center">
            <OrgAvatar
              logo={invite.org_logo_snapshot}
              name={orgName}
              size={64}
            />
          </div>
          <h1 className="text-2xl font-semibold text-discovery-black">
            {orgName} has invited
          </h1>
          <p className="mt-2 text-xl font-medium text-discovery-black">
            {studentName || "your child"} to Kifolio
          </p>
          <InviteWrongAccount
            inviteToken={token}
            inviteEmail={invite.email}
            currentEmail={user.email}
            orgName={orgName}
            studentName={studentName}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-discovery-beige-200 px-4 py-12">
      <div className="w-full max-w-lg rounded-xl bg-white p-8 text-center shadow-md">
        <div className="mb-6 flex justify-center">
          <OrgAvatar
            logo={invite.org_logo_snapshot}
            name={orgName}
            size={64}
          />
        </div>
        <h1 className="text-2xl font-semibold text-discovery-black">
          {orgName} has invited
        </h1>
        <p className="mt-2 text-xl font-medium text-discovery-black">
          {studentName || "your child"} to Kifolio
        </p>
        <p className="mt-6 text-sm leading-relaxed text-discovery-grey">
          {orgName} uses Kifolio to celebrate your child&apos;s milestones —
          promotions, endorsements, and shoutouts that live on their portfolio
          forever.
        </p>
        {invite.personal_note?.trim() && (
          <blockquote className="mx-auto mt-6 max-w-md rounded-lg border-l-4 border-discovery-orange bg-discovery-beige-50 px-4 py-3 text-left text-sm text-discovery-black">
            {invite.personal_note}
          </blockquote>
        )}
        <div className="mt-8 space-y-3">
          <Link
            href={loginHref}
            className="inline-flex w-full items-center justify-center rounded-pill bg-discovery-orange px-6 py-3 text-base font-semibold text-white hover:bg-discovery-orange-light"
          >
            Accept invite
          </Link>
          <p className="text-sm text-discovery-grey">
            Don&apos;t have an account?{" "}
            <Link
              href={signupHref}
              className="font-medium text-discovery-orange hover:text-discovery-orange-light"
            >
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function InviteError({
  message,
  orgName,
}: {
  message: string;
  orgName: string | null;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-discovery-beige-200 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow-md">
        {orgName && (
          <p className="mb-2 text-sm font-medium text-discovery-grey">
            {orgName}
          </p>
        )}
        <h1 className="text-xl font-semibold text-discovery-black">
          Invite unavailable
        </h1>
        <p className="mt-2 text-sm text-discovery-grey">{message}</p>
        <Link
          href="/auth/login"
          className="mt-6 inline-block text-sm font-medium text-discovery-orange hover:underline"
        >
          Go to login →
        </Link>
      </div>
    </div>
  );
}
