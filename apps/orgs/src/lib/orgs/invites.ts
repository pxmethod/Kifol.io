import { createAdminClient } from "@kifolio/database";
import { EmailTemplates } from "@kifolio/emails/template-loader";
import { orgsAppPath } from "@/lib/paths";

const INVITE_EXPIRY_DAYS = 7;

export type InstructorInviteParams = {
  email: string;
  orgName: string;
  orgLogo: string | null;
  inviterName: string;
  token: string;
};

async function sendInstructorInviteEmail(
  params: InstructorInviteParams
): Promise<{ success: boolean; error?: string }> {
  const { getMailerSend, createEmailParams } = await import(
    "@kifolio/emails/client"
  );
  const mailerSend = getMailerSend();
  if (!mailerSend) {
    return {
      success: false,
      error: "Email service not configured (MAILERSEND_API_KEY missing)",
    };
  }

  const inviteUrl = orgsAppPath(
    `/invite/instructor?token=${encodeURIComponent(params.token)}`
  );

  try {
    const html = await EmailTemplates.instructorInvite({
      ORG_NAME: params.orgName,
      ORG_LOGO: params.orgLogo ?? "",
      INVITER_NAME: params.inviterName,
      INVITE_URL: inviteUrl,
      EXPIRES_IN_DAYS: String(INVITE_EXPIRY_DAYS),
    });

    const emailParams = createEmailParams(
      params.email,
      `You've been invited to join ${params.orgName} on Kifolio`,
      html
    );
    await mailerSend.email.send(emailParams);
    return { success: true };
  } catch (error) {
    console.error("[instructor invite email]", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to send invite email",
    };
  }
}

export async function createInstructorInvite(input: {
  orgId: string;
  email: string;
  displayName?: string;
  jobTitle?: string;
  invitedBy: string;
  orgName: string;
  orgLogo: string | null;
  inviterName: string;
}): Promise<{ inviteId: string; token: string } | { error: string }> {
  const email = input.email.trim().toLowerCase();
  if (!email) return { error: "Email is required." };

  const admin = createAdminClient();

  const { data: existing } = await admin
    .from("org_invites")
    .select("id")
    .eq("org_id", input.orgId)
    .eq("email", email)
    .eq("status", "pending")
    .maybeSingle();

  if (existing) {
    return { error: "A pending invite already exists for this email." };
  }

  const expiresAt = new Date();
  expiresAt.setUTCDate(expiresAt.getUTCDate() + INVITE_EXPIRY_DAYS);

  const { data: invite, error } = await admin
    .from("org_invites")
    .insert({
      org_id: input.orgId,
      email,
      display_name: input.displayName?.trim() || null,
      job_title: input.jobTitle?.trim() || null,
      invited_by: input.invitedBy,
      expires_at: expiresAt.toISOString(),
      status: "pending",
    })
    .select("id, token")
    .single();

  if (error || !invite) {
    console.error("[createInstructorInvite]", error);
    return { error: "Failed to create invite." };
  }

  const emailResult = await sendInstructorInviteEmail({
    email,
    orgName: input.orgName,
    orgLogo: input.orgLogo,
    inviterName: input.inviterName,
    token: invite.token,
  });

  if (!emailResult.success) {
    await admin
      .from("org_invites")
      .update({ status: "revoked" })
      .eq("id", invite.id);
    return { error: emailResult.error ?? "Failed to send invite email." };
  }

  return { inviteId: invite.id, token: invite.token };
}

export async function resendInstructorInvite(input: {
  inviteId: string;
  orgId: string;
  orgName: string;
  orgLogo: string | null;
  inviterName: string;
}): Promise<{ ok: true } | { error: string }> {
  const admin = createAdminClient();
  const expiresAt = new Date();
  expiresAt.setUTCDate(expiresAt.getUTCDate() + INVITE_EXPIRY_DAYS);

  const { data: invite, error } = await admin
    .from("org_invites")
    .update({
      expires_at: expiresAt.toISOString(),
      status: "pending",
    })
    .eq("id", input.inviteId)
    .eq("org_id", input.orgId)
    .eq("status", "pending")
    .select("email, token")
    .single();

  if (error || !invite) {
    return { error: "Invite not found or no longer pending." };
  }

  const emailResult = await sendInstructorInviteEmail({
    email: invite.email,
    orgName: input.orgName,
    orgLogo: input.orgLogo,
    inviterName: input.inviterName,
    token: invite.token,
  });

  if (!emailResult.success) {
    return { error: emailResult.error ?? "Failed to resend invite email." };
  }

  return { ok: true };
}

export async function revokeInstructorInvite(
  inviteId: string,
  orgId: string
): Promise<{ ok: true } | { error: string }> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("org_invites")
    .update({ status: "revoked" })
    .eq("id", inviteId)
    .eq("org_id", orgId)
    .eq("status", "pending");

  if (error) {
    return { error: "Failed to revoke invite." };
  }

  return { ok: true };
}

export async function acceptInstructorInvite(input: {
  token: string;
  userId: string;
  userEmail: string;
  displayNameFallback?: string;
}): Promise<{ ok: true; orgId: string } | { error: string }> {
  const admin = createAdminClient();

  const { data: invite } = await admin
    .from("org_invites")
    .select("*")
    .eq("token", input.token)
    .maybeSingle();

  if (!invite) {
    return { error: "This invite link is invalid." };
  }

  if (invite.status !== "pending") {
    return { error: "This invite has already been used or revoked." };
  }

  if (new Date(invite.expires_at).getTime() < Date.now()) {
    await admin
      .from("org_invites")
      .update({ status: "expired" })
      .eq("id", invite.id);
    return { error: "This invite has expired. Request a new invite." };
  }

  if (invite.email.toLowerCase() !== input.userEmail.toLowerCase()) {
    return {
      error: `Sign in as ${invite.email} to accept this invite.`,
    };
  }

  const { data: existingMember } = await admin
    .from("org_members")
    .select("id, status")
    .eq("org_id", invite.org_id)
    .eq("user_id", input.userId)
    .maybeSingle();

  if (existingMember?.status === "active") {
    await admin
      .from("org_invites")
      .update({ status: "accepted" })
      .eq("id", invite.id);
    return { ok: true, orgId: invite.org_id };
  }

  const displayName =
    invite.display_name?.trim() ||
    input.displayNameFallback?.trim() ||
    invite.email.split("@")[0];

  if (existingMember) {
    const { error: updateError } = await admin
      .from("org_members")
      .update({
        status: "active",
        role: "instructor",
        display_name: displayName,
        job_title: invite.job_title,
        invited_at: invite.created_at,
        joined_at: new Date().toISOString(),
      })
      .eq("id", existingMember.id);

    if (updateError) {
      return { error: "Failed to join organization." };
    }
  } else {
    const { error: insertError } = await admin.from("org_members").insert({
      org_id: invite.org_id,
      user_id: input.userId,
      role: "instructor",
      status: "active",
      display_name: displayName,
      job_title: invite.job_title,
      invited_at: invite.created_at,
    });

    if (insertError) {
      return { error: "Failed to join organization." };
    }
  }

  await admin
    .from("org_invites")
    .update({ status: "accepted" })
    .eq("id", invite.id);

  return { ok: true, orgId: invite.org_id };
}
