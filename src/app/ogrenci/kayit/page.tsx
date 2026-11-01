import { StudentRegisterForm } from "@/components/auth/student-register-form";
import { AuthShell } from "@/components/auth/auth-shell";
import Link from "next/link";

export default function StudentRegisterPage() {
  return (
    <AuthShell title="Öğrenci Kaydı" subtitle="Lisans veya yüksek lisans öğrencisi olarak kayıt olun.">
      <StudentRegisterForm />
      <p className="mt-4 text-center text-sm">
        Hesabın var mı?{" "}
        <Link href="/ogrenci/giris" className="font-medium text-primary hover:underline">
          Giriş yap
        </Link>
      </p>
    </AuthShell>
  );
}
