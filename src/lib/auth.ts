import "server-only";
import { createSupabaseServerClient, supabaseAdmin } from "@/lib/supabase/server";

export interface AdminUser {
  id: string;
  email: string | null;
}

/**
 * Returns the signed-in admin (Supabase Auth user with the `admin` role)
 * or null. Uses the SSR cookie-bound client to read the session.
 */
export async function getAdminUser(): Promise<AdminUser | null> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Service-role check against user_roles via has_role() RPC — bypasses RLS.
  const { data: isAdmin } = await supabaseAdmin.rpc("has_role", {
    _user_id: user.id,
    _role: "admin",
  });
  if (!isAdmin) return null;
  return { id: user.id, email: user.email ?? null };
}

/**
 * Throws a 401 / 403 Response if the caller is not an admin.
 * API route handlers use: `try { await requireAdmin(); } catch (r) { return r as Response; }`
 * The optional argument is ignored (kept for backwards compatibility).
 */
export async function requireAdmin(_req?: unknown): Promise<AdminUser> {
  const admin = await getAdminUser();
  if (!admin) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  return admin;
}
