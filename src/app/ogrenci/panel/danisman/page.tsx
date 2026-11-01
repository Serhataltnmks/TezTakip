import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { getStudentContext } from "@/lib/session";
import { processExpiredPreferences } from "@/lib/preferences";
import { prisma } from "@/lib/prisma";
import { parseExpertise, fullName } from "@/lib/utils";
import { AdvisorPicker } from "@/components/student/advisor-picker";
import { preferenceLabel } from "@/lib/labels";
import { Badge } from "@/components/ui/badge";

export default async function StudentAdvisorPage() {
  await processExpiredPreferences();
  const { profile } = await getStudentContext();

  if (profile.advisor) {
    const a = profile.advisor;
    return (
      <div>
        <PageHeader title="Danışmanım" description="Eşleştiğiniz öğretim üyesi." />
        <Card>
          <CardHeader>
            <CardTitle>
              {a.title} {fullName(a.user.firstName, a.user.lastName)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <strong>E-posta:</strong> {a.user.email}
            </p>
            <p>
              <strong>Bölüm:</strong> {a.department.name}
            </p>
            <p>
              <strong>Uzmanlık alanları:</strong> {parseExpertise(a.expertise).join(", ")}
            </p>
            <p>
              <strong>Ofis / görüşme saatleri:</strong> {a.officeHours || "Belirtilmemiş"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const preferences = await prisma.advisorPreference.findMany({
    where: { studentId: profile.id },
    include: { advisor: { include: { user: true } } },
    orderBy: [{ createdAt: "desc" }, { rank: "asc" }],
    take: 12,
  });

  const activeSet = preferences.filter((p) => p.status === "BEKLIYOR" || p.status === "KABUL");

  return (
    <div>
      <PageHeader title="Danışman seç" description="Kendi bölümünüzde kontenjanı olan onaylı danışmanlardan en fazla 3 tercih yapın." />
      {preferences.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Tercihlerim</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {preferences.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-md border p-3 text-sm">
                <span>
                  {p.rank}. {p.advisor.title} {fullName(p.advisor.user.firstName, p.advisor.user.lastName)}
                </span>
                <Badge variant={p.status === "KABUL" ? "success" : p.status === "RED" ? "destructive" : "secondary"}>
                  {preferenceLabel[p.status]}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      {activeSet.length === 0 ? (
        <AdvisorPicker />
      ) : (
        <p className="text-sm text-muted-foreground">Aktif tercih süreciniz tamamlanana kadar yeni tercih gönderemezsiniz.</p>
      )}
    </div>
  );
}
