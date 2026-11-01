import { Clock } from "lucide-react";
import { getAdvisorContext } from "@/lib/session";
import { SignOutButton } from "@/components/layout/sign-out-button";
import { approvalLabel } from "@/lib/labels";

export default async function PendingApprovalPage() {
  const { profile } = await getAdvisorContext();

  return (
    <main className="theme-advisor flex min-h-screen items-center justify-center bg-gradient-to-br from-violet-50 to-white px-4 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-lg rounded-2xl border bg-card p-8 text-center shadow-sm">
        <Clock className="mx-auto mb-4 h-12 w-12 text-violet-600" />
        <h1 className="text-2xl font-bold">Hesabınız onay bekliyor</h1>
        <p className="mt-3 text-muted-foreground">
          {profile.title} kaydınız yönetici onayına gönderildi. Durum:{" "}
          <strong>{approvalLabel[profile.approvalStatus]}</strong>.
        </p>
        {profile.rejectionReason && (
          <p className="mt-2 text-sm text-destructive">Gerekçe: {profile.rejectionReason}</p>
        )}
        <p className="mt-4 text-sm text-muted-foreground">
          Onaylandıktan sonra danışman paneline erişebilirsiniz.
        </p>
        <div className="mt-6">
          <SignOutButton />
        </div>
      </div>
    </main>
  );
}
