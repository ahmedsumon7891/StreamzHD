import { redirect } from "next/navigation";
import { ClientAdminLayout } from "./ClientAdminLayout";
import { ToastHost } from "@/components/ui/Toast";
import { getAdminUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Middleware guarantees a signed-in user; this verifies the admin role.
  const admin = await getAdminUser();
  if (!admin) redirect("/admin/login");

  return (
    <ClientAdminLayout>
      {children}
      <ToastHost />
    </ClientAdminLayout>
  );
}
