export type Role = "OGRENCI" | "DANISMAN" | "YONETICI";
export type ProgramLevel = "LISANS" | "YUKSEK_LISANS";
export type ApprovalStatus = "BEKLIYOR" | "ONAYLANDI" | "REDDEDILDI";
export type PreferenceStatus = "BEKLIYOR" | "KABUL" | "RED" | "SURESI_DOLDU" | "IPTAL";
export type ThesisStage =
  | "DANISMAN_SECIMI"
  | "KONU_ONERISI"
  | "KONU_ONAYI"
  | "ARA_RAPOR"
  | "TASLAK"
  | "FINAL_TESLIM"
  | "TAMAMLANDI";
export type DocumentType = "TEZ_ONERISI" | "ARA_RAPOR" | "TEZ_TASLAGI" | "FINAL_TEZ" | "SUNUM" | "DIGER";
export type DocumentStatus = "INCELENIYOR" | "DUZELTME_GEREKLI" | "ONAYLANDI";
export type NotificationType =
  | "YENI_TERCIH"
  | "TERCIH_SONUCU"
  | "YENI_DOSYA"
  | "YENI_YORUM"
  | "DURUM_DEGISIKLIGI"
  | "YAKLASAN_SON_TARIH"
  | "GENEL";
