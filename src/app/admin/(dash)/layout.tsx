import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { AdminNav } from "@/components/admin/admin-nav";

export const metadata = {
  title: "Operations — Zuronix",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const authed = await isAdminAuthenticated();
  if (!authed) redirect("/admin/login");

  return (
    <div className="flex min-h-screen flex-col bg-secondary/30">
      <AdminNav />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">{children}</main>
      <footer className="border-t border-border bg-background px-4 py-3 text-center text-xs text-muted-foreground">
        Zuronix internal — customer data. Do not share links from this console.
      </footer>
    </div>
  );
}
