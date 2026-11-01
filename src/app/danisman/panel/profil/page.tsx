import { PageHeader } from "@/components/page-header";
import { ProfileForms } from "@/components/profile/profile-forms";
import { getAdvisorContext } from "@/lib/session";
import { parseExpertise } from "@/lib/utils";

export default async function AdvisorProfilePage() {
  const { user, profile } = await getAdvisorContext();
  return (
    <div>
      <PageHeader title="Profil" description="Uzmanlık alanları, kontenjan ve görüşme saatleri." />
      <ProfileForms
        firstName={user.firstName}
        lastName={user.lastName}
        extra={profile.department.name}
        advisor={{
          title: profile.title,
          expertise: parseExpertise(profile.expertise).join(", "),
          quotaLisans: profile.quotaLisans,
          quotaYL: profile.quotaYL,
          officeHours: profile.officeHours ?? "",
        }}
      />
    </div>
  );
}
