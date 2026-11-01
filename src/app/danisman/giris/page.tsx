import { LoginForm } from "@/components/auth/login-form";
import { AuthShell } from "@/components/auth/auth-shell";

export default function AdvisorLoginPage() {
  return (
    <AuthShell
      title="Danışman Girişi"
      subtitle="Öğretim üyesi hesabınızla sisteme giriş yapın."
      theme="advisor"
    >
      <LoginForm intendedRole="DANISMAN" registerHref="/danisman/kayit" callbackUrl="/danisman/panel" />
    </AuthShell>
  );
}
