import { handleAuthError, jsonError, requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { termSchema } from "@/lib/validations";

export async function GET() {
  try {
    await requireRole("YONETICI");
    const terms = await prisma.academicTerm.findMany({ orderBy: { startDate: "desc" } });
    return Response.json({ terms });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireRole("YONETICI");
    const parsed = termSchema.safeParse(await request.json());
    if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Geçersiz dönem.", 422);
    if (parsed.data.isActive) {
      await prisma.academicTerm.updateMany({ data: { isActive: false } });
    }
    const term = await prisma.academicTerm.create({
      data: {
        name: parsed.data.name,
        startDate: new Date(parsed.data.startDate),
        endDate: new Date(parsed.data.endDate),
        isActive: parsed.data.isActive ?? false,
      },
    });
    return Response.json({ term });
  } catch (error) {
    return handleAuthError(error);
  }
}
