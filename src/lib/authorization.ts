import type { Role } from "@/lib/enums";
import { prisma } from "./prisma";

export type AccessUser = {
  id: string;
  role: Role;
};

export async function canAccessThesis(user: AccessUser, thesisId: string) {
  const thesis = await prisma.thesis.findUnique({
    where: { id: thesisId },
    include: {
      student: { include: { advisor: true } },
    },
  });
  if (!thesis) return { ok: false as const, thesis: null };

  if (user.role === "YONETICI") return { ok: true as const, thesis };
  if (user.role === "OGRENCI") {
    const student = await prisma.studentProfile.findUnique({ where: { userId: user.id } });
    return { ok: student?.id === thesis.studentId, thesis };
  }
  if (user.role === "DANISMAN") {
    const advisor = await prisma.advisorProfile.findUnique({ where: { userId: user.id } });
    return { ok: thesis.student.advisorId === advisor?.id, thesis };
  }
  return { ok: false as const, thesis };
}

export async function canAccessDocumentVersion(user: AccessUser, versionId: string) {
  const version = await prisma.documentVersion.findUnique({
    where: { id: versionId },
    include: {
      document: {
        include: {
          thesis: { include: { student: true } },
        },
      },
    },
  });
  if (!version) return { ok: false as const, version: null };
  const access = await canAccessThesis(user, version.document.thesisId);
  return { ok: access.ok, version };
}

export function studentHomePath() {
  return "/ogrenci/panel";
}

export function advisorHomePath(approvalStatus?: string | null) {
  if (approvalStatus && approvalStatus !== "ONAYLANDI") {
    return "/danisman/onay-bekliyor";
  }
  return "/danisman/panel";
}

export function adminHomePath() {
  return "/yonetici/panel";
}

export function homePathFor(role: Role, approvalStatus?: string | null) {
  if (role === "OGRENCI") return studentHomePath();
  if (role === "DANISMAN") return advisorHomePath(approvalStatus);
  return adminHomePath();
}
