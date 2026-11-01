import { notify } from "@/lib/notifications";
import { handleAuthError, jsonError, requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { thesisReviewSchema, thesisStageSchema, thesisUpdateSchema } from "@/lib/validations";

export async function GET() {
  try {
    const user = await requireRole("OGRENCI");
    const student = await prisma.studentProfile.findUnique({
      where: { userId: user.id },
      include: { thesis: true },
    });
    return Response.json({ thesis: student?.thesis ?? null });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireRole("OGRENCI");
    const student = await prisma.studentProfile.findUnique({
      where: { userId: user.id },
      include: { thesis: true, advisor: true },
    });
    if (!student?.thesis) return jsonError("Tez kaydı yok.", 404);
    if (!student.advisorId) return jsonError("Önce bir danışmanla eşleşmelisiniz.");

    const body = await request.json();
    const parsed = thesisUpdateSchema.safeParse(body);
    if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Geçersiz veri.", 422);

    const thesis = await prisma.thesis.update({
      where: { id: student.thesis.id },
      data: {
        title: parsed.data.title,
        abstract: parsed.data.abstract,
        titleSubmittedAt: new Date(),
        stage: student.thesis.stage === "DANISMAN_SECIMI" ? "KONU_ONERISI" : student.thesis.stage,
        revisionNote: null,
      },
    });

    if (student.advisor) {
      await notify({
        userId: student.advisor.userId,
        type: "DURUM_DEGISIKLIGI",
        message: `${user.firstName} ${user.lastName} tez konusu önerisi gönderdi.`,
        link: `/danisman/panel/ogrenciler/${student.id}`,
      });
    }

    return Response.json({ thesis });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireRole("DANISMAN");
    const advisor = await prisma.advisorProfile.findUnique({ where: { userId: user.id } });
    if (!advisor) return jsonError("Profil yok", 403);
    const body = await request.json();
    const thesisId = body.thesisId as string | undefined;
    if (!thesisId) return jsonError("thesisId gerekli.");

    const thesis = await prisma.thesis.findUnique({
      where: { id: thesisId },
      include: { student: true },
    });
    if (!thesis || thesis.student.advisorId !== advisor.id) {
      return jsonError("Bu teze erişemezsiniz.", 403);
    }

    if (body.action) {
      const parsed = thesisReviewSchema.safeParse(body);
      if (!parsed.success) return jsonError("Geçersiz işlem.", 422);
      const updated = await prisma.thesis.update({
        where: { id: thesisId },
        data:
          parsed.data.action === "ONAY"
            ? { stage: "KONU_ONAYI", revisionNote: null }
            : { stage: "KONU_ONERISI", revisionNote: parsed.data.revisionNote ?? "Düzeltme isteniyor." },
      });
      await notify({
        userId: thesis.student.userId,
        type: "DURUM_DEGISIKLIGI",
        message:
          parsed.data.action === "ONAY"
            ? "Tez konunuz onaylandı."
            : `Tez konunuz için düzeltme istendi: ${updated.revisionNote}`,
        link: "/ogrenci/panel/tezim",
      });
      return Response.json({ thesis: updated });
    }

    const parsed = thesisStageSchema.safeParse(body);
    if (!parsed.success) return jsonError("Geçersiz aşama.", 422);
    const updated = await prisma.thesis.update({
      where: { id: thesisId },
      data: { stage: parsed.data.stage, revisionNote: parsed.data.revisionNote },
    });
    await notify({
      userId: thesis.student.userId,
      type: "DURUM_DEGISIKLIGI",
      message: "Tez aşamanız güncellendi.",
      link: "/ogrenci/panel/tezim",
    });
    return Response.json({ thesis: updated });
  } catch (error) {
    return handleAuthError(error);
  }
}
