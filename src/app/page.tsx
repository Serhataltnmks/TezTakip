import Link from "next/link";
import { GraduationCap, Shield, UserRound } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-4 py-12">
        <div className="mb-10 text-center">
          <p className="mb-2 text-sm font-medium uppercase tracking-widest text-primary">Üniversite Tez Süreçleri</p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Tez Takip Sistemi</h1>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Devam etmek için rolünüzü seçin. Öğrenciler danışman tercih eder ve dosya yükler; danışmanlar ilerlemeyi takip eder.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Link
            href="/ogrenci/giris"
            className="group rounded-2xl border bg-card p-8 shadow-sm transition hover:-translate-y-1 hover:border-sky-400 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300">
              <GraduationCap className="h-9 w-9" />
            </div>
            <h2 className="text-2xl font-semibold">Öğrenci Girişi</h2>
            <p className="mt-2 text-muted-foreground">
              Danışmanını seç, tez dosyalarını yükle ve sürecini adım adım takip et.
            </p>
            <span className="mt-6 inline-flex text-sm font-medium text-sky-700 group-hover:underline dark:text-sky-300">
              Öğrenci olarak devam et →
            </span>
          </Link>

          <Link
            href="/danisman/giris"
            className="group rounded-2xl border bg-card p-8 shadow-sm transition hover:-translate-y-1 hover:border-violet-400 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
              <UserRound className="h-9 w-9" />
            </div>
            <h2 className="text-2xl font-semibold">Danışman Girişi</h2>
            <p className="mt-2 text-muted-foreground">
              Öğrencilerini, yüklenen dosyaları ve tez ilerlemesini incele, geri bildirim ver.
            </p>
            <span className="mt-6 inline-flex text-sm font-medium text-violet-700 group-hover:underline dark:text-violet-300">
              Danışman olarak devam et →
            </span>
          </Link>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/yonetici/giris"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground hover:underline"
          >
            <Shield className="h-4 w-4" />
            Yönetici Girişi
          </Link>
        </div>
      </div>
    </main>
  );
}
