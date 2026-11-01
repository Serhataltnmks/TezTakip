import path from "path";
import {
  ALLOWED_EXTENSIONS,
  ALLOWED_MIME_TYPES,
  EXT_TO_MIME,
  MAX_FILE_SIZE,
} from "./constants";

export type FileValidationResult =
  | { ok: true; extension: string; mimeType: string }
  | { ok: false; error: string };

function getExtension(filename: string) {
  return path.extname(filename).toLowerCase();
}

function looksLikePdf(buffer: Buffer) {
  return buffer.subarray(0, 4).toString("ascii") === "%PDF";
}

function looksLikeZip(buffer: Buffer) {
  return buffer[0] === 0x50 && buffer[1] === 0x4b;
}

function looksLikeOle(buffer: Buffer) {
  return (
    buffer[0] === 0xd0 &&
    buffer[1] === 0xcf &&
    buffer[2] === 0x11 &&
    buffer[3] === 0xe0
  );
}

export function isAllowedExtension(filename: string) {
  return (ALLOWED_EXTENSIONS as readonly string[]).includes(getExtension(filename));
}

export function isAllowedMime(mimeType: string, extension?: string) {
  const normalized = (mimeType || "").toLowerCase();
  if (extension) {
    const allowed = EXT_TO_MIME[extension] ?? [];
    return allowed.includes(normalized);
  }
  return (ALLOWED_MIME_TYPES as readonly string[]).includes(normalized);
}

export function validateUploadFile(input: {
  originalName: string;
  mimeType: string;
  size: number;
  buffer?: Buffer;
}): FileValidationResult {
  const extension = getExtension(input.originalName);

  if (!input.originalName || !extension) {
    return { ok: false, error: "Dosya adı veya uzantısı geçersiz." };
  }

  if (!isAllowedExtension(input.originalName)) {
    return {
      ok: false,
      error: "Yalnızca Word, PDF ve PowerPoint dosyaları yüklenebilir (.doc, .docx, .pdf, .ppt, .pptx).",
    };
  }

  if (input.size <= 0) {
    return { ok: false, error: "Dosya boş görünüyor." };
  }

  if (input.size > MAX_FILE_SIZE) {
    return { ok: false, error: "Dosya boyutu 25 MB sınırını aşıyor." };
  }

  if (!isAllowedMime(input.mimeType, extension)) {
    return { ok: false, error: "Dosyanın MIME türü izin verilen türlerle eşleşmiyor." };
  }

  if (input.buffer && input.buffer.length >= 4) {
    const pdf = looksLikePdf(input.buffer);
    const zip = looksLikeZip(input.buffer);
    const ole = looksLikeOle(input.buffer);

    if (extension === ".pdf" && !pdf) {
      return { ok: false, error: "Dosya içeriği geçerli bir PDF değil." };
    }
    if ([".docx", ".pptx"].includes(extension) && !zip) {
      return { ok: false, error: "Dosya içeriği beklenen Office belgesi biçiminde değil." };
    }
    if ([".doc", ".ppt"].includes(extension) && !ole && !zip) {
      return { ok: false, error: "Dosya içeriği beklenen Office belgesi biçiminde değil." };
    }
  }

  return { ok: true, extension, mimeType: input.mimeType };
}

export function isPreviewablePdf(mimeType: string, originalName: string) {
  return mimeType === "application/pdf" || getExtension(originalName) === ".pdf";
}
