import { PageHeader } from "@/components/page-header";
import { ApprovalActions } from "@/components/admin/approval-actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { approvalLabel } from "@/lib/labels";
import { fullName, parseExpertise } from "@/lib/utils";

export default async function AdvisorApprovalPage() {
  await requireRole("YONETICI");
  const advisors = await prisma.advisorProfile.findMany({
    include: { user: true, department: true },
    orderBy: { approvalStatus: "asc" },
  });

  return (
    <div>
      <PageHeader title="Danışman onayları" />
      <div className="space-y-3">
        {advisors.map((a) => (
          <Card key={a.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">
                {a.title} {fullName(a.user.firstName, a.user.lastName)}
              </CardTitle>
              <Badge variant={a.approvalStatus === "ONAYLANDI" ? "success" : a.approvalStatus === "REDDEDILDI" ? "destructive" : "warning"}>
                {approvalLabel[a.approvalStatus]}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>{a.user.email} · {a.department.name}</p>
              <p>Uzmanlık: {parseExpertise(a.expertise).join(", ")}</p>
              <p>
                Kota: Lisans {a.quotaLisans} / YL {a.quotaYL}
              </p>
              {a.approvalStatus === "BEKLIYOR" && <ApprovalActions advisorId={a.id} />}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
