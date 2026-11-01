import { canAccessThesis } from "@/lib/authorization";
import { notify } from "@/lib/notifications";
import { handleAuthError, jsonError, requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { documentStatusSchema } from "@/lib/validations";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser();
    const document = await prisma.document.findUnique({
      where: { id: params.id },
      include: {
        versions: {
          orderBy: { versionNo: "desc" },
          include: { comments: { include: { author: true }, orderBy: { createdAt: "asc" } } },
        },
        thesis: { include: { student: true } },
      },
    });
    if (!document) return jsonError("Belge bulunamadı.", 404);
    const access = await canAccessThesis(user, document.thesisId);
    if (!access.ok) return jsonError("Bu belgeye erişemezsiniz.", 403);
    return Response.json({ document });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser();
    if (user.role !== "DANISMAN" && user.role !== "YONETICI") {
      return jsonError("Durum yalnızca danışman veya yönetici tarafından güncellenir.", 403);
    }
    const body = await request.json();
    const versionId = body.versionId as string | undefined;
    const parsed = documentStatusSchema.safeParse(body);
    if (!parsed.success || !versionId) return jsonError("Geçersiz durum.", 422);

    const version = await prisma.documentVersion.findUnique({
      where: { id: versionId },
      include: { document: { include: { thesis: { include: { student: true } } } } },
    });
    if (!version || version.documentId !== params.id) return jsonError("Sürüm bulunamadı.", 404);

    const access = await canAccessThesis(user, version.document.thesisId);
    if (!access.ok) return jsonError("Yetkiniz yok.", 403);

    const updated = await prisma.documentVersion.update({
      where: { id: versionId },
      data: { status: parsed.data.status },
    });

    await notify({
      userId: version.document.thesis.student.userId,
      type: "DURUM_DEGISIKLIGI",
      message: `"${version.document.title}" v${version.versionNo} durumu güncellendi.`,
      link: `/ogrenci/panel/dosyalar/${version.documentId}`,
    });

    return Response.json({ version: updated });
  } catch (error) {
    return handleAuthError(error);
  }
}
