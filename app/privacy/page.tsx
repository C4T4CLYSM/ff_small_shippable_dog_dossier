import Image from "next/image";
import type { Metadata } from "next";
import SiteFooter from "@/app/components/SiteFooter";

export const metadata: Metadata = {
  title: "Privacy Policy — Dog Dossier",
};

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <header className="bg-navy py-[18px]">
        <div className="flex items-center justify-between px-6 lg:px-10">
          <a href="/">
            <Image src="/wordmark.png" alt="Dog Dossier" width={160} height={40} className="object-contain" />
          </a>
          <a href="/" className="font-heading text-[0.9rem] text-cream/60 transition hover:text-cream">
            ← Back to home
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-[720px] px-6 py-16">
        <h1 className="mb-2 font-heading text-[2rem] font-extrabold tracking-tight text-navy">Privacy Policy</h1>
        <p className="mb-10 font-sub text-[0.9rem] italic text-slate">Last updated: August 8, 2026</p>

        <Section title="What we collect">
          <p>When you create an account, we collect your email address. When you build a dog profile, we store the information you enter — including your dog&apos;s name, health details, emergency contacts, routines, and any photos you upload. When you purchase access, Stripe processes your payment and we receive a record that your email has paid.</p>
        </Section>

        <Section title="How we use it">
          <p>Your data is used solely to provide the Dog Dossier service — generating your dog&apos;s profile and making it available to people you share it with. We do not sell your data, use it for advertising, or share it with third parties beyond what is necessary to operate the service.</p>
        </Section>

        <Section title="Cookies">
          <p>We use essential cookies only. These are strictly necessary to keep you logged in and make the app function. We do not use tracking, analytics, or advertising cookies. You may decline non-essential cookies via the banner shown on your first visit — declining does not affect your ability to use the service.</p>
        </Section>

        <Section title="Third-party services">
          <p>We use the following third parties to operate Dog Dossier:</p>
          <ul className="mt-3 list-disc pl-5 text-slate">
            <li className="mb-1"><strong>Supabase</strong> — database and file storage (dog photos)</li>
            <li className="mb-1"><strong>Stripe</strong> — payment processing</li>
            <li className="mb-1"><strong>Vercel</strong> — hosting and deployment</li>
            <li className="mb-1"><strong>Vercel Analytics</strong> — privacy-friendly page view analytics (no personal data collected)</li>
          </ul>
          <p className="mt-3">Each of these services has its own privacy policy. We share only the minimum data required for each service to function.</p>
        </Section>

        <Section title="Public profiles">
          <p>When you create a share link for your dog, anyone with that link can view the sections you chose to make visible. You control exactly what is shared — and you can delete any share link at any time from your dashboard.</p>
        </Section>

        <Section title="Data retention and deletion">
          <p>Your data is stored for as long as your account is active. You can delete your account and all associated data at any time from your account settings. We will permanently delete your records within 30 days of a deletion request.</p>
        </Section>

        <Section title="Your rights under GDPR (EEA and UK users)">
          <p>If you are located in the European Economic Area or the United Kingdom, you have the following rights under the General Data Protection Regulation (GDPR):</p>
          <ul className="mt-3 list-disc pl-5 text-slate">
            <li className="mb-1"><strong>Right of access</strong> — request a copy of the personal data we hold about you</li>
            <li className="mb-1"><strong>Right to rectification</strong> — correct inaccurate or incomplete data</li>
            <li className="mb-1"><strong>Right to erasure</strong> — request deletion of your personal data</li>
            <li className="mb-1"><strong>Right to restriction</strong> — request that we limit how we process your data</li>
            <li className="mb-1"><strong>Right to data portability</strong> — receive your data in a structured, machine-readable format</li>
            <li className="mb-1"><strong>Right to object</strong> — object to processing based on legitimate interests</li>
          </ul>
          <p className="mt-3">To exercise any of these rights, email us at <a href="mailto:contact@dogdossier.app" className="text-orange underline hover:text-orange-dark">contact@dogdossier.app</a>. We will respond within 30 days.</p>
        </Section>

        <Section title="Your rights under CCPA and CPRA (California residents)">
          <p>If you are a California resident, the California Consumer Privacy Act (CCPA) and the California Privacy Rights Act (CPRA) give you the following rights:</p>
          <ul className="mt-3 list-disc pl-5 text-slate">
            <li className="mb-1"><strong>Right to know</strong> — request disclosure of the categories and specific pieces of personal information we collect, use, or share</li>
            <li className="mb-1"><strong>Right to delete</strong> — request deletion of your personal information</li>
            <li className="mb-1"><strong>Right to correct</strong> — request correction of inaccurate personal information</li>
            <li className="mb-1"><strong>Right to opt out of sale or sharing</strong> — we do not sell or share your personal information with third parties for cross-context behavioral advertising</li>
            <li className="mb-1"><strong>Right to limit use of sensitive personal information</strong> — we collect sensitive information (such as health data for your dog) only to provide the service you requested</li>
            <li className="mb-1"><strong>Right to non-discrimination</strong> — we will not discriminate against you for exercising any of these rights</li>
          </ul>
          <p className="mt-3">To submit a request, email us at <a href="mailto:contact@dogdossier.app" className="text-orange underline hover:text-orange-dark">contact@dogdossier.app</a>. We will respond within 45 days as required by law.</p>
        </Section>

        <Section title="Contact">
          <p>Questions about this policy or your privacy rights? Email us at <a href="mailto:contact@dogdossier.app" className="text-orange underline hover:text-orange-dark">contact@dogdossier.app</a>.</p>
        </Section>
      </main>

      <SiteFooter />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h2 className="mb-3 font-heading text-[1.15rem] font-bold text-navy">{title}</h2>
      <div className="space-y-3 text-[0.97rem] leading-[1.75] text-slate">{children}</div>
    </div>
  );
}
