import { handleAuthError, jsonError, requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const user = await requireRole("DANISMAN");
    const advisor = await prisma.advisorProfile.findUnique({ where: { userId: user.id } });
    if (!advisor) return jsonError("Profil yok", 403);
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") ?? "";
    const level = searchParams.get("level");
    const stage = searchParams.get("stage");

    const students = await prisma.studentProfile.findMany({
      where: {
        advisorId: advisor.id,
        ...(level === "LISANS" || level === "YUKSEK_LISANS" ? { level } : {}),
        ...(stage ? { thesis: { stage: stage as never } } : {}),
        ...(q
          ? {
              OR: [
                { studentNo: { contains: q } },
                { user: { firstName: { contains: q } } },
                { user: { lastName: { contains: q } } },
              ],
            }
          : {}),
      },
      include: {
        user: true,
        department: true,
        thesis: {
          include: {
            documents: { include: { versions: { orderBy: { versionNo: "desc" } } } },
            deadlines: true,
            meetings: { orderBy: { date: "desc" } },
          },
        },
      },
      orderBy: { user: { lastName: "asc" } },
    });

    return Response.json({ students });
  } catch (error) {
    return handleAuthError(error);
  }
}
