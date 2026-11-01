import { decidePreference, processExpiredPreferences } from "@/lib/preferences";
import { handleAuthError, jsonError, requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { preferenceDecisionSchema } from "@/lib/validations";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    await processExpiredPreferences();
    const user = await requireRole("DANISMAN");
    const advisor = await prisma.advisorProfile.findUnique({ where: { userId: user.id } });
    if (!advisor) return jsonError("Profil yok", 403);
    const body = await request.json();
    const parsed = preferenceDecisionSchema.safeParse(body);
    if (!parsed.success) return jsonError("Geçersiz karar.", 422);
    const result = await decidePreference({
      preferenceId: params.id,
      advisorId: advisor.id,
      decision: parsed.data.decision,
    });
    return Response.json({ ok: true, ...result });
  } catch (error) {
    if (error instanceof Error && error.message !== "UNAUTHENTICATED" && error.message !== "FORBIDDEN") {
      return jsonError(error.message);
    }
    return handleAuthError(error);
  }
}
