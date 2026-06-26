import Link from "next/link";
import { redirect } from "next/navigation";
import { createAdminClient } from "@kifolio/database";
import { createClient } from "@kifolio/supabase/server";
import { AcceptInstructorInvite } from "./AcceptInstructorInvite";

export default async function InstructorInvitePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  const token = params.token?.trim();
  const nowMs = new Date().getTime();

  if (!token) {
    return <InviteError message="Missing invite token." />;
  }

  const admin = createAdminClient();
  const { data: invite } = await admin
    .from("org_invites")
    .select("id, email, status, expires_at, org_id")
    .eq("token", token)
    .maybeSingle();

  if (!invite) {
    return <InviteError message="This invite link is invalid." />;
  }

  if (invite.status !== "pending") {
    return (
      <InviteError message="This invite has already been used or revoked." />
    );
  }

  if (new Date(invite.expires_at).getTime() < nowMs) {
    return (
      <InviteError message="This invite has expired. Request a new invite from your organization admin." />
    );
  }

  const { data: org } = await admin
    .from("organizations")
    .select("name")
    .eq("id", invite.org_id)
    .single();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const redirectPath = `/invite/instructor?token=${encodeURIComponent(token)}`;
    redirect(`/login?redirect=${encodeURIComponent(redirectPath)}`);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-discovery-beige-200 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-md">
        <h1 className="text-2xl font-semibold text-discovery-black">
          Join {org?.name ?? "organization"}
        </h1>
        <p className="mt-2 text-sm text-discovery-grey">
          You&apos;ve been invited as an instructor. Accept to access the org
          dashboard.
        </p>
        <AcceptInstructorInvite token={token} />
        <p className="mt-4 text-center text-xs text-discovery-grey">
          Signed in as {user.email}. Not you?{" "}
          <Link href="/login" className="text-discovery-primary underline">
            Switch account
          </Link>
        </p>
      </div>
    </div>
  );
}

function InviteError({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-discovery-beige-200 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow-md">
        <h1 className="text-xl font-semibold text-discovery-black">
          Invite unavailable
        </h1>
        <p className="mt-2 text-sm text-discovery-grey">{message}</p>
        <Link
          href="/login"
          className="mt-6 inline-block text-sm font-medium text-discovery-primary hover:underline"
        >
          Go to login →
        </Link>
      </div>
    </div>
  );
}
