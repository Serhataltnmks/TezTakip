import { PageHeader } from "@/components/page-header";
import { ProfileForms } from "@/components/profile/profile-forms";
import { requireRole } from "@/lib/session";

export default async function AdminProfilePage() {
  const user = await requireRole("YONETICI");
  return (
    <div>
      <PageHeader title="Profil" />
      <ProfileForms firstName={user.firstName} lastName={user.lastName} extra="Yönetici hesabı" />
    </div>
  );
}
