import { handleAuthError, requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getAdvisorAssignedCounts } from "@/lib/preferences";
import { remainingQuota } from "@/lib/preferences-logic";
import { toCsv } from "@/lib/utils";
import { stageLabel } from "@/lib/labels";

export async function GET(request: Request) {
  try {
    await requireRole("YONETICI");
    const format = new URL(request.url).searchParams.get("format");

    const advisors = await prisma.advisorProfile.findMany({
      where: { approvalStatus: "ONAYLANDI" },
      include: { user: true, department: true, students: true },
    });

    const occupancy = [];
    for (const advisor of advisors) {
      const counts = await getAdvisorAssignedCounts(advisor.id);
      occupancy.push({
        advisor: `${advisor.title} ${advisor.user.firstName} ${advisor.user.lastName}`,
        department: advisor.department.name,
        lisansAssigned: counts.assignedLisans,
        lisansQuota: advisor.quotaLisans,
        lisansRemaining: remainingQuota({ ...advisor, ...counts, level: "LISANS" }),
        ylAssigned: counts.assignedYL,
        ylQuota: advisor.quotaYL,
        ylRemaining: remainingQuota({ ...advisor, ...counts, level: "YUKSEK_LISANS" }),
      });
    }

    const theses = await prisma.thesis.findMany({ include: { student: true } });
    const byStage: Record<string, number> = {};
    for (const t of theses) {
      byStage[t.stage] = (byStage[t.stage] ?? 0) + 1;
    }

    const overdue = await prisma.deadline.findMany({
      where: { dueDate: { lt: new Date() } },
      include: {
        thesis: { include: { student: { include: { user: true, advisor: { include: { user: true } } } } } },
      },
      orderBy: { dueDate: "asc" },
    });

    const payload = {
      occupancy,
      byStage,
      overdue: overdue.map((d) => ({
        title: d.title,
        dueDate: d.dueDate,
        student: `${d.thesis.student.user.firstName} ${d.thesis.student.user.lastName}`,
        advisor: d.thesis.student.advisor
          ? `${d.thesis.student.advisor.title} ${d.thesis.student.advisor.user.firstName} ${d.thesis.student.advisor.user.lastName}`
          : "-",
      })),
    };

    if (format === "csv") {
      const rows = [
        ["Danışman", "Bölüm", "Lisans Dolu", "Lisans Kota", "YL Dolu", "YL Kota"],
        ...occupancy.map((o) => [
          o.advisor,
          o.department,
          String(o.lisansAssigned),
          String(o.lisansQuota),
          String(o.ylAssigned),
          String(o.ylQuota),
        ]),
        [],
        ["Aşama", "Öğrenci sayısı"],
        ...Object.entries(byStage).map(([k, v]) => [stageLabel[k as keyof typeof stageLabel] ?? k, String(v)]),
        [],
        ["Geciken teslim", "Son tarih", "Öğrenci", "Danışman"],
        ...payload.overdue.map((o) => [o.title, new Date(o.dueDate).toISOString(), o.student, o.advisor]),
      ];
      return new Response(toCsv(rows), {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": "attachment; filename=tez-takip-rapor.csv",
        },
      });
    }

    return Response.json(payload);
  } catch (error) {
    return handleAuthError(error);
  }
}
