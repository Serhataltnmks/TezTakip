import { DashboardShell } from "@/components/layout/dashboard-shell";
import { requireRole } from "@/lib/session";
import { fullName } from "@/lib/utils";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("YONETICI");
  return (
    <DashboardShell
      title="Yönetici Paneli"
      themeClass="theme-admin"
      userName={fullName(user.firstName, user.lastName)}
      notificationsHref="/yonetici/panel/bildirimler"
      nav={[
        { href: "/yonetici/panel", label: "Ana sayfa", icon: "home" },
        { href: "/yonetici/panel/danisman-onay", label: "Danışman onayları", icon: "shield" },
        { href: "/yonetici/panel/kullanicilar", label: "Kullanıcılar", icon: "users" },
        { href: "/yonetici/panel/atama", label: "Danışman atama", icon: "userPlus" },
        { href: "/yonetici/panel/bolumler", label: "Bölümler", icon: "building" },
        { href: "/yonetici/panel/donemler", label: "Dönemler", icon: "calendar" },
        { href: "/yonetici/panel/raporlar", label: "Raporlar", icon: "chart" },
        { href: "/yonetici/panel/bildirimler", label: "Bildirimler", icon: "bell" },
        { href: "/yonetici/panel/profil", label: "Profil", icon: "user" },
      ]}
    >
      {children}
    </DashboardShell>
  );
}
