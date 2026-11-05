import { percentComplete, type ProfileCheck } from "@/lib/profileChecks";

// Owner-only: what's still missing from a dog's profile, each linking to the right Edit step.
export default function ProfileChecklist({ dogId, dogName, checks }: { dogId: string; dogName: string; checks: ProfileCheck[] }) {
  const percent = percentComplete(checks);

  if (percent === 100) {
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-4 shadow-[0_2px_12px_rgba(30,41,59,0.07)]">
        <span className="grid h-5 w-5 flex-none place-items-center rounded-full bg-green-600 text-[0.65rem] font-extrabold text-white">✓</span>
        <p className="font-heading text-[0.92rem] font-bold text-navy">{dogName}&apos;s profile is complete</p>
      </div>
    );
  }

  // Missing items first, so the next thing to do is at the top
  const ordered = [...checks.filter(c => !c.ok), ...checks.filter(c => c.ok)];

  return (
    <div className="rounded-2xl bg-white px-5 py-5 shadow-[0_2px_12px_rgba(30,41,59,0.07)]">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <h2 className="font-heading text-[1rem] font-extrabold text-navy">Finish {dogName}&apos;s profile</h2>
        <span className="font-heading text-[0.82rem] font-bold text-orange-dark">{percent}%</span>
      </div>
      <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-slate-100" role="progressbar"
        aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label={`${dogName}'s profile is ${percent}% complete`}>
        <div className="h-full rounded-full bg-orange" style={{ width: `${percent}%` }} />
      </div>
      <ul className="flex flex-col gap-2.5 text-[0.88rem]">
        {ordered.map(c => (
          <li key={c.key} className="flex items-center gap-2.5">
            {c.ok ? (
              <>
                <span className="grid h-[18px] w-[18px] flex-none place-items-center rounded-full bg-green-600 text-[0.6rem] font-extrabold text-white">✓</span>
                <span className="text-slate-400">{c.label}</span>
              </>
            ) : (
              <>
                <span className="h-[18px] w-[18px] flex-none rounded-full border-2 border-slate-300" />
                <a href={`/dashboard/dog/${dogId}/edit?step=${c.step}`} className="font-heading font-bold text-orange-dark hover:underline">
                  {c.todo} →
                </a>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
