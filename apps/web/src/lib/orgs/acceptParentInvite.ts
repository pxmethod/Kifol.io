import { createAdminClient } from "@kifolio/database";
import { EmailTemplates } from "@kifolio/emails/template-loader";
import { orgsAppPath } from "@/lib/orgs/orgsPaths";
import { webAppPath } from "@/lib/paths";

async function sendConnectionConfirmedEmails(input: {
  parentEmail: string;
  childName: string;
  orgName: string;
  orgLogo: string | null;
  portfolioId: string;
  orgId: string;
  studentName: string;
}) {
  const { getMailerSend, createEmailParams } = await import(
    "@kifolio/emails/client"
  );
  const mailerSend = getMailerSend();
  if (!mailerSend) return;

  const portfolioUrl = webAppPath(`/portfolio/${input.portfolioId}`);
  const membersUrl = orgsAppPath("/dashboard/members");

  try {
    const parentHtml = await EmailTemplates.orgParentConnected({
      ORG_NAME: input.orgName,
      ORG_LOGO: input.orgLogo ?? "",
      CHILD_NAME: input.childName,
      PORTFOLIO_URL: portfolioUrl,
    });
    await mailerSend.email.send(
      createEmailParams(
        input.parentEmail,
        `${input.childName} is now connected to ${input.orgName} on Kifolio`,
        parentHtml
      )
    );
  } catch (error) {
    console.error("[org parent connected email]", error);
  }

  const admin = createAdminClient();
  const { data: admins } = await admin
    .from("org_members")
    .select("user_id")
    .eq("org_id", input.orgId)
    .eq("role", "admin")
    .eq("status", "active");

  if (admins?.length) {
    for (const member of admins) {
      const { data: userData } = await admin.auth.admin.getUserById(
        member.user_id
      );
      const adminEmail = userData.user?.email;
      if (!adminEmail) continue;

      try {
        const adminHtml = await EmailTemplates.orgParentAccepted({
          ORG_NAME: input.orgName,
          PARENT_EMAIL: input.parentEmail,
          STUDENT_NAME: input.studentName,
          MEMBERS_URL: membersUrl,
        });
        await mailerSend.email.send(
          createEmailParams(
            adminEmail,
            `A parent has connected to ${input.orgName} on Kifolio`,
            adminHtml
          )
        );
      } catch (error) {
        console.error("[org parent accepted email]", error);
      }
    }
  }
}

export async function acceptParentInvite(input: {
  inviteToken: string;
  portfolioId: string;
  userId: string;
  userEmail: string;
}): Promise<
  | { ok: true; childName: string; orgName: string }
  | { error: string }
> {
  const admin = createAdminClient();

  const { data: invite } = await admin
    .from("org_parent_invites")
    .select("*")
    .eq("token", input.inviteToken)
    .maybeSingle();

  if (!invite) {
    return { error: "Invite is no longer valid." };
  }

  if (invite.status !== "pending") {
    return { error: "Invite is no longer valid." };
  }

  if (new Date(invite.expires_at).getTime() < Date.now()) {
    return { error: "Invite is no longer valid." };
  }

  if (invite.email.toLowerCase() !== input.userEmail.toLowerCase()) {
    return { error: "This invite was sent to a different email address." };
  }

  const { data: portfolio } = await admin
    .from("portfolios")
    .select("id, user_id, child_name")
    .eq("id", input.portfolioId)
    .maybeSingle();

  if (!portfolio || portfolio.user_id !== input.userId) {
    return { error: "Portfolio not found." };
  }

  const { data: existing } = await admin
    .from("portfolio_org_connections")
    .select("id, status")
    .eq("portfolio_id", input.portfolioId)
    .eq("org_id", invite.org_id)
    .maybeSingle();

  if (existing?.status === "connected") {
    return { error: "Already connected." };
  }

  const now = new Date().toISOString();

  if (existing) {
    const { error: updateConnError } = await admin
      .from("portfolio_org_connections")
      .update({
        status: "connected",
        invited_via: invite.id,
        connected_at: now,
        disconnected_at: null,
      })
      .eq("id", existing.id);

    if (updateConnError) {
      return { error: "Failed to connect portfolio." };
    }
  } else {
    const { error: insertConnError } = await admin
      .from("portfolio_org_connections")
      .insert({
        portfolio_id: input.portfolioId,
        org_id: invite.org_id,
        status: "connected",
        invited_via: invite.id,
        connected_at: now,
      });

    if (insertConnError) {
      return { error: "Failed to connect portfolio." };
    }
  }

  await admin
    .from("org_parent_invites")
    .update({ status: "accepted", accepted_at: now })
    .eq("id", invite.id);

  const orgName = invite.org_name_snapshot ?? "Organization";
  const studentName = `${invite.student_first_name ?? ""} ${invite.student_last_name ?? ""}`.trim();
  const childName = portfolio.child_name ?? studentName;

  await sendConnectionConfirmedEmails({
    parentEmail: input.userEmail,
    childName,
    orgName,
    orgLogo: invite.org_logo_snapshot,
    portfolioId: input.portfolioId,
    orgId: invite.org_id,
    studentName,
  });

  return { ok: true, childName, orgName };
}
