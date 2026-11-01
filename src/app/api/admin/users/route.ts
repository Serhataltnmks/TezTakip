import { handleAuthError, jsonError, requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireRole("YONETICI");
    const users = await prisma.user.findMany({
      include: { studentProfile: true, advisorProfile: true },
      orderBy: { createdAt: "desc" },
    });
    return Response.json({ users });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    await requireRole("YONETICI");
    const body = await request.json();
    if (!body.userId || typeof body.isActive !== "boolean") return jsonError("Eksik alan.");
    const user = await prisma.user.update({
      where: { id: body.userId },
      data: { isActive: body.isActive },
    });
    return Response.json({ user });
  } catch (error) {
    return handleAuthError(error);
  }
}
