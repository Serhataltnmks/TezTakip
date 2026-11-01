import type { NotificationType } from "@/lib/enums";
import { prisma } from "./prisma";

export async function notify(input: {
  userId: string;
  type: NotificationType;
  message: string;
  link?: string;
}) {
  return prisma.notification.create({ data: input });
}

export async function notifyMany(
  userIds: string[],
  payload: { type: NotificationType; message: string; link?: string }
) {
  if (userIds.length === 0) return;
  await prisma.notification.createMany({
    data: userIds.map((userId) => ({ userId, ...payload })),
  });
}
