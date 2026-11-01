import { randomBytes } from "crypto";
import { sendPasswordResetEmail } from "@/lib/mail";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/session";
import { forgotPasswordSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Geçersiz e-posta.", 422);
    }

    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email.toLowerCase() },
    });

    if (user) {
      const token = randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 1000 * 60 * 60);
      await prisma.user.update({
        where: { id: user.id },
        data: { resetToken: token, resetTokenExpiresAt: expires },
      });
      const origin = process.env.NEXTAUTH_URL || "http://localhost:3000";
      await sendPasswordResetEmail(user.email, `${origin}/sifre-sifirla?token=${token}`);
    }

    return Response.json({
      ok: true,
      message: "Eğer bu e-posta kayıtlıysa şifre sıfırlama bağlantısı gönderildi.",
    });
  } catch (error) {
    console.error(error);
    return jsonError("İşlem tamamlanamadı.", 500);
  }
}
