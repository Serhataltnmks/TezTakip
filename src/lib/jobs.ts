import { addDays, isBefore, isAfter } from "date-fns";
import { DEADLINE_REMINDER_DAYS } from "./constants";
import { notify } from "./notifications";
import { prisma } from "./prisma";
import { processExpiredPreferences } from "./preferences";

export async function runMaintenanceJobs() {
  await processExpiredPreferences();
  await remindUpcomingDeadlines();
}

async function remindUpcomingDeadlines() {
  const now = new Date();
  const until = addDays(now, DEADLINE_REMINDER_DAYS);
  const deadlines = await prisma.deadline.findMany({
    where: {
      dueDate: { gte: now, lte: until },
    },
    include: {
      thesis: { include: { student: { include: { user: true, advisor: true } } } },
    },
  });

  for (const deadline of deadlines) {
    const already = await prisma.notification.findFirst({
      where: {
        userId: deadline.thesis.student.userId,
        type: "YAKLASAN_SON_TARIH",
        link: `/ogrenci/panel?deadline=${deadline.id}`,
      },
    });
    if (already) continue;

    await notify({
      userId: deadline.thesis.student.userId,
      type: "YAKLASAN_SON_TARIH",
      message: `"${deadline.title}" teslim tarihi yaklaşıyor.`,
      link: `/ogrenci/panel?deadline=${deadline.id}`,
    });

    if (deadline.thesis.student.advisor?.userId) {
      await notify({
        userId: deadline.thesis.student.advisor.userId,
        type: "YAKLASAN_SON_TARIH",
        message: `${deadline.thesis.student.user.firstName} ${deadline.thesis.student.user.lastName} için "${deadline.title}" teslimi yaklaşıyor.`,
        link: `/danisman/panel/ogrenciler/${deadline.thesis.studentId}`,
      });
    }
  }
}

export function deadlineState(dueDate: Date, now = new Date()) {
  if (isBefore(dueDate, now)) return "overdue" as const;
  if (isAfter(dueDate, addDays(now, DEADLINE_REMINDER_DAYS))) return "upcoming" as const;
  return "soon" as const;
}
