import { LoginForm } from "@/components/auth/login-form";
import { AuthShell } from "@/components/auth/auth-shell";

export default function AdminLoginPage() {
  return (
    <AuthShell title="Yönetici Girişi" subtitle="Bölüm / enstitü sekreterliği hesabı." theme="admin">
      <LoginForm intendedRole="YONETICI" callbackUrl="/yonetici/panel" />
    </AuthShell>
  );
}
