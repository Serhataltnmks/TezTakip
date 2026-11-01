import { handleAuthError, jsonError, requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await requireRole("DANISMAN");
    const advisor = await prisma.advisorProfile.findUnique({ where: { userId: user.id } });
    if (!advisor) return jsonError("Profil yok", 403);

    const versions = await prisma.documentVersion.findMany({
      where: {
        status: "INCELENIYOR",
        document: { thesis: { student: { advisorId: advisor.id } } },
      },
      include: {
        document: {
          include: {
            thesis: { include: { student: { include: { user: true } } } },
          },
        },
      },
      orderBy: { uploadedAt: "asc" },
    });

    return Response.json({ versions });
  } catch (error) {
    return handleAuthError(error);
  }
}
