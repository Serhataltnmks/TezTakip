import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { runMaintenanceJobs } from "@/lib/jobs";

export default async function AdminHomePage() {
  await requireRole("YONETICI");
  await runMaintenanceJobs();
  const [students, advisors, pending, overdue] = await Promise.all([
    prisma.studentProfile.count(),
    prisma.advisorProfile.count({ where: { approvalStatus: "ONAYLANDI" } }),
    prisma.advisorProfile.count({ where: { approvalStatus: "BEKLIYOR" } }),
    prisma.deadline.count({ where: { dueDate: { lt: new Date() } } }),
  ]);

  const items = [
    { title: "Öğrenci", value: students },
    { title: "Onaylı danışman", value: advisors },
    { title: "Onay bekleyen", value: pending },
    { title: "Geciken teslim", value: overdue },
  ];

  return (
    <div>
      <PageHeader title="Yönetim özeti" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((c) => (
          <Card key={c.title}>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">{c.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{c.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
