import type { ProgramLevel } from "@/lib/enums";
import { prisma } from "./prisma";
import { notify } from "./notifications";
import {
  getActivePreference,
  getNextQueuedPreference,
  hasAvailableQuota,
  isPreferenceExpired,
} from "./preferences-logic";

export async function getAdvisorAssignedCounts(advisorId: string) {
  const [assignedLisans, assignedYL] = await Promise.all([
    prisma.studentProfile.count({ where: { advisorId, level: "LISANS" } }),
    prisma.studentProfile.count({ where: { advisorId, level: "YUKSEK_LISANS" } }),
  ]);
  return { assignedLisans, assignedYL };
}

export async function advisorHasQuota(advisorId: string, level: ProgramLevel | string) {
  const advisor = await prisma.advisorProfile.findUnique({ where: { id: advisorId } });
  if (!advisor || advisor.approvalStatus !== "ONAYLANDI") return false;
  const counts = await getAdvisorAssignedCounts(advisorId);
  return hasAvailableQuota({
    quotaLisans: advisor.quotaLisans,
    quotaYL: advisor.quotaYL,
    assignedLisans: counts.assignedLisans,
    assignedYL: counts.assignedYL,
    level,
  });
}

async function activateNext(studentId: string, afterRank: number) {
  const remaining = await prisma.advisorPreference.findMany({
    where: { studentId },
    include: { advisor: { include: { user: true } }, student: { include: { user: true } } },
  });
  const next = getNextQueuedPreference(remaining, afterRank);
  if (!next) {
    await notify({
      userId: remaining[0]?.student.userId ?? "",
      type: "TERCIH_SONUCU",
      message: "Tüm danışman tercihleriniz sonuçlandı ancak eşleşme oluşmadı. Yeni tercih yapabilirsiniz.",
      link: "/ogrenci/panel/danisman",
    });
    return null;
  }

  const quotaOk = await advisorHasQuota(next.advisorId, next.student.level);
  if (!quotaOk) {
    await prisma.advisorPreference.update({
      where: { id: next.id },
      data: { status: "IPTAL", respondedAt: new Date() },
    });
    return activateNext(studentId, next.rank);
  }

  await prisma.advisorPreference.update({
    where: { id: next.id },
    data: { offeredAt: new Date(), status: "BEKLIYOR" },
  });

  await notify({
    userId: next.advisor.userId,
    type: "YENI_TERCIH",
    message: `${next.student.user.firstName} ${next.student.user.lastName} sizi ${next.rank}. sırada danışman olarak tercih etti.`,
    link: "/danisman/panel/tercihler",
  });

  return next;
}

export async function processExpiredPreferences(now = new Date()) {
  const pending = await prisma.advisorPreference.findMany({
    where: { status: "BEKLIYOR", offeredAt: { not: null } },
    include: { student: { include: { user: true } }, advisor: { include: { user: true } } },
  });

  for (const pref of pending) {
    if (!isPreferenceExpired(pref.offeredAt, now)) continue;

    await prisma.advisorPreference.update({
      where: { id: pref.id },
      data: { status: "SURESI_DOLDU", respondedAt: now },
    });

    await notify({
      userId: pref.student.userId,
      type: "TERCIH_SONUCU",
      message: `${pref.advisor.title} ${pref.advisor.user.firstName} ${pref.advisor.user.lastName} 7 gün içinde yanıt vermedi. Tercihiniz sıradaki danışmana iletildi.`,
      link: "/ogrenci/panel/danisman",
    });

    await activateNext(pref.studentId, pref.rank);
  }
}

export async function submitPreferences(input: {
  studentId: string;
  advisorIds: string[];
  note?: string;
}) {
  const student = await prisma.studentProfile.findUnique({
    where: { id: input.studentId },
    include: { user: true, preferences: true, thesis: true },
  });
  if (!student) throw new Error("Öğrenci bulunamadı.");
  if (student.advisorId) throw new Error("Zaten bir danışmanınız atanmış.");

  const blocking = student.preferences.some(
    (p) => p.status === "BEKLIYOR" || p.status === "KABUL"
  );
  if (blocking) {
    throw new Error("Aktif bir tercih süreciniz varken yeni tercih gönderemezsiniz.");
  }

  if (new Set(input.advisorIds).size !== input.advisorIds.length) {
    throw new Error("Aynı danışmanı birden fazla kez seçemezsiniz.");
  }

  const advisors = await prisma.advisorProfile.findMany({
    where: { id: { in: input.advisorIds } },
    include: { user: true },
  });

  if (advisors.length !== input.advisorIds.length) {
    throw new Error("Seçilen danışmanlardan bazıları bulunamadı.");
  }

  for (const advisorId of input.advisorIds) {
    const advisor = advisors.find((a) => a.id === advisorId)!;
    if (advisor.approvalStatus !== "ONAYLANDI") {
      throw new Error("Yalnızca onaylı danışmanlar seçilebilir.");
    }
    if (advisor.departmentId !== student.departmentId) {
      throw new Error("Yalnızca kendi bölümünüzdeki danışmanları seçebilirsiniz.");
    }
    const ok = await advisorHasQuota(advisor.id, student.level);
    if (!ok) {
      throw new Error(`${advisor.title} ${advisor.user.firstName} ${advisor.user.lastName} için kontenjan kalmamış.`);
    }
  }

  const created = await prisma.$transaction(
    input.advisorIds.map((advisorId, index) =>
      prisma.advisorPreference.create({
        data: {
          studentId: student.id,
          advisorId,
          rank: index + 1,
          note: input.note,
          status: "BEKLIYOR",
          offeredAt: index === 0 ? new Date() : null,
        },
      })
    )
  );

  const firstAdvisor = advisors.find((a) => a.id === input.advisorIds[0])!;
  await notify({
    userId: firstAdvisor.userId,
    type: "YENI_TERCIH",
    message: `${student.user.firstName} ${student.user.lastName} sizi 1. sırada danışman olarak tercih etti.`,
    link: "/danisman/panel/tercihler",
  });

  return created;
}

