"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@kifolio/ui";
import { useAuth } from "@/contexts/AuthContext";

export function InviteWrongAccount({
  inviteToken,
  inviteEmail,
  currentEmail,
  orgName,
  studentName,
}: {
  inviteToken: string;
  inviteEmail: string;
  currentEmail: string;
  orgName: string;
  studentName: string;
}) {
  const router = useRouter();
  const { signOut } = useAuth();
  const [loading, setLoading] = useState(false);

  const signupUrl = `/auth/signup?invite_token=${encodeURIComponent(inviteToken)}&email=${encodeURIComponent(inviteEmail)}`;
  const loginUrl = `/auth/login?email=${encodeURIComponent(inviteEmail)}&redirect=${encodeURIComponent("/dashboard")}`;

  const createAccount = async () => {
    setLoading(true);
    try {
      await signOut();
      router.push(signupUrl);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const switchToLogin = async () => {
    setLoading(true);
    try {
      await signOut();
      router.push(loginUrl);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 space-y-4">
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-left text-sm text-amber-900">
        <p>
          This invite was sent to <strong>{inviteEmail}</strong>.
        </p>
        <p className="mt-2">
          You&apos;re signed in as <strong>{currentEmail}</strong>. Create a
          Kifolio account with the invited email to connect{" "}
          {studentName ? (
            <>
              <strong>{studentName}</strong> to{" "}
            </>
          ) : null}
          {orgName}.
        </p>
      </div>
      <Button
        type="button"
        variant="discovery"
        className="w-full"
        disabled={loading}
        onClick={() => void createAccount()}
      >
        {loading ? "Continuing..." : `Create account with ${inviteEmail}`}
      </Button>
      <p className="text-sm text-discovery-grey">
        Already have an account with this email?{" "}
        <button
          type="button"
          disabled={loading}
          onClick={() => void switchToLogin()}
          className="font-medium text-discovery-orange hover:text-discovery-orange-light"
        >
          Log in
        </button>
      </p>
    </div>
  );
}
