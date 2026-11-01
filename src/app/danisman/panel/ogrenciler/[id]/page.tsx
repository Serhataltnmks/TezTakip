import { notFound } from "next/navigation";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { PageHeader } from "@/components/page-header";
import { CommentThread } from "@/components/comments/comment-thread";
import { VersionList } from "@/components/documents/version-list";
import { ThesisAdvisorActions } from "@/components/advisor/thesis-advisor-actions";
import { DeadlineForm } from "@/components/advisor/deadline-form";
import { MeetingForm } from "@/components/advisor/meeting-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdvisorContext } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { fullName } from "@/lib/utils";
import { documentTypeLabel, levelLabel, stageLabel } from "@/lib/labels";
import { deadlineState } from "@/lib/jobs";

export default async function AdvisorStudentDetailPage({ params }: { params: { id: string } }) {
  const { profile } = await getAdvisorContext();
  const student = await prisma.studentProfile.findUnique({
    where: { id: params.id },
    include: {
      user: true,
      department: true,
      thesis: {
        include: {
          documents: {
            include: {
              versions: {
                orderBy: { versionNo: "desc" },
                include: { comments: { include: { author: true }, orderBy: { createdAt: "asc" } } },
              },
            },
          },
          deadlines: { orderBy: { dueDate: "asc" } },
          meetings: { orderBy: { date: "desc" } },
        },
      },
    },
  });
  if (!student || student.advisorId !== profile.id) notFound();
  const thesis = student.thesis;

  return (
    <div className="space-y-6">
      <PageHeader
        title={fullName(student.user.firstName, student.user.lastName)}
        description={`${student.studentNo} · ${levelLabel[student.level]} · ${student.department.name}`}
      />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Tez
            <Badge>{stageLabel[thesis?.stage ?? "DANISMAN_SECIMI"]}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <strong>Başlık:</strong> {thesis?.title || "Henüz gönderilmedi"}
          </p>
          <p>
            <strong>Özet:</strong> {thesis?.abstract || "-"}
          </p>
          {thesis && <ThesisAdvisorActions thesisId={thesis.id} stage={thesis.stage} />}
        </CardContent>
      </Card>

      {thesis && (
        <>
          <section>
            <h3 className="mb-3 text-lg font-semibold">Dosyalar ve sürümler</h3>
            {thesis.documents.length === 0 && <p className="text-sm text-muted-foreground">Dosya yok.</p>}
            {thesis.documents.map((doc) => (
              <div key={doc.id} className="mb-6">
                <h4 className="mb-2 font-medium">
                  {doc.title} · {documentTypeLabel[doc.type]}
                </h4>
                <VersionList versions={doc.versions} documentId={doc.id} canReview />
                <div className="mt-3">
                  <CommentThread versionId={doc.versions[0]?.id} comments={doc.versions[0]?.comments ?? []} />
                </div>
              </div>
            ))}
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Son tarihler</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {thesis.deadlines.map((d) => {
                  const state = deadlineState(d.dueDate);
                  return (
                    <div key={d.id} className="flex justify-between rounded-md border p-2 text-sm">
                      <span>{d.title}</span>
                      <Badge variant={state === "overdue" ? "destructive" : state === "soon" ? "warning" : "secondary"}>
                        {format(d.dueDate, "d MMM yyyy", { locale: tr })}
                      </Badge>
                    </div>
                  );
                })}
                <DeadlineForm thesisId={thesis.id} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Görüşme kayıtları</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {thesis.meetings.map((m) => (
                  <div key={m.id} className="rounded-md border p-2 text-sm">
                    <p className="font-medium">{m.subject}</p>
                    <p className="text-muted-foreground">{format(m.date, "d MMM yyyy", { locale: tr })}</p>
                    {m.notes && <p>{m.notes}</p>}
                  </div>
                ))}
                <MeetingForm thesisId={thesis.id} />
              </CardContent>
            </Card>
          </section>
        </>
      )}
    </div>
  );
}
