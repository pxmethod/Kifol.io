"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Input } from "@kifolio/ui";
import { FormFieldError } from "@/components/forms/FormFieldError";
import { useOrgAuth } from "@/contexts/OrgAuthContext";
import { createClient } from "@kifolio/supabase/client";

export default function OrgLoginPage() {
  const router = useRouter();
  const { signIn, user, loading } = useOrgAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "", submit: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const message = params.get("message");
    const verified = params.get("verified");
    if (message) setSuccessMessage(message);
    else if (verified === "true") {
      setSuccessMessage("Email verified successfully! You can now log in.");
    }
  }, []);

  const getRedirectPath = () => {
    if (typeof window === "undefined") return null;
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get("redirect")?.trim();
    if (!redirect || !redirect.startsWith("/")) return null;
    return redirect;
  };

  useEffect(() => {
    if (loading || !user) return;
    const checkMembership = async () => {
      const redirectPath = getRedirectPath();
      if (redirectPath) {
        router.push(redirectPath);
        return;
      }

      const supabase = createClient();
      const { data } = await supabase
        .from("org_members")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle();

      if (!data) {
        setErrors((e) => ({
          ...e,
          submit:
            "No organization is linked to this account. Sign in with the email you used to create your org, or sign up for a new organization.",
        }));
        return;
      }
      router.push("/dashboard/overview");
    };
    void checkMembership();
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({ email: "", password: "", submit: "" });

    if (!email.trim()) {
      setErrors((prev) => ({ ...prev, email: "Email is required" }));
      return;
    }
    if (!password) {
      setErrors((prev) => ({ ...prev, password: "Password is required" }));
      return;
    }

    setIsSubmitting(true);
    const { error } = await signIn(email, password);
    if (error) {
      setErrors((prev) => ({ ...prev, submit: error }));
      setIsSubmitting(false);
      return;
    }

    const redirectPath = getRedirectPath() ?? "/dashboard/overview";
    router.refresh();
    router.push(redirectPath);
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-discovery-beige-200">
      <header className="px-9 py-4">
        <Link href="/login">
          <Image
            src="/kifolio_logo_dark.svg"
            alt="Kifolio"
            width={144}
            height={38}
            className="h-10 w-auto"
            priority
          />
        </Link>
      </header>
      <div className="flex justify-center px-4 pb-10 pt-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="mb-4 text-4xl font-medium text-discovery-black">
              Log in to Kifolio for Orgs
            </h1>
            <p className="text-lg text-discovery-grey">
              Need an org account?{" "}
              <Link
                href="/signup"
                className="font-medium text-discovery-orange hover:text-discovery-orange-light"
              >
                Sign up
              </Link>
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-md">
            {successMessage && (
              <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                {successMessage}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="text-md font-medium text-discovery-grey"
                >
                  Email address
                </label>
                <FormFieldError message={errors.email} />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={!!errors.email}
                  placeholder="you@organization.com"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="text-md font-medium text-discovery-grey"
                >
                  Password
                </label>
                <FormFieldError message={errors.password} />
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={!!errors.password}
                    className="pr-12"
                    placeholder="Your password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                variant="discovery"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Signing in..." : "Log in"}
              </Button>
              <FormFieldError message={errors.submit} placement="form-submit" />
              {errors.submit.includes("No organization") && (
                <p className="text-center text-sm">
                  <Link
                    href="/signup"
                    className="font-medium text-discovery-orange"
                  >
                    Create an organization →
                  </Link>
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
