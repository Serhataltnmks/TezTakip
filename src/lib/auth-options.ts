import { compare } from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import type { ApprovalStatus, Role } from "@/lib/enums";
import { prisma } from "./prisma";
import { rateLimit } from "./rate-limit";
import { loginSchema } from "./validations";

const roleMismatchMessage: Record<string, string> = {
  OGRENCI: "Bu giriş sayfası öğrenciler içindir. Danışman veya yönetici hesabıyla buradan giriş yapamazsınız.",
  DANISMAN: "Bu giriş sayfası danışmanlar içindir. Öğrenci veya yönetici hesabıyla buradan giriş yapamazsınız.",
  YONETICI: "Bu giriş sayfası yöneticiler içindir. Öğrenci veya danışman hesabıyla buradan giriş yapamazsınız.",
};

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
  pages: {
    signIn: "/",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "E-posta", type: "email" },
        password: { label: "Şifre", type: "password" },
        intendedRole: { label: "Rol", type: "text" },
      },
      async authorize(credentials, request) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          throw new Error("Geçersiz giriş bilgileri.");
        }

        const ip =
          (request as { headers?: { get?: (k: string) => string | null } })?.headers?.get?.(
            "x-forwarded-for"
          ) ?? parsed.data.email;

        const limited = rateLimit(`login:${ip}:${parsed.data.email.toLowerCase()}`);
        if (!limited.success) {
          throw new Error("Çok fazla deneme yaptınız. Lütfen bir dakika bekleyin.");
        }

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email.toLowerCase() },
          include: { advisorProfile: true, studentProfile: true },
        });

        if (!user) {
          throw new Error("E-posta veya şifre hatalı.");
        }

        const ok = await compare(parsed.data.password, user.passwordHash);
        if (!ok) {
          throw new Error("E-posta veya şifre hatalı.");
        }

        if (!user.isActive) {
          throw new Error("Hesabınız pasif durumdadır. Yönetici ile iletişime geçin.");
        }

        if (user.role !== parsed.data.intendedRole) {
          throw new Error(roleMismatchMessage[parsed.data.intendedRole] ?? "Bu sayfadan giriş yapamazsınız.");
        }

        return {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role as Role,
          isActive: user.isActive,
          approvalStatus: (user.advisorProfile?.approvalStatus as ApprovalStatus | undefined) ?? null,
          studentProfileId: user.studentProfile?.id ?? null,
          advisorProfileId: user.advisorProfile?.id ?? null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = user.role;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.isActive = user.isActive;
        token.approvalStatus = user.approvalStatus ?? null;
        token.studentProfileId = user.studentProfileId ?? null;
        token.advisorProfileId = user.advisorProfileId ?? null;
      }

      if (trigger === "update" && token.id) {
        const fresh = await prisma.user.findUnique({
          where: { id: token.id },
          include: { advisorProfile: true, studentProfile: true },
        });
        if (fresh) {
          token.role = fresh.role as Role;
          token.firstName = fresh.firstName;
          token.lastName = fresh.lastName;
          token.isActive = fresh.isActive;
          token.approvalStatus = (fresh.advisorProfile?.approvalStatus as ApprovalStatus | undefined) ?? null;
          token.studentProfileId = fresh.studentProfile?.id ?? null;
          token.advisorProfileId = fresh.advisorProfile?.id ?? null;
        }
      }

      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id,
        email: token.email ?? session.user?.email ?? "",
        name: `${token.firstName} ${token.lastName}`,
        firstName: token.firstName,
        lastName: token.lastName,
        role: token.role,
        isActive: token.isActive,
        approvalStatus: token.approvalStatus,
        studentProfileId: token.studentProfileId,
        advisorProfileId: token.advisorProfileId,
      };
      return session;
    },
  },
};
