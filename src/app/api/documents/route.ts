import { validateUploadFile } from "@/lib/file-validation";
import { notify } from "@/lib/notifications";
import { handleAuthError, jsonError, requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { storage } from "@/lib/storage";
import { documentMetaSchema } from "@/lib/validations";
import type { DocumentType } from "@/lib/enums";

export async function GET() {
  try {
    const user = await requireRole("OGRENCI");
    const student = await prisma.studentProfile.findUnique({
      where: { userId: user.id },
      include: {
        thesis: {
          include: {
            documents: {
              include: { versions: { orderBy: { versionNo: "desc" }, include: { comments: true } } },
              orderBy: { createdAt: "desc" },
            },
          },
        },
      },
    });
    return Response.json({ documents: student?.thesis?.documents ?? [] });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireRole("OGRENCI");
    const student = await prisma.studentProfile.findUnique({
      where: { userId: user.id },
      include: { thesis: true, advisor: true },
    });
    if (!student?.thesis) return jsonError("Tez kaydı yok.");
    if (!student.advisorId) return jsonError("Dosya yüklemek için önce danışman eşleşmesi gerekir.");

    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return jsonError("Dosya gerekli.");

    const meta = documentMetaSchema.safeParse({
      type: form.get("type"),
      title: form.get("title"),
      description: form.get("description") || undefined,
    });
    if (!meta.success) return jsonError(meta.error.issues[0]?.message ?? "Geçersiz form.", 422);

    const buffer = Buffer.from(await file.arrayBuffer());
    const validation = validateUploadFile({
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      buffer,
    });
    if (!validation.ok) return jsonError(validation.error, 422);

    const saved = await storage.save(buffer, file.name);
    const type = meta.data.type as DocumentType;

    const existing = await prisma.document.findFirst({
      where: { thesisId: student.thesis.id, type },
      include: { versions: { orderBy: { versionNo: "desc" }, take: 1 } },
    });

    let documentId: string;
    let versionNo = 1;

    if (existing) {
      versionNo = (existing.versions[0]?.versionNo ?? existing.currentVersion) + 1;
      await prisma.document.update({
        where: { id: existing.id },
        data: {
          title: meta.data.title,
          description: meta.data.description,
          currentVersion: versionNo,
        },
      });
      documentId = existing.id;
    } else {
      const created = await prisma.document.create({
        data: {
          thesisId: student.thesis.id,
          type,
          title: meta.data.title,
          description: meta.data.description,
          currentVersion: 1,
        },
      });
      documentId = created.id;
    }

    const version = await prisma.documentVersion.create({
      data: {
        documentId,
        versionNo,
        storedName: saved.storedName,
        originalName: file.name,
        mimeType: file.type || validation.mimeType,
        size: file.size,
        status: "INCELENIYOR",
      },
    });

    if (student.advisor) {
      await notify({
        userId: student.advisor.userId,
        type: "YENI_DOSYA",
        message: `${user.firstName} ${user.lastName} yeni bir dosya yükledi: ${meta.data.title} (v${versionNo})`,
        link: `/danisman/panel/inceleme`,
      });
    }

    return Response.json({ ok: true, version });
  } catch (error) {
    return handleAuthError(error);
  }
}
