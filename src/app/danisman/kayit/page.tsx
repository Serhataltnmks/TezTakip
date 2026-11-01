import { AdvisorRegisterForm } from "@/components/auth/advisor-register-form";
import { AuthShell } from "@/components/auth/auth-shell";
import Link from "next/link";

export default function AdvisorRegisterPage() {
  return (
    <AuthShell
      title="Danışman Kaydı"
      subtitle="Hesabınız yönetici onayına kadar bekleyecektir."
      theme="advisor"
    >
      <AdvisorRegisterForm />
      <p className="mt-4 text-center text-sm">
        Hesabın var mı?{" "}
        <Link href="/danisman/giris" className="font-medium text-primary hover:underline">
          Giriş yap
        </Link>
      </p>
    </AuthShell>
  );
}
