import { describe, expect, it } from "vitest";
import { validateUploadFile } from "../file-validation";

describe("dosya türü doğrulama", () => {
  it("izin verilen PDF dosyasını kabul eder", () => {
    const result = validateUploadFile({
      originalName: "tez.pdf",
      mimeType: "application/pdf",
      size: 1024,
      buffer: Buffer.from("%PDF-1.4 test"),
    });
    expect(result.ok).toBe(true);
  });

  it("exe uzantısını reddeder", () => {
    const result = validateUploadFile({
      originalName: "zararli.exe",
      mimeType: "application/pdf",
      size: 1024,
    });
    expect(result.ok).toBe(false);
  });

  it("uzantı ile MIME uyuşmazsa reddeder", () => {
    const result = validateUploadFile({
      originalName: "tez.pdf",
      mimeType: "image/png",
      size: 1024,
    });
    expect(result.ok).toBe(false);
  });

  it("25 MB üstünü reddeder", () => {
    const result = validateUploadFile({
      originalName: "tez.pdf",
      mimeType: "application/pdf",
      size: 26 * 1024 * 1024,
    });
    expect(result.ok).toBe(false);
  });

  it("PDF uzantılı sahte içeriği reddeder", () => {
    const result = validateUploadFile({
      originalName: "tez.pdf",
      mimeType: "application/pdf",
      size: 12,
      buffer: Buffer.from("not-a-pdf!!!!"),
    });
    expect(result.ok).toBe(false);
  });
});
