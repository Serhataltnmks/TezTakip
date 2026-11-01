import type {
  ApprovalStatus,
  DocumentStatus,
  DocumentType,
  NotificationType,
  PreferenceStatus,
  ProgramLevel,
  Role,
  ThesisStage,
} from "@/lib/enums";

export const roleLabel: Record<Role, string> = {
  OGRENCI: "Öğrenci",
  DANISMAN: "Danışman",
  YONETICI: "Yönetici",
};

export const levelLabel: Record<ProgramLevel, string> = {
  LISANS: "Lisans",
  YUKSEK_LISANS: "Yüksek Lisans",
};

export const approvalLabel: Record<ApprovalStatus, string> = {
  BEKLIYOR: "Onay Bekliyor",
  ONAYLANDI: "Onaylandı",
  REDDEDILDI: "Reddedildi",
};

export const preferenceLabel: Record<PreferenceStatus, string> = {
  BEKLIYOR: "Bekliyor",
  KABUL: "Kabul",
  RED: "Red",
  SURESI_DOLDU: "Süresi doldu",
  IPTAL: "İptal",
};

export const stageLabel: Record<ThesisStage, string> = {
  DANISMAN_SECIMI: "Danışman Seçimi",
  KONU_ONERISI: "Konu Önerisi",
  KONU_ONAYI: "Konu Onayı",
  ARA_RAPOR: "Ara Rapor(lar)",
  TASLAK: "Taslak",
  FINAL_TESLIM: "Final Teslim",
  TAMAMLANDI: "Tamamlandı",
};

export const documentTypeLabel: Record<DocumentType, string> = {
  TEZ_ONERISI: "Tez Önerisi",
  ARA_RAPOR: "Ara Rapor",
  TEZ_TASLAGI: "Tez Taslağı",
  FINAL_TEZ: "Final Tez",
  SUNUM: "Sunum",
  DIGER: "Diğer",
};

export const documentStatusLabel: Record<DocumentStatus, string> = {
  INCELENIYOR: "İnceleniyor",
  DUZELTME_GEREKLI: "Düzeltme Gerekli",
  ONAYLANDI: "Onaylandı",
};

export function labelOf<T extends string>(map: Record<T, string>, key: string) {
  return map[key as T] ?? key;
}

export const notificationTypeLabel: Record<NotificationType, string> = {
  YENI_TERCIH: "Yeni tercih",
  TERCIH_SONUCU: "Tercih sonucu",
  YENI_DOSYA: "Yeni dosya",
  YENI_YORUM: "Yeni yorum",
  DURUM_DEGISIKLIGI: "Durum değişikliği",
  YAKLASAN_SON_TARIH: "Yaklaşan son tarih",
  GENEL: "Genel",
};
