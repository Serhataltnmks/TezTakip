import { handleAuthError, requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { runMaintenanceJobs } from "@/lib/jobs";

export async function GET(request: Request) {
  try {
    const user = await requireUser();
    await runMaintenanceJobs();
    const unreadOnly = new URL(request.url).searchParams.get("unread") === "1";
    const notifications = await prisma.notification.findMany({
      where: { userId: user.id, ...(unreadOnly ? { isRead: false } : {}) },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    const unreadCount = await prisma.notification.count({
      where: { userId: user.id, isRead: false },
    });
    return Response.json({ notifications, unreadCount });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireUser();
    const body = await request.json().catch(() => ({}));
    if (body.id) {
      await prisma.notification.updateMany({
        where: { id: body.id, userId: user.id },
        data: { isRead: true },
      });
    } else {
      await prisma.notification.updateMany({
        where: { userId: user.id, isRead: false },
        data: { isRead: true },
      });
    }
    return Response.json({ ok: true });
  } catch (error) {
    return handleAuthError(error);
  }
}
