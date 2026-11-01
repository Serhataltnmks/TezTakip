export const MAX_FILE_SIZE = 25 * 1024 * 1024;
export const MAX_PREFERENCES = 3;
export const PREFERENCE_TIMEOUT_DAYS = 7;
export const DEADLINE_REMINDER_DAYS = 3;
export const LOGIN_RATE_LIMIT = { windowMs: 60_000, max: 8 };

export const ALLOWED_EXTENSIONS = [".doc", ".docx", ".pdf", ".ppt", ".pptx"] as const;

export const ALLOWED_MIME_TYPES = [
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/pdf",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
] as const;

export const EXT_TO_MIME: Record<string, string[]> = {
  ".doc": ["application/msword"],
  ".docx": [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/octet-stream",
  ],
  ".pdf": ["application/pdf"],
  ".ppt": ["application/vnd.ms-powerpoint"],
  ".pptx": [
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/octet-stream",
  ],
};

export const ADVISOR_TITLES = [
  "Prof. Dr.",
  "Doç. Dr.",
  "Dr. Öğr. Üyesi",
  "Öğr. Gör. Dr.",
  "Öğr. Gör.",
  "Arş. Gör. Dr.",
  "Arş. Gör.",
] as const;

export const THESIS_STAGES = [
  "DANISMAN_SECIMI",
  "KONU_ONERISI",
  "KONU_ONAYI",
  "ARA_RAPOR",
  "TASLAK",
  "FINAL_TESLIM",
  "TAMAMLANDI",
] as const;
