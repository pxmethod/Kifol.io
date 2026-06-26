import { createAdminClient } from "@kifolio/database";
import { EmailTemplates } from "@kifolio/emails/template-loader";
import { canInviteMember } from "@/lib/orgs/members";
import { webAppPath } from "@/lib/web-paths";
import { orgsAppPath } from "@/lib/paths";

const INVITE_EXPIRY_DAYS = 30;

export type ParentInviteEmailParams = {
  email: string;
  orgName: string;
  orgLogo: string | null;
  studentFirstName: string;
  studentLastName: string;
  personalNote?: string | null;
  token: string;
};

async function sendParentInviteEmail(
  params: ParentInviteEmailParams
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

  const inviteUrl = webAppPath(
    `/invite/org?token=${encodeURIComponent(params.token)}`
  );
  const studentName = `${params.studentFirstName} ${params.studentLastName}`.trim();

  try {
    const html = await EmailTemplates.orgParentInvite({
      ORG_NAME: params.orgName,
      ORG_LOGO: params.orgLogo ?? "",
      STUDENT_NAME: studentName,
      PERSONAL_NOTE: params.personalNote?.trim() ?? "",
      INVITE_URL: inviteUrl,
      EXPIRES_IN_DAYS: String(INVITE_EXPIRY_DAYS),
    });

    const emailParams = createEmailParams(
      params.email,
      `${params.orgName} invited you to connect on Kifolio`,
      html
    );
    await mailerSend.email.send(emailParams);
    return { success: true };
  } catch (error) {
    console.error("[parent invite email]", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to send invite email",
    };
  }
}

export async function sendOrgAdminWelcomeEmail(input: {
  email: string;
  orgName: string;
}): Promise<void> {
  const { getMailerSend, createEmailParams } = await import(
    "@kifolio/emails/client"
  );
  const mailerSend = getMailerSend();
  if (!mailerSend) return;

  try {
    const html = await EmailTemplates.orgAdminWelcome({
      ORG_NAME: input.orgName,
      DASHBOARD_URL: orgsAppPath("/dashboard/overview"),
    });
    const emailParams = createEmailParams(
      input.email,
      "Welcome to Kifolio for Orgs",
      html
    );
    await mailerSend.email.send(emailParams);
  } catch (error) {
    console.error("[org admin welcome email]", error);
  }
}

export type ParentInviteRowStatus =
  | "connected"
  | "pending"
  | "expired"
  | "disconnected"
  | "revoked";

export function resolveParentInviteDisplayStatus(input: {
  inviteStatus: string;
  expiresAt: string;
  connectionStatus?: string | null;
}): ParentInviteRowStatus {
  if (input.connectionStatus === "connected") return "connected";
  if (input.connectionStatus === "disconnected") return "disconnected";
  if (input.inviteStatus === "revoked") return "revoked";
  if (
    input.inviteStatus === "pending" &&
    new Date(input.expiresAt).getTime() < Date.now()
  ) {
    return "expired";
  }
  if (input.inviteStatus === "pending") return "pending";
  if (input.inviteStatus === "accepted") return "connected";
  return "pending";
}

export async function createParentInvite(input: {
  orgId: string;
  email: string;
  studentFirstName: string;
  studentLastName: string;
  personalNote?: string;
  invitedBy: string;
  orgName: string;
  orgLogo: string | null;
}): Promise<
  | {
      inviteId: string;
      token: string;
      studentName: string;
      email: string;
      resent?: false;
    }
  | { resent: true; inviteId: string; email: string; studentName: string }
  | { error: string; duplicateInviteId?: string }
