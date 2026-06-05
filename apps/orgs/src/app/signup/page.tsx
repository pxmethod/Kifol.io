"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Input } from "@kifolio/ui";
import { FormFieldError } from "@/components/forms/FormFieldError";
import { useOrgAuth } from "@/contexts/OrgAuthContext";
import { generateSlug } from "@/lib/orgs/slug";

type PasswordRequirements = {
  lowercase: boolean;
  uppercase: boolean;
  number: boolean;
  special: boolean;
  length: boolean;
};

export default function OrgSignupPage() {
  const router = useRouter();
  const { signUp } = useOrgAuth();
  const [orgName, setOrgName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [requirements, setRequirements] = useState<PasswordRequirements>({
    lowercase: false,
    uppercase: false,
    number: false,
    special: false,
    length: false,
  });

  useEffect(() => {
    if (!slugTouched && orgName) {
      setSlug(generateSlug(orgName));
    }
  }, [orgName, slugTouched]);

  useEffect(() => {
    setRequirements({
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      length: password.length >= 8,
    });
  }, [password]);

  const passwordOk = Object.values(requirements).every(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!orgName.trim()) newErrors.orgName = "Organization name is required";
    if (!email.trim()) newErrors.email = "Email is required";
    if (!passwordOk) newErrors.password = "Password does not meet requirements";
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    const { error, needsEmailConfirmation } = await signUp({
      email,
      password,
      orgName: orgName.trim(),
      slug: slug.trim() || undefined,
      displayName: displayName.trim() || undefined,
    });

    if (error) {
      setErrors({ submit: error });
      setIsSubmitting(false);
      return;
    }

    setSuccess(true);
    setIsSubmitting(false);

    setTimeout(() => {
      const message = needsEmailConfirmation
        ? "Check your email to verify your account, then log in."
        : "Your organization was created. Log in to continue.";
      router.push(`/login?message=${encodeURIComponent(message)}`);
    }, 2000);
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-discovery-beige-200 px-4">
        <div className="max-w-md rounded-lg bg-white p-8 text-center shadow-md">
          <h2 className="text-2xl font-medium text-discovery-black">
            Organization created
          </h2>
          <p className="mt-2 text-discovery-grey">
            Your 14-day free trial starts after you verify your email. Redirecting to
            log in...
          </p>
        </div>
      </div>
    );
  }

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
      <div className="flex justify-center px-4 pb-10 pt-8">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="mb-4 text-4xl font-medium text-discovery-black">
              Sign up for Kifolio Orgs
            </h1>
            <p className="text-lg text-discovery-grey">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-discovery-orange hover:text-discovery-orange-light"
              >
                Log in
              </Link>
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-md">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-md font-medium text-discovery-grey">
                  Organization name
                </label>
                <FormFieldError message={errors.orgName} />
                <Input
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="e.g. Sunrise Gymnastics"
                  error={!!errors.orgName}
                />
              </div>
              <div>
                <label className="text-md font-medium text-discovery-grey">
                  URL slug
                </label>
                <Input
                  value={slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setSlug(e.target.value);
                  }}
                  placeholder="sunrise-gymnastics"
                />
                <p className="mt-1 text-xs text-discovery-gray-700">
                  Used for your org&apos;s unique link. Letters, numbers, and hyphens only.
                </p>
              </div>
              <div>
                <label className="text-md font-medium text-discovery-grey">
                  Your name
                </label>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Admin name"
                />
              </div>
              <div>
                <label className="text-md font-medium text-discovery-grey">
                  Work email
                </label>
                <FormFieldError message={errors.email} />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={!!errors.email}
                  placeholder="you@organization.com"
                />
              </div>
              <div>
                <label className="text-md font-medium text-discovery-grey">
                  Password
                </label>
                <FormFieldError message={errors.password} />
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={!!errors.password}
                    className="pr-16"
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <ul className="mt-2 space-y-1 text-xs text-discovery-gray-700">
                  {[
                    ["One lowercase letter", requirements.lowercase],
                    ["One uppercase letter", requirements.uppercase],
                    ["One number", requirements.number],
                    ["One special character", requirements.special],
                    ["8+ characters", requirements.length],
                  ].map(([label, ok]) => (
                    <li
                      key={String(label)}
                      className={ok ? "text-green-600" : ""}
                    >
                      {label}
                    </li>
                  ))}
                </ul>
              </div>
              <Button
                type="submit"
                variant="discovery"
                className="w-full"
                disabled={isSubmitting || !passwordOk || !orgName.trim()}
              >
                {isSubmitting ? "Creating..." : "Create organization"}
              </Button>
              <FormFieldError message={errors.submit} placement="form-submit" />
            </form>
            <p className="mt-6 text-center text-xs text-discovery-grey">
              By signing up you agree to our Terms and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
