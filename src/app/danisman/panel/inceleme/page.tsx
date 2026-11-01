import Link from "next/link";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAdvisorContext } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { fullName } from "@/lib/utils";
import { documentTypeLabel } from "@/lib/labels";

export default async function ReviewQueuePage() {
  const { profile } = await getAdvisorContext();
  const versions = await prisma.documentVersion.findMany({
    where: {
      status: "INCELENIYOR",
      document: { thesis: { student: { advisorId: profile.id } } },
    },
    include: {
      document: { include: { thesis: { include: { student: { include: { user: true } } } } } },
    },
    orderBy: { uploadedAt: "asc" },
  });

  return (
    <div>
      <PageHeader title="İnceleme Kuyruğu" description="Durumu İnceleniyor olan tüm dosyalar." />
      {versions.length === 0 && (
        <EmptyState title="Kuyruk boş" description="Yeni yüklemeler burada toplanır." />
      )}
      <div className="space-y-3">
        {versions.map((v) => (
          <Link key={v.id} href={`/danisman/panel/ogrenciler/${v.document.thesis.studentId}`}>
            <Card className="mb-3 hover:bg-muted/40">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base">{v.document.title}</CardTitle>
                <Badge variant="outline">{documentTypeLabel[v.document.type]}</Badge>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {fullName(
                  v.document.thesis.student.user.firstName,
                  v.document.thesis.student.user.lastName
                )}{" "}
                · v{v.versionNo} · {format(v.uploadedAt, "d MMM yyyy HH:mm", { locale: tr })}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
