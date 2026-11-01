import { PageHeader } from "@/components/page-header";
import { DepartmentForm } from "@/components/admin/department-form";
import { Card, CardContent } from "@/components/ui/card";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export default async function DepartmentsPage() {
  await requireRole("YONETICI");
  const departments = await prisma.department.findMany({ orderBy: { name: "asc" } });
  return (
    <div>
      <PageHeader title="Bölümler" />
      <div className="mb-4 space-y-2">
        {departments.map((d) => (
          <Card key={d.id}>
            <CardContent className="p-4 text-sm">
              <strong>{d.code}</strong> — {d.name}
            </CardContent>
          </Card>
        ))}
      </div>
      <DepartmentForm />
    </div>
  );
}
