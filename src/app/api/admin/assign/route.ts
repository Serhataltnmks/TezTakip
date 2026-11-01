import { adminAssignAdvisor } from "@/lib/preferences";
import { handleAuthError, jsonError, requireRole } from "@/lib/session";
import { assignAdvisorSchema } from "@/lib/validations";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireRole("YONETICI");
    const [students, advisors] = await Promise.all([
      prisma.studentProfile.findMany({
        include: { user: true, department: true, advisor: { include: { user: true } } },
        orderBy: { studentNo: "asc" },
      }),
      prisma.advisorProfile.findMany({
        where: { approvalStatus: "ONAYLANDI" },
        include: { user: true, department: true },
      }),
    ]);
    return Response.json({ students, advisors });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireRole("YONETICI");
    const parsed = assignAdvisorSchema.safeParse(await request.json());
    if (!parsed.success) return jsonError("Geçersiz atama.", 422);
    await adminAssignAdvisor(parsed.data.studentId, parsed.data.advisorId);
    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message !== "UNAUTHENTICATED" && error.message !== "FORBIDDEN") {
      return jsonError(error.message);
    }
    return handleAuthError(error);
  }
}
