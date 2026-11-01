import { compare, hash } from "bcryptjs";
import { handleAuthError, jsonError, requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { stringifyExpertise } from "@/lib/utils";
import { advisorProfileSchema, profilePasswordSchema, studentProfileSchema } from "@/lib/validations";

export async function PUT(request: Request) {
  try {
    const user = await requireUser();
    const body = await request.json();

    if (body.currentPassword) {
      const parsed = profilePasswordSchema.safeParse(body);
      if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Geçersiz şifre.", 422);
      const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
      if (!dbUser) return jsonError("Kullanıcı yok.", 404);
      const ok = await compare(parsed.data.currentPassword, dbUser.passwordHash);
      if (!ok) return jsonError("Mevcut şifre hatalı.");
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: await hash(parsed.data.password, 12) },
      });
      return Response.json({ ok: true });
    }

    if (user.role === "DANISMAN") {
      const parsed = advisorProfileSchema.safeParse(body);
      if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Geçersiz profil.", 422);
      await prisma.user.update({
        where: { id: user.id },
        data: {
          firstName: parsed.data.firstName,
          lastName: parsed.data.lastName,
          advisorProfile: {
            update: {
              title: parsed.data.title,
              expertise: stringifyExpertise(parsed.data.expertise.split(/[,;\n]/)),
              quotaLisans: parsed.data.quotaLisans,
              quotaYL: parsed.data.quotaYL,
              officeHours: parsed.data.officeHours,
            },
          },
        },
      });
      return Response.json({ ok: true });
    }

    const parsed = studentProfileSchema.safeParse(body);
    if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Geçersiz profil.", 422);
    await prisma.user.update({
      where: { id: user.id },
      data: { firstName: parsed.data.firstName, lastName: parsed.data.lastName },
    });
    return Response.json({ ok: true });
  } catch (error) {
    return handleAuthError(error);
  }
}
