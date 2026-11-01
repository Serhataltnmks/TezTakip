import { DashboardShell } from "@/components/layout/dashboard-shell";
import { requireRole } from "@/lib/session";
import { fullName } from "@/lib/utils";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("OGRENCI");
  return (
    <DashboardShell
      title="Öğrenci Paneli"
      userName={fullName(user.firstName, user.lastName)}
      notificationsHref="/ogrenci/panel/bildirimler"
      nav={[
        { href: "/ogrenci/panel", label: "Ana sayfa", icon: "home" },
        { href: "/ogrenci/panel/danisman", label: "Danışmanım", icon: "userRound" },
        { href: "/ogrenci/panel/tezim", label: "Tezim", icon: "graduation" },
        { href: "/ogrenci/panel/dosyalar", label: "Dosyalarım", icon: "file" },
        { href: "/ogrenci/panel/bildirimler", label: "Bildirimler", icon: "bell" },
        { href: "/ogrenci/panel/profil", label: "Profil", icon: "user" },
      ]}
    >
      {children}
    </DashboardShell>
  );
}
