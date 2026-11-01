import { handleAuthError, jsonError, requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireRole("DANISMAN");
    const advisor = await prisma.advisorProfile.findUnique({ where: { userId: user.id } });
    if (!advisor) return jsonError("Profil yok", 403);
    const student = await prisma.studentProfile.findUnique({
      where: { id: params.id },
      include: { user: true, thesis: true },
    });
    if (!student || student.advisorId !== advisor.id) {
      return jsonError("Bu öğrencinin verisine erişemezsiniz.", 403);
    }
    return Response.json({ student });
  } catch (error) {
    return handleAuthError(error);
  }
}
