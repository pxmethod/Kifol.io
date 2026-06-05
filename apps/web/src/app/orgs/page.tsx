import Link from "next/link";
import Image from "next/image";
import MarketingNav from "@/components/MarketingNav";
import { orgsAppPath } from "@kifolio/utils";

export const metadata = {
  title: "Kifolio for Organizations",
  description:
    "Capture and endorse your students' milestones — beautifully.",
};

export default function OrgsMarketingPage() {
  const signupUrl = orgsAppPath("/signup");
  const loginUrl = orgsAppPath("/login");

  return (
    <div className="min-h-screen bg-discovery-beige-200">
      <MarketingNav />
      <main className="mx-auto max-w-3xl px-6 py-16 text-center sm:py-24">
        <Link href="/" className="mb-10 inline-block">
          <Image
            src="/kifolio_logo_dark.svg"
            alt="Kifolio"
            width={160}
            height={42}
            className="mx-auto h-11 w-auto"
          />
        </Link>
        <h1 className="text-4xl font-semibold text-discovery-black sm:text-5xl">
          Kifolio for Organizations
        </h1>
        <p className="mt-4 text-xl text-discovery-grey">
          Capture and endorse your students&apos; milestones — beautifully.
        </p>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-discovery-grey">
          Kifolio for Orgs lets gyms, studios, and youth programs create official
          endorsements, shoutouts, and promotions that appear directly on their
          students&apos; portfolios.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href={signupUrl}
            className="rounded-pill bg-discovery-orange px-8 py-4 text-lg font-semibold text-white shadow-lg transition-colors hover:bg-discovery-orange-light"
          >
            Get started
          </a>
          <a
            href={loginUrl}
            className="rounded-pill border border-discovery-beige-300 bg-white px-8 py-4 text-lg font-semibold text-discovery-black transition-colors hover:bg-discovery-beige-100"
          >
            Log in
          </a>
        </div>
      </main>
    </div>
  );
}
