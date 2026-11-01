import { DocumentUpload } from "@/components/student/document-upload";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { documentStatusLabel, documentTypeLabel } from "@/lib/labels";
import { getStudentContext } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function FilesPage() {
  const { profile } = await getStudentContext();
  const documents = profile.thesis
    ? await prisma.document.findMany({
        where: { thesisId: profile.thesis.id },
        include: { versions: { orderBy: { versionNo: "desc" } } },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <div>
      <PageHeader title="Dosyalarım" description="Word, PDF ve PowerPoint yükleyin. Aynı tür yeni sürüm olarak saklanır." />
      {profile.advisorId ? (
        <DocumentUpload />
      ) : (
        <EmptyState
          title="Dosya yüklemek için danışman gerekli"
          description="Eşleşme tamamlandıktan sonra belge yükleyebilirsiniz."
          actionHref="/ogrenci/panel/danisman"
          actionLabel="Danışman Seç"
        />
      )}
      <div className="mt-6 space-y-3">
        {documents.length === 0 && <p className="text-sm text-muted-foreground">Henüz yüklenen dosya yok.</p>}
        {documents.map((doc) => (
          <Link key={doc.id} href={`/ogrenci/panel/dosyalar/${doc.id}`}>
            <Card className="mb-3 hover:bg-muted/40">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base">{doc.title}</CardTitle>
                <Badge variant="outline">{documentTypeLabel[doc.type]}</Badge>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                v{doc.currentVersion} · {documentStatusLabel[doc.versions[0]?.status ?? "INCELENIYOR"]}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
