import Link from "next/link";
export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <div className="card">
        <h1 className="text-3xl font-extrabold">Page not found</h1>
        <p className="mt-2 text-ink/80">This page took the day off.</p>
        <Link href="/" className="btn-primary mt-5">Back home</Link>
      </div>
    </div>
  );
}
