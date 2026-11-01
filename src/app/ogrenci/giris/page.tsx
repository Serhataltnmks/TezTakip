import { LoginForm } from "@/components/auth/login-form";
import { AuthShell } from "@/components/auth/auth-shell";

export default function StudentLoginPage() {
  return (
    <AuthShell title="Öğrenci Girişi" subtitle="Öğrenci hesabınızla sisteme giriş yapın." theme="student">
      <LoginForm intendedRole="OGRENCI" registerHref="/ogrenci/kayit" callbackUrl="/ogrenci/panel" />
    </AuthShell>
  );
}
