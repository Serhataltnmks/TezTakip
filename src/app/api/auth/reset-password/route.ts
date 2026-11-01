import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/session";
import { resetPasswordSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Geçersiz form.", 422);
    }

    const user = await prisma.user.findFirst({
      where: {
        resetToken: parsed.data.token,
        resetTokenExpiresAt: { gt: new Date() },
      },
    });

    if (!user) return jsonError("Bağlantı geçersiz veya süresi dolmuş.");

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: await hash(parsed.data.password, 12),
        resetToken: null,
        resetTokenExpiresAt: null,
      },
    });

    return Response.json({ ok: true });
  } catch (error) {
    console.error(error);
    return jsonError("Şifre güncellenemedi.", 500);
  }
}
