import { remainingQuota } from "@/lib/preferences-logic";
import { getAdvisorAssignedCounts } from "@/lib/preferences";
import { handleAuthError, requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { parseExpertise } from "@/lib/utils";

export async function GET(request: Request) {
  try {
    const user = await requireRole("OGRENCI");
    const student = await prisma.studentProfile.findUnique({ where: { userId: user.id } });
    if (!student) return Response.json({ error: "Profil yok" }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") ?? "").toLowerCase();
    const expertise = (searchParams.get("expertise") ?? "").toLowerCase();

    const advisors = await prisma.advisorProfile.findMany({
      where: {
        departmentId: student.departmentId,
        approvalStatus: "ONAYLANDI",
        user: { isActive: true },
      },
      include: { user: true, department: true },
    });

    const result = [];
    for (const advisor of advisors) {
      const counts = await getAdvisorAssignedCounts(advisor.id);
      const remaining = remainingQuota({
        quotaLisans: advisor.quotaLisans,
        quotaYL: advisor.quotaYL,
        assignedLisans: counts.assignedLisans,
        assignedYL: counts.assignedYL,
        level: student.level,
      });
      if (remaining <= 0) continue;

      const areas = parseExpertise(advisor.expertise);
      const hay = `${advisor.title} ${advisor.user.firstName} ${advisor.user.lastName} ${areas.join(" ")}`.toLowerCase();
      if (q && !hay.includes(q)) continue;
      if (expertise && !areas.some((a) => a.toLowerCase().includes(expertise))) continue;

      result.push({
        id: advisor.id,
        title: advisor.title,
        firstName: advisor.user.firstName,
        lastName: advisor.user.lastName,
        email: advisor.user.email,
        expertise: areas,
        officeHours: advisor.officeHours,
        remainingQuota: remaining,
        quotaLisans: advisor.quotaLisans,
        quotaYL: advisor.quotaYL,
      });
    }

    return Response.json({ advisors: result });
  } catch (error) {
    return handleAuthError(error);
  }
}
