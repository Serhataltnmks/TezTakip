import { PageHeader } from "@/components/page-header";
import { ThesisForm } from "@/components/student/thesis-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { stageLabel } from "@/lib/labels";
import { getStudentContext } from "@/lib/session";

export default async function ThesisPage() {
  const { profile } = await getStudentContext();
  const thesis = profile.thesis;

  return (
    <div>
      <PageHeader title="Tezim" description="Başlık, özet ve süreç aşamanız." />
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Mevcut aşama
            <Badge>{stageLabel[thesis?.stage ?? "DANISMAN_SECIMI"]}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {thesis?.revisionNote && (
            <p className="mb-3 text-sm text-destructive">Danışman notu: {thesis.revisionNote}</p>
          )}
          {!profile.advisorId ? (
            <p className="text-sm text-muted-foreground">
              Konu göndermek için önce bir danışmanla eşleşmelisiniz.
            </p>
          ) : (
            <ThesisForm
              title={thesis?.title ?? ""}
              abstract={thesis?.abstract ?? ""}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
