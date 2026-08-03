import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use — Dog Dossier",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-cream">
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
        <h1 className="mb-2 font-heading text-[2rem] font-extrabold tracking-tight text-navy">Terms of Use</h1>
        <p className="mb-10 font-sub text-[0.9rem] italic text-slate">Last updated: July 28, 2026</p>

        <Section title="Acceptance">
          <p>By creating an account or using Dog Dossier, you agree to these terms. If you do not agree, do not use the service.</p>
        </Section>

        <Section title="What Dog Dossier is">
          <p>Dog Dossier is a tool that lets dog owners create shareable profiles containing their dog&apos;s health information, emergency contacts, routines, and behavioral notes. You can share these profiles via a link or QR code with walkers, sitters, vets, boarding facilities, or anyone else who cares for your dog.</p>
        </Section>

        <Section title="Your account">
          <p>You are responsible for keeping your account credentials secure. You must provide accurate information when signing up. Each account is for a single person — sharing login credentials is not permitted.</p>
        </Section>

        <Section title="Acceptable use">
          <p>You may use Dog Dossier only for its intended purpose: managing and sharing your own dog&apos;s profile information. You agree not to:</p>
          <ul className="mt-3 list-disc pl-5 text-slate">
            <li className="mb-1">Upload false or misleading information that could endanger an animal</li>
            <li className="mb-1">Use the service to harass, impersonate, or harm others</li>
            <li className="mb-1">Attempt to reverse-engineer, scrape, or disrupt the service</li>
          </ul>
        </Section>

        <Section title="Payment">
          <p>Access to Dog Dossier requires a one-time payment. Founder pricing is $29 and grants lifetime access. After the public launch, the price increases to $59. Payments are processed by Stripe. We do not offer refunds unless required by applicable law.</p>
        </Section>

        <Section title="Your content">
          <p>You own the information and photos you upload. By using Dog Dossier, you grant us the right to store and display your content solely to provide the service. We do not claim ownership of your data.</p>
        </Section>

        <Section title="Service availability">
          <p>We aim to keep Dog Dossier available at all times but cannot guarantee uninterrupted service. We may update or modify features with or without notice. We are not liable for any downtime or data loss.</p>
        </Section>

        <Section title="Limitation of liability">
          <p>Dog Dossier is provided &quot;as is.&quot; We are not liable for any damages arising from your use of the service, including any reliance on profile information by caregivers. You are responsible for the accuracy of the information you enter.</p>
        </Section>

        <Section title="Changes to these terms">
          <p>We may update these terms from time to time. Continued use of Dog Dossier after changes are posted constitutes acceptance of the new terms.</p>
        </Section>

        <Section title="Contact">
          <p>Questions? Email us at <a href="mailto:contact@dogdossier.app" className="text-orange underline hover:text-orange-dark">contact@dogdossier.app</a>.</p>
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
