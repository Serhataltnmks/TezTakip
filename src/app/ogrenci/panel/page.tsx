import Link from "next/link";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { THESIS_STAGES } from "@/lib/constants";
import { runMaintenanceJobs, deadlineState } from "@/lib/jobs";
import { stageLabel } from "@/lib/labels";
import { getStudentContext } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { parseExpertise, fullName } from "@/lib/utils";

export default async function StudentHomePage() {
  await runMaintenanceJobs();
  const { profile } = await getStudentContext();
  const thesis = await prisma.thesis.findUnique({
    where: { studentId: profile.id },
    include: {
      deadlines: { orderBy: { dueDate: "asc" } },
      documents: {
        include: {
          versions: {
            include: { comments: { include: { author: true }, orderBy: { createdAt: "desc" }, take: 1 } },
            orderBy: { uploadedAt: "desc" },
            take: 1,
          },
        },
      },
    },
  });

  const stageIndex = THESIS_STAGES.indexOf(thesis?.stage ?? "DANISMAN_SECIMI");
  const progress = Math.round(((stageIndex + 1) / THESIS_STAGES.length) * 100);
  const comments = thesis?.documents.flatMap((d) =>
    d.versions.flatMap((v) =>
      v.comments.map((c) => ({
        ...c,
        docTitle: d.title,
      }))
    )
  ) ?? [];

  return (
    <div>
      <PageHeader title="Hoş geldiniz" description="Tez sürecinizin özeti." />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Tez aşaması</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-2 text-sm font-medium">{stageLabel[thesis?.stage ?? "DANISMAN_SECIMI"]}</p>
            <Progress value={progress} />
            <div className="mt-3 flex flex-wrap gap-1">
              {THESIS_STAGES.map((s, i) => (
                <Badge key={s} variant={i <= stageIndex ? "default" : "outline"}>
                  {stageLabel[s]}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Danışman</CardTitle>
          </CardHeader>
          <CardContent>
            {profile.advisor ? (
              <div>
                <p className="font-medium">
                  {profile.advisor.title} {fullName(profile.advisor.user.firstName, profile.advisor.user.lastName)}
                </p>
                <p className="text-sm text-muted-foreground">{profile.advisor.user.email}</p>
                <p className="mt-2 text-sm">
                  Uzmanlık: {parseExpertise(profile.advisor.expertise).join(", ")}
                </p>
              </div>
            ) : (
              <EmptyState
                title="Henüz danışman seçmedin"
                description="Kendi bölümündeki danışmanlardan en fazla 3 tercih yapabilirsin."
                actionHref="/ogrenci/panel/danisman"
                actionLabel="Danışman Seç"
              />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Yaklaşan son tarihler</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(thesis?.deadlines ?? []).length === 0 && (
              <p className="text-sm text-muted-foreground">Tanımlı son tarih yok.</p>
            )}
            {thesis?.deadlines.map((d) => {
              const state = deadlineState(d.dueDate);
              return (
                <div key={d.id} className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <p className="font-medium">{d.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(d.dueDate, "d MMMM yyyy", { locale: tr })}
                    </p>
                  </div>
                  <Badge variant={state === "overdue" ? "destructive" : state === "soon" ? "warning" : "secondary"}>
                    {state === "overdue" ? "Gecikti" : state === "soon" ? "Yaklaşıyor" : "Planlı"}
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Son yorumlar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {comments.length === 0 && <p className="text-sm text-muted-foreground">Henüz yorum yok.</p>}
            {comments.slice(0, 5).map((c) => (
              <Link key={c.id} href="/ogrenci/panel/dosyalar" className="block rounded-md border p-3 hover:bg-muted/50">
                <p className="text-sm font-medium">{c.docTitle}</p>
                <p className="text-sm text-muted-foreground">{c.content}</p>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
