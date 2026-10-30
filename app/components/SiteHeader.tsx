import Image from "next/image";

const STRIPE_LINK = "https://buy.stripe.com/5kQ3cu1xZcu78CLfF6cjS01";
const INSTAGRAM_URL = "https://www.instagram.com/dogdossier/";

const IconInstagram = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);

// Same header as the landing page
export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 bg-navy py-[18px]">
      <div className="flex items-center justify-between px-6 lg:px-10">
        <a href="/">
          <Image
            src="/wordmark.png"
            alt="Dog Dossier"
            width={160}
            height={40}
            className="object-contain sm:w-[220px]"
            priority
          />
        </a>
        <div className="flex items-center gap-3">
          <a
            href={STRIPE_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-[10px] bg-orange px-3 py-2 text-center font-heading text-[0.75rem] font-bold leading-tight text-cream transition hover:-translate-y-0.5 hover:bg-orange-dark hover:shadow-[0_6px_20px_rgba(234,88,12,0.35)] sm:px-[22px] sm:py-[10px] sm:text-[0.95rem]"
          >
            Join as Founder
          </a>
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer"
            className="hidden text-cream/60 transition hover:text-cream sm:block">
            <IconInstagram />
          </a>
        </div>
      </div>
    </header>
  );
}
