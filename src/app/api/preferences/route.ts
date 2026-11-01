import { handleAuthError, jsonError, requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { processExpiredPreferences, submitPreferences } from "@/lib/preferences";
import { preferenceSubmitSchema } from "@/lib/validations";

export async function GET() {
  try {
    await processExpiredPreferences();
    const user = await requireRole(["OGRENCI", "DANISMAN"]);

    if (user.role === "OGRENCI") {
      const student = await prisma.studentProfile.findUnique({ where: { userId: user.id } });
      if (!student) return jsonError("Profil yok", 403);
      const preferences = await prisma.advisorPreference.findMany({
        where: { studentId: student.id },
        include: { advisor: { include: { user: true } } },
        orderBy: { rank: "asc" },
      });
      return Response.json({ preferences });
    }

    const advisor = await prisma.advisorProfile.findUnique({ where: { userId: user.id } });
    if (!advisor) return jsonError("Profil yok", 403);
    const preferences = await prisma.advisorPreference.findMany({
      where: { advisorId: advisor.id, status: "BEKLIYOR", offeredAt: { not: null } },
      include: {
        student: { include: { user: true, department: true, thesis: true } },
      },
      orderBy: { offeredAt: "asc" },
    });
    return Response.json({ preferences });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function POST(request: Request) {
  try {
    await processExpiredPreferences();
    const user = await requireRole("OGRENCI");
    const student = await prisma.studentProfile.findUnique({ where: { userId: user.id } });
    if (!student) return jsonError("Profil yok", 403);
    const body = await request.json();
    const parsed = preferenceSubmitSchema.safeParse(body);
    if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Geçersiz tercih.", 422);
    const created = await submitPreferences({
      studentId: student.id,
      advisorIds: parsed.data.advisorIds,
      note: parsed.data.note,
    });
    return Response.json({ ok: true, preferences: created });
  } catch (error) {
    if (error instanceof Error && error.message !== "UNAUTHENTICATED" && error.message !== "FORBIDDEN") {
      return jsonError(error.message);
    }
    return handleAuthError(error);
  }
}
