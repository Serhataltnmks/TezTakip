import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { runMaintenanceJobs } from "@/lib/jobs";
import { getAdvisorContext } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export default async function AdvisorHomePage() {
  await runMaintenanceJobs();
  const { profile } = await getAdvisorContext();

  const [students, pendingPrefs, pendingFiles, upcoming] = await Promise.all([
    prisma.studentProfile.count({ where: { advisorId: profile.id } }),
    prisma.advisorPreference.count({
      where: { advisorId: profile.id, status: "BEKLIYOR", offeredAt: { not: null } },
    }),
    prisma.documentVersion.count({
      where: {
        status: "INCELENIYOR",
        document: { thesis: { student: { advisorId: profile.id } } },
      },
    }),
    prisma.deadline.count({
      where: {
        dueDate: { gte: new Date(), lte: new Date(Date.now() + 7 * 86400000) },
        thesis: { student: { advisorId: profile.id } },
      },
    }),
  ]);

  const cards = [
    { title: "Toplam öğrenci", value: students },
    { title: "Bekleyen tercih", value: pendingPrefs },
    { title: "İncelemeyi bekleyen dosya", value: pendingFiles },
    { title: "Yaklaşan teslim", value: upcoming },
  ];

  return (
    <div>
      <PageHeader title="Özet" description="Danışmanlık yükünüzün genel görünümü." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
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
