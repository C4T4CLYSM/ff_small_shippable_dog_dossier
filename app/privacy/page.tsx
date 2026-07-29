import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Dog Dossier",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-navy py-[18px]">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between px-6">
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
        <p className="mb-10 font-sub text-[0.9rem] italic text-slate">Last updated: July 28, 2026</p>

        <Section title="What we collect">
          <p>When you create an account, we collect your email address. When you build a dog profile, we store the information you enter — including your dog&apos;s name, health details, emergency contacts, routines, and any photos you upload. When you purchase access, Stripe processes your payment and we receive a record that your email has paid.</p>
        </Section>

        <Section title="How we use it">
          <p>Your data is used solely to provide the Dog Dossier service — generating your dog&apos;s profile and making it available to people you share it with. We do not sell your data, use it for advertising, or share it with third parties beyond what is necessary to operate the service.</p>
        </Section>

        <Section title="Third-party services">
          <p>We use the following third parties to operate Dog Dossier:</p>
          <ul className="mt-3 list-disc pl-5 text-slate">
            <li className="mb-1"><strong>Supabase</strong> — database and file storage (dog photos)</li>
            <li className="mb-1"><strong>Stripe</strong> — payment processing</li>
            <li className="mb-1"><strong>Vercel</strong> — hosting and deployment</li>
          </ul>
          <p className="mt-3">Each of these services has its own privacy policy. We share only the minimum data required for each service to function.</p>
        </Section>

        <Section title="Public profiles">
          <p>When you create a share link for your dog, anyone with that link can view the sections you chose to make visible. You control exactly what is shared — and you can delete any share link at any time from your dashboard.</p>
        </Section>

        <Section title="Data retention and deletion">
          <p>Your data is stored for as long as your account is active. To request deletion of your account and all associated data, contact us at the email below. We will delete your records within 30 days.</p>
        </Section>

        <Section title="Contact">
          <p>Questions about this policy? Email us at <a href="mailto:cataclysmllc@pm.me" className="text-orange underline hover:text-orange-dark">cataclysmllc@pm.me</a>.</p>
        </Section>
      </main>

      <footer className="bg-navy px-6 py-7 text-center">
        <span className="text-[0.82rem] text-cream/40">© 2026 Dog Dossier. All rights reserved.</span>
      </footer>
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
