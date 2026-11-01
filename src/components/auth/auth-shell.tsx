import Link from "next/link";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function AuthShell({
  title,
  subtitle,
  children,
  theme = "student",
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  theme?: "student" | "advisor" | "admin";
}) {
  const wrap =
    theme === "advisor"
      ? "from-violet-50 via-white to-fuchsia-50 dark:from-slate-950 dark:via-slate-900 dark:to-violet-950 theme-advisor"
      : theme === "admin"
        ? "from-amber-50 via-white to-orange-50 dark:from-slate-950 dark:via-slate-900 dark:to-amber-950 theme-admin"
        : "from-sky-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-sky-950";

  return (
    <main className={cn("min-h-screen bg-gradient-to-br px-4 py-10", wrap)}>
      <div className="mx-auto w-full max-w-md">
        <Link href="/" className="mb-6 inline-block text-sm text-muted-foreground hover:underline">
          ← Rol seçimine dön
        </Link>
        <div className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="mb-6 mt-1 text-sm text-muted-foreground">{subtitle}</p>
          {children}
        </div>
      </div>
    </main>
  );
}
