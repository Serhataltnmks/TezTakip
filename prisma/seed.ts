import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();
const PASSWORD = "Sifre123";

async function main() {
  await prisma.notification.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.documentVersion.deleteMany();
  await prisma.document.deleteMany();
  await prisma.deadline.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.advisorPreference.deleteMany();
  await prisma.thesis.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.advisorProfile.deleteMany();
  await prisma.academicTerm.deleteMany();
  await prisma.department.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await hash(PASSWORD, 12);
  const uploadDir = path.resolve(process.env.UPLOAD_DIR || "./uploads");
  await mkdir(uploadDir, { recursive: true });

  const ceng = await prisma.department.create({
    data: { name: "Bilgisayar Mühendisliği", code: "CENG" },
  });
  const ee = await prisma.department.create({
    data: { name: "Elektrik-Elektronik Mühendisliği", code: "EE" },
  });

  await prisma.academicTerm.create({
    data: {
      name: "2025-2026 Güz",
      isActive: true,
      startDate: new Date("2025-09-15"),
      endDate: new Date("2026-01-16"),
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: "admin@teztakip.edu.tr",
      passwordHash,
      firstName: "Ayşe",
      lastName: "Yönetici",
      role: "YONETICI",
    },
  });

  async function advisor(input: {
    email: string;
    firstName: string;
    lastName: string;
    title: string;
    departmentId: string;
    expertise: string[];
    quotaLisans: number;
    quotaYL: number;
    officeHours: string;
    approvalStatus: "ONAYLANDI" | "BEKLIYOR";
  }) {
    return prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
        role: "DANISMAN",
        advisorProfile: {
          create: {
            title: input.title,
            departmentId: input.departmentId,
            expertise: JSON.stringify(input.expertise),
            quotaLisans: input.quotaLisans,
            quotaYL: input.quotaYL,
            officeHours: input.officeHours,
            approvalStatus: input.approvalStatus,
          },
        },
      },
      include: { advisorProfile: true },
    });
  }

  const d1 = await advisor({
    email: "danisman1@teztakip.edu.tr",
    firstName: "Mehmet",
    lastName: "Kaya",
    title: "Prof. Dr.",
    departmentId: ceng.id,
    expertise: ["Yapay zeka", "Makine öğrenmesi"],
    quotaLisans: 4,
    quotaYL: 3,
    officeHours: "Salı 13:00-15:00, A-214",
    approvalStatus: "ONAYLANDI",
  });
  const d2 = await advisor({
    email: "danisman2@teztakip.edu.tr",
    firstName: "Elif",
    lastName: "Demir",
    title: "Doç. Dr.",
    departmentId: ceng.id,
    expertise: ["Veri tabanı", "Büyük veri"],
    quotaLisans: 3,
    quotaYL: 2,
    officeHours: "Çarşamba 10:00-12:00, B-110",
    approvalStatus: "ONAYLANDI",
  });
  const d3 = await advisor({
    email: "danisman3@teztakip.edu.tr",
    firstName: "Can",
    lastName: "Öztürk",
    title: "Dr. Öğr. Üyesi",
    departmentId: ceng.id,
    expertise: ["Ağ güvenliği", "Kriptografi"],
    quotaLisans: 2,
    quotaYL: 2,
    officeHours: "Perşembe 14:00-16:00, C-12",
    approvalStatus: "ONAYLANDI",
  });
  const d4 = await advisor({
    email: "danisman4@teztakip.edu.tr",
    firstName: "Zeynep",
    lastName: "Arslan",
    title: "Dr. Öğr. Üyesi",
    departmentId: ee.id,
    expertise: ["Gömülü sistemler", "Sinyal işleme"],
    quotaLisans: 3,
    quotaYL: 2,
    officeHours: "Pazartesi 11:00-13:00, E-201",
    approvalStatus: "ONAYLANDI",
  });
  await advisor({
    email: "danisman.bekleyen@teztakip.edu.tr",
    firstName: "Burak",
    lastName: "Şahin",
    title: "Dr. Öğr. Üyesi",
    departmentId: ceng.id,
    expertise: ["Yazılım mühendisliği"],
    quotaLisans: 2,
    quotaYL: 1,
    officeHours: "Belirlenecek",
    approvalStatus: "BEKLIYOR",
  });

  async function student(input: {
    email: string;
    firstName: string;
    lastName: string;
    studentNo: string;
    level: "LISANS" | "YUKSEK_LISANS";
    departmentId: string;
    advisorId?: string;
    stage?: "DANISMAN_SECIMI" | "KONU_ONERISI" | "KONU_ONAYI" | "ARA_RAPOR";
    title?: string;
    abstract?: string;
  }) {
    return prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
        role: "OGRENCI",
        studentProfile: {
          create: {
            studentNo: input.studentNo,
            level: input.level,
            departmentId: input.departmentId,
            advisorId: input.advisorId,
            thesis: {
              create: {
                title: input.title,
                abstract: input.abstract,
                stage: input.stage ?? "DANISMAN_SECIMI",
                titleSubmittedAt: input.title ? new Date() : undefined,
              },
            },
          },
        },
      },
      include: { studentProfile: { include: { thesis: true } } },
    });
  }

  const s1 = await student({
    email: "ogrenci1@teztakip.edu.tr",
    firstName: "Ali",
    lastName: "Yılmaz",
    studentNo: "20210001",
    level: "LISANS",
    departmentId: ceng.id,
    advisorId: d1.advisorProfile!.id,
    stage: "KONU_ONAYI",
    title: "Derin öğrenme ile belge sınıflandırma",
    abstract: "Bu tez, üniversite belgelerini otomatik sınıflandırmak için evrişimli sinir ağlarını inceler.",
  });
  const s2 = await student({
    email: "ogrenci2@teztakip.edu.tr",
    firstName: "Fatma",
    lastName: "Koç",
    studentNo: "20210002",
    level: "LISANS",
    departmentId: ceng.id,
    advisorId: d2.advisorProfile!.id,
    stage: "ARA_RAPOR",
    title: "Dağıtık veri tabanlarında tutarlılık",
    abstract: "Çalışma, çok düğümlü veri tabanlarında tutarlılık modellerini karşılaştırır.",
  });
  const s3 = await student({
    email: "ogrenci3@teztakip.edu.tr",
    firstName: "Emre",
    lastName: "Aydın",
    studentNo: "20220003",
    level: "YUKSEK_LISANS",
    departmentId: ceng.id,
    advisorId: d1.advisorProfile!.id,
    stage: "KONU_ONERISI",
    title: "Açıklanabilir yapay zeka yöntemleri",
    abstract: "Yüksek lisans tezi, kara kutu modellerin açıklanabilirliğini artırmayı hedefler.",
  });
  const s4 = await student({
    email: "ogrenci4@teztakip.edu.tr",
    firstName: "Deniz",
    lastName: "Çelik",
    studentNo: "20220004",
    level: "YUKSEK_LISANS",
    departmentId: ceng.id,
  });
  const s5 = await student({
    email: "ogrenci5@teztakip.edu.tr",
    firstName: "Merve",
    lastName: "Aksoy",
    studentNo: "20210005",
    level: "LISANS",
    departmentId: ee.id,
    advisorId: d4.advisorProfile!.id,
    stage: "KONU_ONAYI",
    title: "Gömülü sistemlerde güç tüketimi",
    abstract: "Düşük güç tüketimli gömülü uygulamalar için yazılım-donanım ortak tasarımı incelenir.",
  });
  const s6 = await student({
    email: "ogrenci6@teztakip.edu.tr",
    firstName: "Hakan",
    lastName: "Şen",
    studentNo: "20230006",
    level: "LISANS",
    departmentId: ceng.id,
  });

  await prisma.advisorPreference.createMany({
    data: [
      {
        studentId: s4.studentProfile!.id,
        advisorId: d2.advisorProfile!.id,
        rank: 1,
        note: "Veri tabanı alanında çalışmak istiyorum.",
        status: "BEKLIYOR",
        offeredAt: new Date(),
      },
      {
        studentId: s4.studentProfile!.id,
        advisorId: d3.advisorProfile!.id,
        rank: 2,
        note: "Veri tabanı alanında çalışmak istiyorum.",
        status: "BEKLIYOR",
        offeredAt: null,
      },
      {
        studentId: s6.studentProfile!.id,
        advisorId: d3.advisorProfile!.id,
        rank: 1,
        note: "Güvenlik konulu bir tez düşünüyorum.",
        status: "RED",
        offeredAt: new Date(Date.now() - 8 * 86400000),
        respondedAt: new Date(Date.now() - 6 * 86400000),
      },
      {
        studentId: s6.studentProfile!.id,
        advisorId: d1.advisorProfile!.id,
        rank: 2,
        note: "Güvenlik konulu bir tez düşünüyorum.",
        status: "BEKLIYOR",
        offeredAt: new Date(),
      },
    ],
  });

  const pdfName = `${randomUUID()}.pdf`;
  await writeFile(path.join(uploadDir, pdfName), Buffer.from("%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF"));

  const doc1 = await prisma.document.create({
    data: {
      thesisId: s1.studentProfile!.thesis!.id,
      type: "TEZ_ONERISI",
      title: "Tez önerisi v2",
      description: "Güncellenmiş öneri",
      currentVersion: 2,
      versions: {
        create: [
          {
            versionNo: 1,
            storedName: pdfName,
            originalName: "oneri-v1.pdf",
            mimeType: "application/pdf",
            size: 64,
            status: "DUZELTME_GEREKLI",
          },
          {
            versionNo: 2,
            storedName: pdfName,
            originalName: "oneri-v2.pdf",
            mimeType: "application/pdf",
            size: 64,
            status: "ONAYLANDI",
          },
        ],
      },
    },
    include: { versions: true },
  });

  await prisma.comment.createMany({
    data: [
      {
        documentVersionId: doc1.versions[0].id,
        authorId: d1.id,
        content: "Literatür taramasını genişletin.",
      },
      {
        documentVersionId: doc1.versions[0].id,
        authorId: s1.id,
        content: "Kaynakçayı güncelledim, ikinci sürümü yükledim.",
      },
    ],
  });

  await prisma.document.create({
    data: {
      thesisId: s2.studentProfile!.thesis!.id,
      type: "ARA_RAPOR",
      title: "Ara rapor 1",
      description: "İlk dönem raporu",
      currentVersion: 1,
      versions: {
        create: {
          versionNo: 1,
          storedName: pdfName,
          originalName: "ara-rapor.pdf",
          mimeType: "application/pdf",
          size: 64,
          status: "INCELENIYOR",
        },
      },
    },
  });

  await prisma.deadline.createMany({
    data: [
      {
        thesisId: s2.studentProfile!.thesis!.id,
        title: "Ara rapor teslimi",
        dueDate: new Date(Date.now() + 2 * 86400000),
        documentType: "ARA_RAPOR",
      },
      {
        thesisId: s1.studentProfile!.thesis!.id,
        title: "Taslak teslimi",
        dueDate: new Date(Date.now() - 3 * 86400000),
        documentType: "TEZ_TASLAGI",
      },
    ],
  });

  await prisma.meeting.create({
    data: {
      thesisId: s1.studentProfile!.thesis!.id,
      date: new Date(),
      subject: "Konu netleştirme",
      notes: "Öğrenci ikinci sürümü yükleyecek.",
    },
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: d2.id,
        type: "YENI_TERCIH",
        message: "Fatma Koç sizi 1. sırada tercih etti.",
        link: "/danisman/panel/tercihler",
      },
      {
        userId: s1.id,
        type: "YENI_YORUM",
        message: "Danışmanınız belgeye yorum yazdı.",
        link: `/ogrenci/panel/dosyalar/${doc1.id}`,
      },
      {
        userId: admin.id,
        type: "GENEL",
        message: "Onay bekleyen yeni danışman kaydı var.",
        link: "/yonetici/panel/danisman-onay",
      },
    ],
  });

  console.log("Seed tamamlandı. Deneme şifresi:", PASSWORD);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
