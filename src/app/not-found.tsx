import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-7xl font-display font-bold text-primary">404</h1>
      <p className="text-text-muted mt-3">The page or channel you’re looking for doesn’t exist.</p>
      <Link href="/" className="mt-6 bg-primary hover:bg-primary-dark px-6 py-3 rounded-full font-semibold">Go home</Link>
    </main>
  );
}
