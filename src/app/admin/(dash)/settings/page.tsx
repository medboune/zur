import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { ensureAdminUser } from "@/lib/admin-users";
import {
  EmailForm,
  PasswordForm,
  UsernameForm,
} from "@/components/admin/account-settings-forms";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const user =
    (await db.adminUser.findUnique({ where: { id: session.id } })) ??
    (await ensureAdminUser());
  if (!user) redirect("/admin/login");

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight">Account settings</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Credentials for this operations console. Changes apply immediately.
      </p>

      <div className="mt-6 space-y-5">
        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="font-semibold">Sign-in username</h2>
          <div className="mt-4">
            <UsernameForm current={user.username} />
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="font-semibold">Email address</h2>
          <div className="mt-4">
            <EmailForm current={user.email} />
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="font-semibold">Password</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Passwords are stored as salted PBKDF2-SHA256 hashes — never in plain text.
          </p>
          <div className="mt-4">
            <PasswordForm />
          </div>
        </section>
      </div>
    </div>
  );
}
