import { canAccessThesis } from "@/lib/authorization";
import { handleAuthError, jsonError, requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { deadlineSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const user = await requireRole("DANISMAN");
    const body = await request.json();
    const parsed = deadlineSchema.safeParse(body);
    if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Geçersiz son tarih.", 422);
    const access = await canAccessThesis(user, parsed.data.thesisId);
    if (!access.ok) return jsonError("Bu öğrenci size bağlı değil.", 403);

    const deadline = await prisma.deadline.create({
      data: {
        thesisId: parsed.data.thesisId,
        title: parsed.data.title,
        dueDate: new Date(parsed.data.dueDate),
        documentType: parsed.data.documentType ?? null,
      },
    });
    return Response.json({ deadline });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await requireRole("DANISMAN");
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return jsonError("id gerekli.");
    const deadline = await prisma.deadline.findUnique({ where: { id } });
    if (!deadline) return jsonError("Kayıt yok.", 404);
    const access = await canAccessThesis(user, deadline.thesisId);
    if (!access.ok) return jsonError("Yetkiniz yok.", 403);
    await prisma.deadline.delete({ where: { id } });
    return Response.json({ ok: true });
  } catch (error) {
    return handleAuthError(error);
  }
}
