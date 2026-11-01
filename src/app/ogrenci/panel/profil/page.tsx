import { PageHeader } from "@/components/page-header";
import { ProfileForms } from "@/components/profile/profile-forms";
import { getStudentContext } from "@/lib/session";

export default async function StudentProfilePage() {
  const { user, profile } = await getStudentContext();
  return (
    <div>
      <PageHeader title="Profil" description="Kişisel bilgileriniz ve şifre değiştirme." />
      <ProfileForms
        firstName={user.firstName}
        lastName={user.lastName}
        extra={`${profile.studentNo} · ${profile.department.name}`}
      />
    </div>
  );
}
