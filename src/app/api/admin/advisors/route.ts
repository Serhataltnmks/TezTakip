import { handleAuthError, jsonError, requireRole } from "@/lib/session";
import { notify } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireRole("YONETICI");
    const advisors = await prisma.advisorProfile.findMany({
      include: { user: true, department: true, students: true },
      orderBy: { approvalStatus: "asc" },
    });
    return Response.json({ advisors });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    await requireRole("YONETICI");
    const body = await request.json();
    const { advisorId, approvalStatus, rejectionReason } = body as {
      advisorId?: string;
      approvalStatus?: "ONAYLANDI" | "REDDEDILDI" | "BEKLIYOR";
      rejectionReason?: string;
    };
    if (!advisorId || !approvalStatus) return jsonError("Eksik alan.");
    const advisor = await prisma.advisorProfile.update({
      where: { id: advisorId },
      data: { approvalStatus, rejectionReason: rejectionReason ?? null },
      include: { user: true },
    });
    await notify({
      userId: advisor.userId,
      type: "GENEL",
      message:
        approvalStatus === "ONAYLANDI"
          ? "Danışman hesabınız onaylandı. Panele giriş yapabilirsiniz."
          : approvalStatus === "REDDEDILDI"
            ? `Danışman kaydınız reddedildi. ${rejectionReason ?? ""}`
            : "Danışman hesabı durumu güncellendi.",
      link: approvalStatus === "ONAYLANDI" ? "/danisman/panel" : "/danisman/onay-bekliyor",
    });
    return Response.json({ advisor });
  } catch (error) {
    return handleAuthError(error);
  }
}
