"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { orgsApi } from "@/lib/paths";

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    "verifying"
  );
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const run = async () => {
      try {
        const token = searchParams.get("token");

        if (token === "verify") {
          setStatus("error");
          setMessage(
            "This verification link is out of date. Please sign up again to receive a new verification email."
          );
          return;
        }

        if (!token) {
          setStatus("error");
          setMessage("Invalid verification link.");
          return;
        }

        const res = await fetch(orgsApi("/api/auth/confirm-email"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          setStatus("error");
          setMessage(
            err.error || "Could not confirm your email. Please try again."
          );
          return;
        }

        setStatus("success");
        setMessage("Email verified successfully! Redirecting to login...");

        setTimeout(() => {
          router.push("/login?verified=true");
        }, 3000);
      } catch {
        setStatus("error");
        setMessage("An unexpected error occurred. Please try again.");
      }
    };

    void run();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-discovery-beige-200 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/login" className="inline-block">
            <Image
              src="/kifolio_logo_dark.svg"
              alt="Kifolio Logo"
              width={140}
              height={36}
              className="h-9 w-auto mx-auto"
            />
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          {status === "verifying" && (
            <>
              <h1 className="text-2xl font-bold text-discovery-black mb-4">
                Verifying Email
              </h1>
              <p className="text-gray-600">{message}</p>
            </>
          )}

          {status === "success" && (
            <>
              <h1 className="text-2xl font-bold text-green-600 mb-4">
                Email Verified!
              </h1>
              <p className="text-gray-600 mb-6">{message}</p>
              <Link href="/login?verified=true" className="text-discovery-orange font-medium">
                Go to Login
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <h1 className="text-2xl font-bold text-red-600 mb-4">
                Verification Failed
              </h1>
              <p className="text-gray-600 mb-6">{message}</p>
              <div className="space-y-3">
                <Link href="/signup" className="text-discovery-orange font-medium block">
                  Try Signing Up Again
                </Link>
                <Link href="/login" className="text-discovery-grey underline">
                  Go to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-discovery-beige-200" />}>
      <VerifyContent />
    </Suspense>
  );
}
