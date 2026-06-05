import { createAdminClient } from "@kifolio/database";
import { sendEmailVerification } from "@kifolio/emails";
import { createClient } from "@kifolio/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { orgsAppPath } from "@/lib/paths";
import {
  createEmailVerificationToken,
  EMAIL_VERIFICATION_SECRET_MIN_LENGTH,
  emailVerificationSecretDiagnostics,
  isEmailVerificationConfigured,
} from "@/lib/auth/email-verification-token";
import { getOrgTrialEndsAt } from "@/lib/orgs/billing";
import { resolveUniqueSlug } from "@/lib/orgs/slug-unique";
import { generateSlug } from "@/lib/orgs/slug";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const orgName =
      typeof body.orgName === "string" ? body.orgName.trim() : "";
    const slugInput =
      typeof body.slug === "string" ? body.slug.trim() : "";
    const displayName =
      typeof body.displayName === "string" ? body.displayName.trim() : "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (!orgName) {
      return NextResponse.json(
        { error: "Organization name is required" },
        { status: 400 }
      );
    }

    if (!isEmailVerificationConfigured()) {
      const d = emailVerificationSecretDiagnostics();
      console.error("[orgs signup] EMAIL_VERIFICATION_SECRET not usable:", d);

      const diagnosticCode: "MISSING" | "TOO_SHORT" = !d.envVarPresent
        ? "MISSING"
        : "TOO_SHORT";

      const payload: {
        error: string;
        hint: string;
        diagnosticCode: "MISSING" | "TOO_SHORT";
        normalizedLength?: number;
      } = {
        error: `Email verification is not configured. Set EMAIL_VERIFICATION_SECRET on the server (at least ${EMAIL_VERIFICATION_SECRET_MIN_LENGTH} characters after trimming; 32+ recommended).`,
        diagnosticCode,
        hint:
          "Vercel: Project → Settings → Environment Variables → EMAIL_VERIFICATION_SECRET → enable for environment → Save → redeploy.",
      };

      if (process.env.NODE_ENV === "development") {
        payload.normalizedLength = d.normalizedLength;
      }

      return NextResponse.json(payload, { status: 503 });
    }

    const supabase = await createClient();
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: orgsAppPath("/verify"),
        data: {
          name: displayName || orgName,
          org_signup: true,
        },
      },
    });

    if (signUpError) {
      const message = signUpError.message?.toLowerCase().includes("rate limit")
        ? "Too many signup attempts. Please wait a minute and try again."
        : signUpError.message;
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const userId = authData.user?.id;
    if (!userId) {
      return NextResponse.json(
        { error: "Account could not be created. Please try again." },
        { status: 400 }
      );
    }

    const slug = slugInput
      ? await resolveUniqueSlug(slugInput)
      : await resolveUniqueSlug(generateSlug(orgName) || orgName);

    const admin = createAdminClient();

    const trialEndsAt = getOrgTrialEndsAt();

    const { data: org, error: orgError } = await admin
      .from("organizations")
      .insert({
        name: orgName,
        slug,
        plan_tier: "solo",
        seat_limit: 1,
        subscription_status: "trialing",
        trial_ends_at: trialEndsAt,
      })
      .select("id")
      .single();

    if (orgError || !org) {
      console.error("[orgs signup] org insert:", orgError);
      return NextResponse.json(
        { error: "Organization could not be created. Please contact support." },
        { status: 500 }
      );
    }

    const { error: memberError } = await admin.from("org_members").insert({
      org_id: org.id,
      user_id: userId,
      role: "admin",
      status: "active",
      display_name: displayName || null,
    });

    if (memberError) {
      console.error("[orgs signup] member insert:", memberError);
      return NextResponse.json(
        { error: "Organization membership could not be created." },
        { status: 500 }
      );
    }

    const signed = createEmailVerificationToken(email, userId);
    const verificationUrl = `${orgsAppPath("/verify")}?token=${encodeURIComponent(signed)}`;

    try {
      const emailResult = await sendEmailVerification({
        to: email,
        subject: "Verify your email - Kifolio",
        userName: displayName || orgName,
        verificationUrl,
      });

      if (!emailResult.success) {
        console.error("[orgs signup] verification email failed:", emailResult.error);
      }
    } catch (emailError) {
      console.error("[orgs signup] verification email exception:", emailError);
    }

    return NextResponse.json({
      success: true,
      orgId: org.id,
      needsEmailConfirmation: true,
    });
  } catch (error) {
    console.error("[orgs signup]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
