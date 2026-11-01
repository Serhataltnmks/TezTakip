import { DashboardShell } from "@/components/layout/dashboard-shell";
import { requireRole } from "@/lib/session";
import { fullName } from "@/lib/utils";

export default async function AdvisorLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("DANISMAN");
  return (
    <DashboardShell
      title="Danışman Paneli"
      themeClass="theme-advisor"
      userName={fullName(user.firstName, user.lastName)}
      notificationsHref="/danisman/panel/bildirimler"
      nav={[
        { href: "/danisman/panel", label: "Ana sayfa", icon: "home" },
        { href: "/danisman/panel/tercihler", label: "Gelen Tercihler", icon: "inbox" },
        { href: "/danisman/panel/ogrenciler", label: "Öğrencilerim", icon: "users" },
        { href: "/danisman/panel/inceleme", label: "İnceleme Kuyruğu", icon: "clipboard" },
        { href: "/danisman/panel/bildirimler", label: "Bildirimler", icon: "bell" },
        { href: "/danisman/panel/profil", label: "Profil", icon: "user" },
      ]}
    >
      {children}
    </DashboardShell>
  );
}
