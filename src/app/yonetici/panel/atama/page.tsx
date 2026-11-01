import { PageHeader } from "@/components/page-header";
import { AssignForm } from "@/components/admin/assign-form";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { fullName } from "@/lib/utils";

export default async function AssignPage() {
  await requireRole("YONETICI");
  const [students, advisors] = await Promise.all([
    prisma.studentProfile.findMany({
      include: { user: true, department: true, advisor: { include: { user: true } } },
      orderBy: { studentNo: "asc" },
    }),
    prisma.advisorProfile.findMany({
      where: { approvalStatus: "ONAYLANDI" },
      include: { user: true, department: true },
    }),
  ]);

  return (
    <div>
      <PageHeader title="Elle danışman atama" description="Gerektiğinde eşleşmeyi yönetici değiştirir." />
      <AssignForm
        students={students.map((s) => ({
          id: s.id,
          label: `${fullName(s.user.firstName, s.user.lastName)} (${s.studentNo}) — ${
            s.advisor ? `${s.advisor.title} ${s.advisor.user.lastName}` : "atamasız"
          }`,
          departmentId: s.departmentId,
        }))}
        advisors={advisors.map((a) => ({
          id: a.id,
          label: `${a.title} ${fullName(a.user.firstName, a.user.lastName)} · ${a.department.name}`,
          departmentId: a.departmentId,
        }))}
      />
    </div>
  );
}
