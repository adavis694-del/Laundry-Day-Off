import { GROUPS, RULES } from "@/lib/agreement";

function Marked({ text }: { text: string }) {
  const parts = text.split(/(\[[^\]]*TBD[^\]]*\])/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("[") && p.includes("TBD") ? (
          <mark key={i} className="rounded bg-[#FFE9A8] px-1 text-ink">{p}</mark>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}

export default function RulesList() {
  return (
    <div className="space-y-7">
      {GROUPS.map((g) => (
        <section key={g}>
          <h3 className="text-lg font-extrabold text-teal-deep">{g}</h3>
          <ul className="mt-2 space-y-3">
            {RULES.filter((r) => r.group === g).map((r) => (
              <li key={r.id}>
                <p className="font-bold">{r.title}</p>
                <p className="text-sm leading-relaxed text-ink/80"><Marked text={r.body} /></p>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
