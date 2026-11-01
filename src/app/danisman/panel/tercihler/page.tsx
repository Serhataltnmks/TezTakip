import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { PreferenceActions } from "@/components/advisor/preference-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAdvisorContext } from "@/lib/session";
import { processExpiredPreferences } from "@/lib/preferences";
import { prisma } from "@/lib/prisma";
import { fullName } from "@/lib/utils";
import { levelLabel } from "@/lib/labels";

export default async function IncomingPreferencesPage() {
  await processExpiredPreferences();
  const { profile } = await getAdvisorContext();
  const preferences = await prisma.advisorPreference.findMany({
    where: { advisorId: profile.id, status: "BEKLIYOR", offeredAt: { not: null } },
    include: { student: { include: { user: true, department: true } } },
    orderBy: { offeredAt: "asc" },
  });

  return (
    <div>
      <PageHeader title="Gelen Tercihler" description="Kabul veya ret yanıtınız 7 gün içinde beklenir." />
      {preferences.length === 0 && (
        <EmptyState title="Bekleyen tercih yok" description="Öğrenciler sizi seçtiğinde burada görünür." />
      )}
      <div className="space-y-3">
        {preferences.map((p) => (
          <Card key={p.id}>
            <CardHeader>
              <CardTitle className="flex flex-wrap items-center gap-2 text-base">
                {fullName(p.student.user.firstName, p.student.user.lastName)}
                <Badge variant="outline">{levelLabel[p.student.level]}</Badge>
                <Badge>{p.rank}. sıra</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>Öğrenci no: {p.student.studentNo}</p>
              <p>Bölüm: {p.student.department.name}</p>
              <p>Not: {p.note || "Not eklenmemiş"}</p>
              <PreferenceActions id={p.id} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
