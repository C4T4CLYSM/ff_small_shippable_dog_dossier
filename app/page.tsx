import Image from "next/image";
import Script from "next/script";

const pricingRows = [
  { feature: "Access Cost", founder: "$29 (One-time)", launch: "$59 (One-time)" },
  { feature: "Your Savings", founder: "Save $30 (51% OFF)", launch: "Full Price" },
  { feature: "Extra Dog Cost", founder: "$5 (One-time)", launch: "$20 (One-time)" },
  { feature: "Total for 2 Dogs", founder: "$34 forever", launch: "$79 forever" },
  { feature: "Total for 3 Dogs", founder: "$39 forever", launch: "$99 forever" },
  { feature: "Profile Badge", founder: '✅ Exclusive "Founder" Badge', launch: "❌ Standard Profile" },
  { feature: "Feature Voting", founder: "✅ Priority Access", launch: "Standard Access" },
  { feature: "Support", founder: "🚀 Direct Founder Access", launch: "Standard Support" },
];

const STRIPE_LINK = "https://buy.stripe.com/cNi7sK0tV8dRdX51OgcjS00";

const IconClipboard = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="8" y="2" width="8" height="4" rx="1" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <line x1="9" y1="12" x2="15" y2="12" />
    <line x1="9" y1="16" x2="13" y2="16" />
  </svg>
);

const IconLink = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

const IconQR = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
    <rect x="5.5" y="5.5" width="2" height="2" fill="currentColor" stroke="none" />
    <rect x="16.5" y="5.5" width="2" height="2" fill="currentColor" stroke="none" />
    <rect x="5.5" y="16.5" width="2" height="2" fill="currentColor" stroke="none" />
    <rect x="14" y="14" width="2" height="2" fill="currentColor" stroke="none" />
    <rect x="18" y="14" width="2" height="2" fill="currentColor" stroke="none" />
    <rect x="14" y="18" width="2" height="2" fill="currentColor" stroke="none" />
    <rect x="18" y="18" width="2" height="2" fill="currentColor" stroke="none" />
  </svg>
);

const IconPaw = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor">
    <ellipse cx="9" cy="6.5" rx="2" ry="2.5" />
    <ellipse cx="15" cy="6.5" rx="2" ry="2.5" />
    <ellipse cx="5.5" cy="11.5" rx="1.6" ry="2" />
    <ellipse cx="18.5" cy="11.5" rx="1.6" ry="2" />
    <path d="M12 10.5c-3.5 0-6 2.2-6 4.8 0 2 1.2 3.7 3 3.7h6c1.8 0 3-1.7 3-3.7 0-2.6-2.5-4.8-6-4.8z" />
  </svg>
);

const IconMedical = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v8M8 12h8" />
  </svg>
);

const IconHome = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

