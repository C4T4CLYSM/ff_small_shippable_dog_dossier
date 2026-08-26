import Image from "next/image";

const INSTAGRAM_URL = "https://www.instagram.com/dogdossier/";

const IconInstagram = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);

export default function SiteFooter() {
  return (
    <footer className="bg-navy px-6 lg:px-10 py-10">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-6 border-b border-cream/10 pb-8">
          <a href="/">
            <Image src="/wordmark.png" alt="Dog Dossier" width={150} height={40} className="object-contain" />
          </a>
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <a href="/" className="font-heading text-[0.85rem] text-cream/50 transition hover:text-cream">Home</a>
            <a href="/privacy" className="font-heading text-[0.85rem] text-cream/50 transition hover:text-cream">Privacy Policy</a>
            <a href="/terms" className="font-heading text-[0.85rem] text-cream/50 transition hover:text-cream">Terms of Use</a>
            <a href="/contact" className="font-heading text-[0.85rem] text-cream/50 transition hover:text-cream">Contact</a>
          </nav>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 pt-6">
          <span className="text-[0.82rem] text-cream/40">© 2026 Dog Dossier. All rights reserved.</span>
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="text-cream/40 transition hover:text-cream/80">
            <IconInstagram />
          </a>
        </div>
      </div>
    </footer>
  );
}
