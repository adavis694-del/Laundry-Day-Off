"use client";
import { useState } from "react";
import { getSupabase, supabaseConfigured } from "@/lib/supabase";

export function SetupNotice() {
  return (
    <div role="note" className="rounded-2xl border-2 border-dashed border-ink bg-[#FFF4CC] p-4 text-sm">
      <b>Accounts aren't connected yet.</b> Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in
      your hosting settings and redeploy (see README, &ldquo;Connect Supabase&rdquo;).
    </div>
  );
}

/** Sign in / create account. `title` lets each page explain why sign-in is needed. */
export default function AuthForm({ title = "Sign in", intro, embedded = false }: { title?: string; intro?: string; embedded?: boolean }) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  if (!supabaseConfigured) return <SetupNotice />;

  const redirect = () => window.location.href;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const sb = getSupabase(); if (!sb) return;
    setErr(""); setMsg("");
    if (!/^\S+@\S+\.\S+$/.test(email)) return setErr("Enter a valid email.");
    if (password.length < 8) return setErr("Password must be at least 8 characters.");
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await sb.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { data, error } = await sb.auth.signUp({ email, password, options: { emailRedirectTo: redirect() } });
        if (error) throw error;
        if (!data.session) setMsg("Check your email and tap the confirmation link to finish creating your account.");
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally { setBusy(false); }
  }

  async function magicLink() {
    const sb = getSupabase(); if (!sb) return;
    setErr(""); setMsg("");
    if (!/^\S+@\S+\.\S+$/.test(email)) return setErr("Enter your email above first.");
    setBusy(true);
    const { error } = await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: redirect(), shouldCreateUser: false } });
    setBusy(false);
    if (error) setErr(error.message); else setMsg("Sign-in link sent. Check your email.");
  }

  return (
    <form onSubmit={submit} noValidate className={embedded ? "max-w-md" : "card mx-auto max-w-md"}>
      <h2 className="text-2xl font-extrabold">{mode === "signin" ? title : "Create your account"}</h2>
      {intro && <p className="mt-1 text-sm text-ink/70">{intro}</p>}
      <div className="mt-4 grid grid-cols-2 gap-2" role="tablist">
        {(["signin", "signup"] as const).map((m) => (
          <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => { setMode(m); setErr(""); setMsg(""); }}
            className={`rounded-full border-2 border-ink py-2 text-sm font-extrabold ${mode === m ? "bg-teal text-white" : "bg-white hover:bg-teal-soft"}`}>
            {m === "signin" ? "Sign in" : "New customer"}
          </button>
        ))}
      </div>
      <label htmlFor="au-email" className="label mt-4">Email</label>
      <input id="au-email" type="email" className="input" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value.trim())} />
      <label htmlFor="au-pw" className="label mt-3">Password</label>
      <input id="au-pw" type="password" className="input" autoComplete={mode === "signin" ? "current-password" : "new-password"}
        value={password} onChange={(e) => setPassword(e.target.value)} placeholder={mode === "signup" ? "At least 8 characters" : ""} />
      {err && <p role="alert" className="mt-3 text-sm font-bold text-[#B4232F]">{err}</p>}
      {msg && <p role="status" className="mt-3 rounded-xl bg-teal-soft px-3 py-2 text-sm font-bold text-teal-deep">{msg}</p>}
      <button className="btn-primary mt-5 w-full" disabled={busy}>{busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}</button>
      {mode === "signin" && (
        <button type="button" onClick={magicLink} disabled={busy} className="mt-3 w-full text-sm font-bold text-teal-deep underline">
          Forgot password? Email me a sign-in link
        </button>
      )}
    </form>
  );
}
