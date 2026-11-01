import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { PageHeader } from "@/components/page-header";
import { TermForm } from "@/components/admin/term-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export default async function TermsPage() {
  await requireRole("YONETICI");
  const terms = await prisma.academicTerm.findMany({ orderBy: { startDate: "desc" } });
  return (
    <div>
      <PageHeader title="Dönemler" />
      <div className="mb-4 space-y-2">
        {terms.map((t) => (
          <Card key={t.id}>
            <CardContent className="flex items-center justify-between p-4 text-sm">
              <span>
                {t.name} · {format(t.startDate, "d MMM yyyy", { locale: tr })} –{" "}
                {format(t.endDate, "d MMM yyyy", { locale: tr })}
              </span>
              {t.isActive && <Badge>Aktif</Badge>}
            </CardContent>
          </Card>
        ))}
      </div>
      <TermForm />
    </div>
  );
}
