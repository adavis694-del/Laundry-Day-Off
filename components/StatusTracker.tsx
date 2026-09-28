import { STATUSES, Status } from "@/lib/config";
export default function StatusTracker({ status }: { status: Status }) {
  const idx = STATUSES.indexOf(status);
  return (
    <ol className="flex items-start" aria-label={`Order status: ${status}`}>
      {STATUSES.map((s, i) => (
        <li key={s} className="relative flex-1 text-center" aria-current={i === idx ? "step" : undefined}>
          {i > 0 && <span className={`absolute left-[-50%] top-4 h-1 w-full ${i <= idx ? "bg-teal" : "bg-ink/15"}`} aria-hidden />}
          <span className={`relative z-10 mx-auto grid h-9 w-9 place-items-center rounded-full border-2 border-ink text-sm font-extrabold ${i < idx ? "bg-teal text-white" : i === idx ? "bg-rose" : "bg-white"}`}>{i < idx ? "✓" : i + 1}</span>
          <span className={`mt-1 block text-[11px] leading-tight sm:text-xs ${i === idx ? "font-extrabold" : "text-ink/70"}`}>{s}</span>
        </li>
      ))}
    </ol>
  );
}
