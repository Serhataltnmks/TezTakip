import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAdvisorContext } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { fullName } from "@/lib/utils";
import { levelLabel, stageLabel } from "@/lib/labels";
import { StudentsFilter } from "@/components/advisor/students-filter";
import type { ProgramLevel, ThesisStage } from "@/lib/enums";

export default async function AdvisorStudentsPage({
  searchParams,
}: {
  searchParams: { q?: string; stage?: string };
}) {
  const { profile } = await getAdvisorContext();
  const q = searchParams.q ?? "";
  const stage = searchParams.stage as ThesisStage | undefined;

  const students = await prisma.studentProfile.findMany({
    where: {
      advisorId: profile.id,
      ...(stage ? { thesis: { stage } } : {}),
      ...(q
        ? {
            OR: [
              { studentNo: { contains: q } },
              { user: { firstName: { contains: q } } },
              { user: { lastName: { contains: q } } },
            ],
          }
        : {}),
    },
    include: { user: true, thesis: true },
    orderBy: { user: { lastName: "asc" } },
  });

  function list(level: ProgramLevel) {
    const items = students.filter((s) => s.level === level);
    if (items.length === 0) {
      return <EmptyState title={`Kayıtlı ${levelLabel[level].toLowerCase()} öğrencisi yok`} description="Eşleşme sonrası burada listelenir." />;
    }
    return (
      <div className="grid gap-3 md:grid-cols-2">
        {items.map((s) => (
          <Link key={s.id} href={`/danisman/panel/ogrenciler/${s.id}`}>
            <Card className="hover:bg-muted/40">
              <CardHeader>
                <CardTitle className="text-base">{fullName(s.user.firstName, s.user.lastName)}</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between text-sm">
                <span>{s.studentNo}</span>
                <Badge>{stageLabel[s.thesis?.stage ?? "DANISMAN_SECIMI"]}</Badge>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Öğrencilerim" />
      <StudentsFilter />
      <Tabs defaultValue="LISANS" className="mt-4">
        <TabsList>
          <TabsTrigger value="LISANS">Lisans</TabsTrigger>
          <TabsTrigger value="YUKSEK_LISANS">Yüksek Lisans</TabsTrigger>
        </TabsList>
        <TabsContent value="LISANS">{list("LISANS")}</TabsContent>
        <TabsContent value="YUKSEK_LISANS">{list("YUKSEK_LISANS")}</TabsContent>
      </Tabs>
    </div>
  );
}
