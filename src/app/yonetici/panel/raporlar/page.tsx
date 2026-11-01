import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getAdvisorAssignedCounts } from "@/lib/preferences";
import { remainingQuota } from "@/lib/preferences-logic";
import { stageLabel } from "@/lib/labels";
import { fullName } from "@/lib/utils";

export default async function ReportsPage() {
  await requireRole("YONETICI");
  const advisors = await prisma.advisorProfile.findMany({
    where: { approvalStatus: "ONAYLANDI" },
    include: { user: true, department: true },
  });
  const occupancy = [];
  for (const advisor of advisors) {
    const counts = await getAdvisorAssignedCounts(advisor.id);
    occupancy.push({
      name: `${advisor.title} ${fullName(advisor.user.firstName, advisor.user.lastName)}`,
      department: advisor.department.name,
      lisans: `${counts.assignedLisans}/${advisor.quotaLisans} (kalan ${remainingQuota({ ...advisor, ...counts, level: "LISANS" })})`,
      yl: `${counts.assignedYL}/${advisor.quotaYL} (kalan ${remainingQuota({ ...advisor, ...counts, level: "YUKSEK_LISANS" })})`,
    });
  }

  const theses = await prisma.thesis.groupBy({ by: ["stage"], _count: { _all: true } });
  const overdue = await prisma.deadline.findMany({
    where: { dueDate: { lt: new Date() } },
    include: { thesis: { include: { student: { include: { user: true } } } } },
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Raporlar" />
      <Button asChild>
        <a href="/api/admin/reports?format=csv">CSV dışa aktar</a>
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>Danışman doluluk</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Danışman</TableHead>
                <TableHead>Bölüm</TableHead>
                <TableHead>Lisans</TableHead>
                <TableHead>Yüksek lisans</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {occupancy.map((o) => (
                <TableRow key={o.name}>
                  <TableCell>{o.name}</TableCell>
                  <TableCell>{o.department}</TableCell>
                  <TableCell>{o.lisans}</TableCell>
                  <TableCell>{o.yl}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Aşamalara göre dağılım</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          {theses.map((t) => (
            <p key={t.stage}>
              {stageLabel[t.stage]}: {t._count._all}
            </p>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Geciken teslimler</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {overdue.length === 0 && <p>Geciken teslim yok.</p>}
          {overdue.map((d) => (
            <p key={d.id}>
              {d.title} — {fullName(d.thesis.student.user.firstName, d.thesis.student.user.lastName)} —{" "}
              {format(d.dueDate, "d MMM yyyy", { locale: tr })}
            </p>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
