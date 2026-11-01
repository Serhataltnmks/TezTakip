import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/session";
import { stringifyExpertise } from "@/lib/utils";
import { advisorRegisterSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = advisorRegisterSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Geçersiz form.", 422);
    }

    const email = parsed.data.email.toLowerCase();
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return jsonError("Bu e-posta ile kayıtlı bir hesap var.");

    const department = await prisma.department.findUnique({ where: { id: parsed.data.departmentId } });
    if (!department) return jsonError("Bölüm bulunamadı.");

    const passwordHash = await hash(parsed.data.password, 12);
    const expertise = stringifyExpertise(
      parsed.data.expertise.split(/[,;\n]/).map((s) => s.trim()).filter(Boolean)
    );

    await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        role: "DANISMAN",
        advisorProfile: {
          create: {
            title: parsed.data.title,
            departmentId: parsed.data.departmentId,
            expertise,
            quotaLisans: parsed.data.quotaLisans,
            quotaYL: parsed.data.quotaYL,
            approvalStatus: "BEKLIYOR",
          },
        },
      },
    });

    return Response.json({ ok: true });
  } catch (error) {
    console.error(error);
    return jsonError("Kayıt sırasında bir hata oluştu.", 500);
  }
}
