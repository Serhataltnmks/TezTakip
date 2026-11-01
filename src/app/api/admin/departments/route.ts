import { handleAuthError, jsonError, requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { departmentSchema } from "@/lib/validations";

export async function GET() {
  try {
    await requireRole("YONETICI");
    const departments = await prisma.department.findMany({ orderBy: { name: "asc" } });
    return Response.json({ departments });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireRole("YONETICI");
    const parsed = departmentSchema.safeParse(await request.json());
    if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Geçersiz bölüm.", 422);
    const department = await prisma.department.create({
      data: { name: parsed.data.name, code: parsed.data.code.toUpperCase() },
    });
    return Response.json({ department });
  } catch (error) {
    return handleAuthError(error);
  }
}
