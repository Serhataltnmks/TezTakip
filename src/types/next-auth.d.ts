import type { ApprovalStatus, Role } from "@/lib/enums";
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      firstName: string;
      lastName: string;
      role: Role;
      isActive: boolean;
      approvalStatus?: ApprovalStatus | null;
      studentProfileId?: string | null;
      advisorProfileId?: string | null;
    };
  }

  interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: Role;
    isActive: boolean;
    approvalStatus?: ApprovalStatus | null;
    studentProfileId?: string | null;
    advisorProfileId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    firstName: string;
    lastName: string;
    isActive: boolean;
    approvalStatus?: ApprovalStatus | null;
    studentProfileId?: string | null;
    advisorProfileId?: string | null;
  }
}
