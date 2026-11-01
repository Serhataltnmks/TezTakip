import type { Role } from "@/lib/enums";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth-options";
import { prisma } from "./prisma";

export async function getSession() {
  return getServerSession(authOptions);
}

export async function requireUser() {
  const session = await getSession();
  if (!session?.user) {
    throw new Error("UNAUTHENTICATED");
  }
  return session.user;
}

export async function requireRole(roles: Role | Role[]) {
  const user = await requireUser();
  const allowed = Array.isArray(roles) ? roles : [roles];
  if (!allowed.includes(user.role)) {
    throw new Error("FORBIDDEN");
  }
  if (!user.isActive) {
    throw new Error("FORBIDDEN");
  }
  return user;
}

export async function getStudentContext() {
  const user = await requireRole("OGRENCI");
  const profile = await prisma.studentProfile.findUnique({
    where: { userId: user.id },
    include: {
      department: true,
      advisor: { include: { user: true, department: true } },
      thesis: true,
    },
  });
  if (!profile) throw new Error("FORBIDDEN");
  return { user, profile };
}

export async function getAdvisorContext() {
  const user = await requireRole("DANISMAN");
  const profile = await prisma.advisorProfile.findUnique({
    where: { userId: user.id },
    include: { department: true, user: true },
  });
  if (!profile) throw new Error("FORBIDDEN");
  return { user, profile };
}

export function jsonError(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

export function handleAuthError(error: unknown) {
  if (error instanceof Error) {
    if (error.message === "UNAUTHENTICATED") {
      return jsonError("Oturum açmanız gerekiyor.", 401);
    }
    if (error.message === "FORBIDDEN") {
      return jsonError("Bu işlem için yetkiniz yok.", 403);
    }
  }
  console.error(error);
  return jsonError("Beklenmeyen bir hata oluştu.", 500);
}
