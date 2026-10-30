// Owner setting for the "Found [name]? Call…" button in the photo viewer
export default function FoundBarOption({ checked, onChange, dogName, hasPhone }: {
  checked: boolean;
  onChange: (value: boolean) => void;
  dogName: string;
  hasPhone: boolean;
}) {
  return (
    <label className="flex cursor-pointer gap-3 rounded-xl bg-orange/10 p-4 ring-1 ring-orange/30">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 shrink-0 accent-orange" />
      <span className="flex flex-col gap-1">
        <span className="font-heading text-[0.9rem] font-bold text-cream">
          Show a &ldquo;Found {dogName.trim() || "your dog"}? Call&hellip;&rdquo; button in the photo viewer
        </span>
        <span className="text-[0.8rem] leading-relaxed text-cream/50">
          Uses Emergency Contact 1&apos;s phone number. It only appears on share links that show Safety info.
          {checked && !hasPhone && " Add a phone number above for the button to appear."}
        </span>
      </span>
    </label>
  );
}
