# Tez Takip Sistemi

Lisans ve yüksek lisans öğrencileri için web tabanlı tez takip uygulaması. Öğrenciler danışman tercih eder ve tez dosyası yükler; danışmanlar ilerlemeyi, dosyaları ve görüşmeleri takip eder; yöneticiler hesapları onaylar ve raporları görür.

## Teknolojiler

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui benzeri bileşenler
- Prisma ORM (geliştirme: SQLite)
- NextAuth Credentials + bcrypt
- React Hook Form + Zod
- Yerel disk depolama (`uploads/`, `src/lib/storage.ts`)

## Kurulum

```bash
npm install
copy .env.example .env
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Tarayıcıda: [http://localhost:3000](http://localhost:3000)

## .env örneği

```
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="uzun-rastgele-bir-gizli-anahtar"
NEXTAUTH_URL="http://localhost:3000"
UPLOAD_DIR="./uploads"
```

## Komutlar

| Komut | Açıklama |
| --- | --- |
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` | Üretim derlemesi |
| `npm start` | Derlenmiş uygulamayı çalıştır |
| `npm test` | Vitest birim testleri |
| `npx prisma studio` | Veri tarayıcısı |

## Deneme hesapları

Tüm şifreler: **`Sifre123`**

| Rol | E-posta | Not |
| --- | --- | --- |
| Yönetici | `admin@teztakip.edu.tr` | Danışman onayları ve raporlar |
| Danışman | `danisman1@teztakip.edu.tr` | Prof. Dr. Mehmet Kaya (CENG, onaylı) |
| Danışman | `danisman2@teztakip.edu.tr` | Doç. Dr. Elif Demir (CENG, onaylı) |
| Danışman | `danisman3@teztakip.edu.tr` | Dr. Öğr. Üyesi Can Öztürk (CENG, onaylı) |
| Danışman | `danisman4@teztakip.edu.tr` | Dr. Öğr. Üyesi Zeynep Arslan (EE, onaylı) |
| Danışman | `danisman.bekleyen@teztakip.edu.tr` | Onay bekliyor |
| Öğrenci | `ogrenci1@teztakip.edu.tr` | Lisans, danışmanı Kaya, dosya/yorum örnekleri |
| Öğrenci | `ogrenci2@teztakip.edu.tr` | Lisans, danışmanı Demir |
| Öğrenci | `ogrenci3@teztakip.edu.tr` | Yüksek lisans, danışmanı Kaya |
| Öğrenci | `ogrenci4@teztakip.edu.tr` | Yüksek lisans, 1. tercih Demir’de bekliyor |
| Öğrenci | `ogrenci5@teztakip.edu.tr` | Lisans EE, danışmanı Arslan |
| Öğrenci | `ogrenci6@teztakip.edu.tr` | Lisans, 2. tercih Kaya’da aktif |

Girişte önce `/` üzerinde rol kartını seçin. Öğrenci hesabıyla danışman sayfasından giriş yapılamaz.

## PostgreSQL’e geçiş

1. `prisma/schema.prisma` içinde `datasource db` satırını değiştirin:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. `.env` içine PostgreSQL bağlantı dizesini yazın:

```
DATABASE_URL="postgresql://kullanici:sifre@localhost:5432/teztakip?schema=public"
```

3. Migration’ları yeniden uygulayın:

```bash
npx prisma migrate dev --name postgres
```

Şema SQLite ile uyumlu tutulmuştur; tek satırlık `provider` değişikliği yeterlidir.

## Klasör yapısı

```
prisma/                 şema, migration, seed
src/app/                sayfalar ve API (App Router)
  ogrenci/              öğrenci giriş, kayıt, panel
  danisman/             danışman giriş, kayıt, onay bekliyor, panel
  yonetici/             yönetici giriş ve panel
  api/                  kimlik, dosya, tercih, admin
src/components/         arayüz, formlar, paneller
src/lib/                prisma, auth, storage, iş kuralları
uploads/                yüklenen dosyalar (public değil)
```

Dosyalar `public/` altında tutulmaz; indirme `/api/files/[versionId]` üzerinden yetki kontrolüyle yapılır.

## İş kuralları (özet)

- Danışman kaydı yönetici onayına kadar panele giremez.
- Öğrenci en fazla 3 sıralı tercih yapar; yanıt 7 gün içinde gelmezse sıradaki danışmana geçer.
- Kontenjanı dolan danışman yeni tercih / atama alamaz.
- Aynı belge türünde yeni yükleme sürüm olarak saklanır (v1, v2…).
- PDF tarayıcıda önizlenir; Word/PowerPoint indirilir.