export default function Home() {
  return (
    <>
      <header className="sticky top-0 z-50 bg-navy py-[18px]">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between px-6">
          <Image
            src="/wordmark.png"
            alt="Dog Dossier"
            width={380}
            height={90}
            className="object-contain"
            priority
          />
          <a
            href={STRIPE_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-[10px] bg-orange px-[22px] py-[10px] font-heading text-[0.95rem] font-bold text-cream transition hover:-translate-y-0.5 hover:bg-orange-dark hover:shadow-[0_6px_20px_rgba(234,88,12,0.35)]"
          >
            Join as Founder
          </a>
        </div>
      </header>

      {/* Section 1: Hero */}
      <section className="relative flex min-h-[85vh] items-end overflow-hidden pb-16">
        <Image
          src="/hero-dog.jpg"
          alt="Dog sitting on a bridge"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy/75 via-navy/40 to-transparent" />
        <div className="relative z-10 mx-auto w-full max-w-[1100px] px-6">
          <h1 className="font-heading text-[clamp(2.6rem,7vw,4.5rem)] font-black uppercase leading-[1.05] tracking-tight text-cream">
            Care that
            <br />
            updates
          </h1>
        </div>
      </section>

      {/* Section 2: What Dog Dossier is */}
      <section className="px-6 py-20 text-center">
        <div className="mx-auto max-w-[1100px]">
          <h2 className="mb-4 font-heading text-[clamp(1.8rem,4vw,2.6rem)] font-extrabold tracking-tight text-navy">
            One profile. Infinite handouts.
          </h2>
          <p className="mx-auto mb-12 max-w-[560px] font-sub text-[1.1rem] italic text-slate">
            One shareable link with everything your dog&apos;s people need to know —
            health info, routines, emergency contacts, quirks, and more.
          </p>
          <div className="grid grid-cols-1 gap-6 text-left sm:grid-cols-2 lg:grid-cols-3">
            <Card title="Complete Profile" icon={<IconClipboard />}>
              Health records, medications, emergency contacts, feeding schedule, behavioral notes — all in one place.
            </Card>
            <Card title="Shareable Link" icon={<IconLink />}>
              Send your dog&apos;s profile to anyone with one link. Update it anytime and the link stays the same.
            </Card>
            <Card title="QR Code" icon={<IconQR />}>
              Print it on a tag, stick it on a crate, or hand it to your vet. Instant access, no app required.
            </Card>
          </div>
        </div>
      </section>

      {/* Section 3: Who it's for */}
      <section className="px-6 py-20 text-center">
        <div className="mx-auto max-w-[1100px]">
          <h2 className="mb-12 font-heading text-[clamp(1.8rem,4vw,2.6rem)] font-extrabold tracking-tight text-navy">
            Built for the whole pack.
          </h2>
          <div className="grid grid-cols-1 gap-6 text-left sm:grid-cols-2 lg:grid-cols-3">
            <Card title="Dog Walkers & Sitters" icon={<IconPaw />}>
              Get the info you need before the first walk. Emergency contacts, vet info, and behavioral notes — all pre-loaded.
            </Card>
            <Card title="Vets & Boarding" icon={<IconMedical />}>
              Intake in seconds. Scan the QR code and you have the full picture — vaccines, medications, allergies, and more.
            </Card>
            <Card title="Dog Owners & Trainers" icon={<IconHome />}>
              Your dog&apos;s profile lives at one URL. Update it once and everyone who has the link — sitters, vets, or trainers — sees the latest version.
            </Card>
          </div>
        </div>
      </section>

      {/* Section 4: Founder CTA + pricing */}
      <section className="bg-cream px-6 py-20 text-center">
        <div className="mx-auto max-w-[1100px]">
          <h2 className="mb-4 font-heading text-[clamp(1.8rem,4vw,2.6rem)] font-extrabold tracking-tight text-navy">
            Ready to build your dog&apos;s dossier?
          </h2>
          <p className="mx-auto mb-12 max-w-[560px] font-sub text-[1.1rem] italic text-slate">
            Join our founding members and secure lifetime access. Help us build the safest way to care for dogs.
          </p>
          <a
            href={STRIPE_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block rounded-[10px] bg-orange px-9 py-4 font-heading text-[1.05rem] font-bold text-cream transition hover:-translate-y-0.5 hover:bg-orange-dark hover:shadow-[0_6px_20px_rgba(234,88,12,0.35)]"
          >
            Join as Founder
          </a>

          <div className="mt-14 overflow-x-auto">
            <table className="min-w-[560px] w-full overflow-hidden rounded-2xl border-collapse bg-navy text-[0.95rem]">
              <thead>
                <tr>
                  <th className="border-b border-cream/10 bg-slate px-5 py-3.5 text-left font-heading font-bold text-cream">
                    Feature
                  </th>
                  <th className="border-b border-cream/10 bg-orange px-5 py-3.5 text-left font-heading font-bold text-cream">
                    🏆 Founding Member
                  </th>
                  <th className="border-b border-cream/10 bg-slate px-5 py-3.5 text-left font-heading font-bold text-cream">
                    🚀 Public Launch
                  </th>
                </tr>
              </thead>
              <tbody>
                {pricingRows.map((row, i) => (
                  <tr key={row.feature}>
                    <td className={`px-5 py-3.5 text-left text-cream ${i !== pricingRows.length - 1 ? "border-b border-cream/10" : ""}`}>
                      {row.feature}
                    </td>
                    <td className={`bg-orange/15 px-5 py-3.5 text-left font-bold text-cream ${i !== pricingRows.length - 1 ? "border-b border-cream/10" : ""}`}>
                      {row.founder}
                    </td>
                    <td className={`px-5 py-3.5 text-left text-cream ${i !== pricingRows.length - 1 ? "border-b border-cream/10" : ""}`}>
                      {row.launch}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Section 5: Waitlist */}
      <section id="signup" className="bg-cream px-6 py-20 text-center">
        <div className="mx-auto max-w-[1100px]">
          <h2 className="mb-4 font-heading text-[clamp(1.8rem,4vw,2.6rem)] font-extrabold tracking-tight text-navy">
            Not ready to be a founder?
          </h2>
          <p className="mx-auto mb-12 max-w-[560px] font-sub text-[1.1rem] italic text-slate">
            Join the waitlist to get access when we launch publicly.
          </p>
          <div className="mx-auto max-w-[560px]">
            <iframe
              data-tally-src="https://tally.so/embed/XxzabP?hideTitle=1&transparentBackground=1&dynamicHeight=1"
              loading="lazy"
              width="100%"
              height={184}
              title="Dog Dossier Waitlist"
              className="border-0"
            />
            <Script src="https://tally.so/widgets/embed.js" strategy="afterInteractive" />
          </div>
          <p className="mt-4 text-[0.85rem] text-slate">
            No spam. Just your link when we&apos;re ready. Unsubscribe anytime.
          </p>
        </div>
      </section>

      <footer className="bg-navy px-6 py-7">
        <div className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-between gap-3">
          <Image
            src="/wordmark.png"
            alt="Dog Dossier"
            width={150}
            height={40}
            className="object-contain"
          />
          <span className="text-[0.82rem] text-cream/50">
            © 2026 Dog Dossier. Made with ❤️ for dogs everywhere.
          </span>
        </div>
      </footer>
    </>
  );
}

function Card({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border-t-[3px] border-orange bg-slate p-7 transition hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(30,41,59,0.18)]">
      <div className="mb-4 text-cream">{icon}</div>
      <h3 className="mb-2.5 font-heading text-[1.15rem] font-bold text-cream">{title}</h3>
      <p className="text-[0.95rem] leading-[1.7] text-cream/80">{children}</p>
    </div>
  );
}
