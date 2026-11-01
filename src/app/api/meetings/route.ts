import { canAccessThesis } from "@/lib/authorization";
import { handleAuthError, jsonError, requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { meetingSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const user = await requireRole("DANISMAN");
    const body = await request.json();
    const parsed = meetingSchema.safeParse(body);
    if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Geçersiz görüşme.", 422);
    const access = await canAccessThesis(user, parsed.data.thesisId);
    if (!access.ok) return jsonError("Bu öğrenci size bağlı değil.", 403);

    const meeting = await prisma.meeting.create({
      data: {
        thesisId: parsed.data.thesisId,
        date: new Date(parsed.data.date),
        subject: parsed.data.subject,
        notes: parsed.data.notes,
      },
    });
    return Response.json({ meeting });
  } catch (error) {
    return handleAuthError(error);
  }
}