> {
  const email = input.email.trim().toLowerCase();
  const studentFirstName = input.studentFirstName.trim();
  const studentLastName = input.studentLastName.trim();
  const personalNote = input.personalNote?.trim().slice(0, 200) || null;

  if (!email) return { error: "Parent email is required." };
  if (!studentFirstName) return { error: "Student first name is required." };
  if (!studentLastName) return { error: "Student last name is required." };

  const cap = await canInviteMember(input.orgId);
  if (!cap.allowed) {
    return { error: cap.reason ?? "Member limit reached." };
  }

  const admin = createAdminClient();

  const { data: existing } = await admin
    .from("org_parent_invites")
    .select("id, token, email, student_first_name, student_last_name")
    .eq("org_id", input.orgId)
    .eq("email", email)
    .eq("student_first_name", studentFirstName)
    .eq("student_last_name", studentLastName)
    .eq("status", "pending")
    .maybeSingle();

  if (existing) {
    return {
      error: "A pending invite already exists for this student.",
      duplicateInviteId: existing.id,
    };
  }

  const expiresAt = new Date();
  expiresAt.setUTCDate(expiresAt.getUTCDate() + INVITE_EXPIRY_DAYS);

  const { data: invite, error } = await admin
    .from("org_parent_invites")
    .insert({
      org_id: input.orgId,
      email,
      student_first_name: studentFirstName,
      student_last_name: studentLastName,
      personal_note: personalNote,
      org_name_snapshot: input.orgName,
      org_logo_snapshot: input.orgLogo,
      invited_by: input.invitedBy,
      expires_at: expiresAt.toISOString(),
      status: "pending",
    })
    .select("id, token")
    .single();

  if (error || !invite) {
    console.error("[createParentInvite]", error);
    return { error: "Failed to create invite." };
  }

  const emailResult = await sendParentInviteEmail({
    email,
    orgName: input.orgName,
    orgLogo: input.orgLogo,
    studentFirstName,
    studentLastName,
    personalNote,
    token: invite.token,
  });

  if (!emailResult.success) {
    await admin
      .from("org_parent_invites")
      .update({ status: "revoked" })
      .eq("id", invite.id);
    return { error: emailResult.error ?? "Failed to send invite email." };
  }

  const studentName = `${studentFirstName} ${studentLastName}`;
  return {
    inviteId: invite.id,
    token: invite.token,
    studentName,
    email,
    resent: false as const,
  };
}

export async function resendParentInvite(input: {
  inviteId: string;
  orgId: string;
  orgName: string;
  orgLogo: string | null;
}): Promise<
  | { ok: true; email: string; studentName: string }
  | { error: string }
> {
  const admin = createAdminClient();
  const expiresAt = new Date();
  expiresAt.setUTCDate(expiresAt.getUTCDate() + INVITE_EXPIRY_DAYS);

  const { data: invite, error } = await admin
    .from("org_parent_invites")
    .update({
      expires_at: expiresAt.toISOString(),
      status: "pending",
      opened_at: null,
    })
    .eq("id", input.inviteId)
    .eq("org_id", input.orgId)
    .in("status", ["pending", "expired"])
    .select(
      "email, token, student_first_name, student_last_name, personal_note"
    )
    .single();

  if (error || !invite) {
    return { error: "Invite not found or cannot be resent." };
  }

  const studentFirstName = invite.student_first_name ?? "";
  const studentLastName = invite.student_last_name ?? "";

  const emailResult = await sendParentInviteEmail({
    email: invite.email,
    orgName: input.orgName,
    orgLogo: input.orgLogo,
    studentFirstName,
    studentLastName,
    personalNote: invite.personal_note,
    token: invite.token,
  });

  if (!emailResult.success) {
    return { error: emailResult.error ?? "Failed to resend invite email." };
  }

  return {
    ok: true,
    email: invite.email,
    studentName: `${studentFirstName} ${studentLastName}`.trim(),
  };
}

export async function revokeParentInvite(
  inviteId: string,
  orgId: string
): Promise<{ ok: true } | { error: string }> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("org_parent_invites")
    .update({ status: "revoked" })
    .eq("id", inviteId)
    .eq("org_id", orgId)
    .eq("status", "pending");

  if (error) {
    return { error: "Failed to revoke invite." };
  }

  return { ok: true };
}
