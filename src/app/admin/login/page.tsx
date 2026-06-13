"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { LogIn } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: signInError } = await supabaseBrowser.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (signInError) {
      setLoading(false);
      setError(signInError.message);
      return;
    }
    // Dashboard layout re-checks the admin role server-side and bounces
    // non-admins back here with a generic error.
    router.push("/admin/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-screen grid place-items-center px-4">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-2xl">
        <div className="flex justify-center mb-6"><Logo /></div>
        <h1 className="text-2xl font-display font-bold text-center">Admin sign in</h1>
        <p className="text-text-muted text-sm text-center mt-1">Access the StreamZ HD dashboard</p>
        <form onSubmit={submit} className="mt-7 space-y-4">
          <label className="block">
            <span className="block text-xs uppercase tracking-wider text-text-dim mb-1.5">Email</span>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoFocus className="w-full bg-bg border border-border rounded-lg px-4 py-2.5 focus:border-primary focus:outline-none" />
          </label>
          <label className="block">
            <span className="block text-xs uppercase tracking-wider text-text-dim mb-1.5">Password</span>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-bg border border-border rounded-lg px-4 py-2.5 focus:border-primary focus:outline-none" />
          </label>
          {error && <div className="text-error text-sm bg-error/10 border border-error/30 rounded-lg px-3 py-2">{error}</div>}
          <button disabled={loading} className="w-full bg-primary hover:bg-primary-dark disabled:opacity-50 transition rounded-lg py-3 font-semibold flex items-center justify-center gap-2">
            <LogIn className="h-4 w-4" /> {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
