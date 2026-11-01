import { canAccessDocumentVersion } from "@/lib/authorization";
import { notify } from "@/lib/notifications";
import { handleAuthError, jsonError, requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { commentSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const parsed = commentSchema.safeParse(body);
    if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Geçersiz yorum.", 422);

    const access = await canAccessDocumentVersion(user, parsed.data.documentVersionId);
    if (!access.ok || !access.version) return jsonError("Bu belgeye yorum yazamazsınız.", 403);

    const comment = await prisma.comment.create({
      data: {
        documentVersionId: parsed.data.documentVersionId,
        authorId: user.id,
        content: parsed.data.content,
      },
      include: { author: true },
    });

    const thesis = access.version.document.thesis;
    const studentUserId = thesis.student.userId;
    const advisor = await prisma.advisorProfile.findUnique({
      where: { id: thesis.student.advisorId ?? "" },
    });
    const recipients = [studentUserId, advisor?.userId].filter(
      (id): id is string => Boolean(id) && id !== user.id
    );
    for (const userId of recipients) {
      await notify({
        userId,
        type: "YENI_YORUM",
        message: `${user.firstName} ${user.lastName} bir yoruma yazdı.`,
        link:
          user.role === "OGRENCI"
            ? `/danisman/panel/ogrenciler/${thesis.studentId}`
            : `/ogrenci/panel/dosyalar/${access.version.documentId}`,
      });
    }

    return Response.json({ comment });
  } catch (error) {
    return handleAuthError(error);
  }
}
