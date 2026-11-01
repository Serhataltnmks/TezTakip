import { PageHeader } from "@/components/page-header";
import { NotificationList } from "@/components/notifications/notification-list";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export default async function AdvisorNotificationsPage() {
  const user = await requireRole("DANISMAN");
  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return (
    <div>
      <PageHeader title="Bildirimler" />
      <NotificationList initial={notifications} />
    </div>
  );
}
