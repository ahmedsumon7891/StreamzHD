import { redirect } from "next/navigation";
import { Sidebar } from "@/components/admin/Sidebar";
import { ToastHost } from "@/components/ui/Toast";
import { getAdminUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Middleware guarantees a signed-in user; this verifies the admin role.
  const admin = await getAdminUser();
  if (!admin) redirect("/admin/login");

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 bg-bg">{children}</main>
      <ToastHost />
    </div>
  );
}