export async function decidePreference(input: {
  preferenceId: string;
  advisorId: string;
  decision: "KABUL" | "RED";
}) {
  const preference = await prisma.advisorPreference.findUnique({
    where: { id: input.preferenceId },
    include: {
      student: { include: { user: true, thesis: true } },
      advisor: { include: { user: true } },
    },
  });

  if (!preference || preference.advisorId !== input.advisorId) {
    throw new Error("Tercih bulunamadı.");
  }

  const active = getActivePreference([preference]);
  if (preference.status !== "BEKLIYOR" || !preference.offeredAt || !active) {
    throw new Error("Bu tercih şu anda yanıtlanamaz.");
  }

  if (input.decision === "KABUL") {
    const quotaOk = await advisorHasQuota(preference.advisorId, preference.student.level);
    if (!quotaOk) {
      throw new Error("Kontenjanınız dolduğu için bu öğrenciyi kabul edemezsiniz.");
    }

    await prisma.$transaction([
      prisma.advisorPreference.update({
        where: { id: preference.id },
        data: { status: "KABUL", respondedAt: new Date() },
      }),
      prisma.advisorPreference.updateMany({
        where: { studentId: preference.studentId, id: { not: preference.id } },
        data: { status: "IPTAL", respondedAt: new Date() },
      }),
      prisma.studentProfile.update({
        where: { id: preference.studentId },
        data: { advisorId: preference.advisorId },
      }),
      prisma.thesis.update({
        where: { studentId: preference.studentId },
        data: { stage: "KONU_ONERISI" },
      }),
    ]);

    await notify({
      userId: preference.student.userId,
      type: "TERCIH_SONUCU",
      message: `${preference.advisor.title} ${preference.advisor.user.firstName} ${preference.advisor.user.lastName} danışmanlık tercihinizi kabul etti.`,
      link: "/ogrenci/panel/danisman",
    });

    return { matched: true };
  }

  await prisma.advisorPreference.update({
    where: { id: preference.id },
    data: { status: "RED", respondedAt: new Date() },
  });

  await notify({
    userId: preference.student.userId,
    type: "TERCIH_SONUCU",
    message: `${preference.advisor.title} ${preference.advisor.user.firstName} ${preference.advisor.user.lastName} danışmanlık tercihinizi reddetti. Sıradaki danışmana iletildi.`,
    link: "/ogrenci/panel/danisman",
  });

  await activateNext(preference.studentId, preference.rank);
  return { matched: false };
}

export async function adminAssignAdvisor(studentId: string, advisorId: string) {
  const student = await prisma.studentProfile.findUnique({
    where: { id: studentId },
    include: { user: true, thesis: true },
  });
  const advisor = await prisma.advisorProfile.findUnique({
    where: { id: advisorId },
    include: { user: true },
  });
  if (!student || !advisor) throw new Error("Öğrenci veya danışman bulunamadı.");
  if (advisor.approvalStatus !== "ONAYLANDI") {
    throw new Error("Yalnızca onaylı danışman atanabilir.");
  }
  if (student.departmentId !== advisor.departmentId) {
    throw new Error("Danışman öğrencinin bölümünde olmalıdır.");
  }
  const quotaOk = await advisorHasQuota(advisorId, student.level);
  if (!quotaOk && student.advisorId !== advisorId) {
    throw new Error("Danışmanın ilgili program kontenjanı dolu.");
  }

  await prisma.$transaction([
    prisma.advisorPreference.updateMany({
      where: { studentId, status: "BEKLIYOR" },
      data: { status: "IPTAL", respondedAt: new Date() },
    }),
    prisma.studentProfile.update({
      where: { id: studentId },
      data: { advisorId },
    }),
    prisma.thesis.update({
      where: { studentId },
      data: {
        stage:
          !student.thesis || student.thesis.stage === "DANISMAN_SECIMI"
            ? "KONU_ONERISI"
            : student.thesis.stage,
      },
    }),
  ]);

  await notify({
    userId: student.userId,
    type: "GENEL",
    message: `Yönetici sizi ${advisor.title} ${advisor.user.firstName} ${advisor.user.lastName} ile eşleştirdi.`,
    link: "/ogrenci/panel/danisman",
  });
  await notify({
    userId: advisor.userId,
    type: "GENEL",
    message: `Yönetici ${student.user.firstName} ${student.user.lastName} adlı öğrenciyi size atadı.`,
    link: "/danisman/panel/ogrenciler",
  });
}
