import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/session";
import { studentRegisterSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = studentRegisterSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Geçersiz form.", 422);
    }

    const email = parsed.data.email.toLowerCase();
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return jsonError("Bu e-posta ile kayıtlı bir hesap var.");

    const studentNoExists = await prisma.studentProfile.findUnique({
      where: { studentNo: parsed.data.studentNo },
    });
    if (studentNoExists) return jsonError("Bu öğrenci numarası zaten kayıtlı.");

    const department = await prisma.department.findUnique({ where: { id: parsed.data.departmentId } });
    if (!department) return jsonError("Bölüm bulunamadı.");

    const passwordHash = await hash(parsed.data.password, 12);

    await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        role: "OGRENCI",
        studentProfile: {
          create: {
            studentNo: parsed.data.studentNo,
            level: parsed.data.level,
            departmentId: parsed.data.departmentId,
            thesis: { create: { stage: "DANISMAN_SECIMI" } },
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
