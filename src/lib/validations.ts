import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(8, "Şifre en az 8 karakter olmalı")
  .regex(/[A-Za-z]/, "Şifre en az bir harf içermeli")
  .regex(/[0-9]/, "Şifre en az bir rakam içermeli");

export const loginSchema = z.object({
  email: z.string().email("Geçerli bir e-posta girin"),
  password: z.string().min(1, "Şifre gerekli"),
  intendedRole: z.enum(["OGRENCI", "DANISMAN", "YONETICI"]),
});

export const studentRegisterSchema = z
  .object({
    firstName: z.string().min(2, "Ad en az 2 karakter olmalı"),
    lastName: z.string().min(2, "Soyad en az 2 karakter olmalı"),
    studentNo: z.string().min(3, "Öğrenci numarası gerekli"),
    email: z.string().email("Geçerli bir e-posta girin"),
    password: passwordSchema,
    confirmPassword: z.string(),
    level: z.enum(["LISANS", "YUKSEK_LISANS"]),
    departmentId: z.string().min(1, "Bölüm seçin"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Şifreler eşleşmiyor",
    path: ["confirmPassword"],
  });

export const advisorRegisterSchema = z
  .object({
    title: z.string().min(2, "Unvan seçin"),
    firstName: z.string().min(2, "Ad en az 2 karakter olmalı"),
    lastName: z.string().min(2, "Soyad en az 2 karakter olmalı"),
    email: z.string().email("Geçerli bir kurumsal e-posta girin"),
    password: passwordSchema,
    confirmPassword: z.string(),
    departmentId: z.string().min(1, "Bölüm seçin"),
    expertise: z.string().min(3, "En az bir uzmanlık alanı girin"),
    quotaLisans: z.coerce.number().int().min(0).max(50),
    quotaYL: z.coerce.number().int().min(0).max(50),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Şifreler eşleşmiyor",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email("Geçerli bir e-posta girin"),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(10),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Şifreler eşleşmiyor",
    path: ["confirmPassword"],
  });

export const preferenceSubmitSchema = z.object({
  advisorIds: z
    .array(z.string().min(1))
    .min(1, "En az bir danışman seçin")
    .max(3, "En fazla 3 danışman seçebilirsiniz"),
  note: z.string().max(1000).optional(),
});

export const preferenceDecisionSchema = z.object({
  decision: z.enum(["KABUL", "RED"]),
});

export const thesisUpdateSchema = z.object({
  title: z.string().min(8, "Tez başlığı en az 8 karakter olmalı"),
  abstract: z.string().min(20, "Özet en az 20 karakter olmalı"),
});

export const thesisStageSchema = z.object({
  stage: z.enum([
    "DANISMAN_SECIMI",
    "KONU_ONERISI",
    "KONU_ONAYI",
    "ARA_RAPOR",
    "TASLAK",
    "FINAL_TESLIM",
    "TAMAMLANDI",
  ]),
  revisionNote: z.string().optional(),
});

export const thesisReviewSchema = z.object({
  action: z.enum(["ONAY", "DUZELTME"]),
  revisionNote: z.string().optional(),
});

export const documentMetaSchema = z.object({
  type: z.enum(["TEZ_ONERISI", "ARA_RAPOR", "TEZ_TASLAGI", "FINAL_TEZ", "SUNUM", "DIGER"]),
  title: z.string().min(3, "Başlık gerekli"),
  description: z.string().max(2000).optional(),
});

export const documentStatusSchema = z.object({
  status: z.enum(["INCELENIYOR", "DUZELTME_GEREKLI", "ONAYLANDI"]),
});

export const commentSchema = z.object({
  documentVersionId: z.string().min(1),
  content: z.string().min(2, "Yorum çok kısa").max(4000),
});

export const deadlineSchema = z.object({
  thesisId: z.string().min(1),
  title: z.string().min(3),
  dueDate: z.string().min(1),
  documentType: z
    .enum(["TEZ_ONERISI", "ARA_RAPOR", "TEZ_TASLAGI", "FINAL_TEZ", "SUNUM", "DIGER"])
    .optional()
    .nullable(),
});

export const meetingSchema = z.object({
  thesisId: z.string().min(1),
  date: z.string().min(1),
  subject: z.string().min(3),
  notes: z.string().max(4000).optional(),
});

export const profilePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Şifreler eşleşmiyor",
    path: ["confirmPassword"],
  });

export const studentProfileSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
});

export const advisorProfileSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  title: z.string().min(2),
  expertise: z.string().min(3),
  quotaLisans: z.coerce.number().int().min(0).max(50),
  quotaYL: z.coerce.number().int().min(0).max(50),
  officeHours: z.string().max(500).optional(),
});

export const departmentSchema = z.object({
  name: z.string().min(3),
  code: z.string().min(2).max(12),
});

export const termSchema = z.object({
  name: z.string().min(3),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  isActive: z.boolean().optional(),
});

export const assignAdvisorSchema = z.object({
  studentId: z.string().min(1),
  advisorId: z.string().min(1),
});
