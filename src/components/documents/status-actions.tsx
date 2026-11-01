"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { DocumentStatus } from "@/lib/enums";

export function StatusActions({
  documentId,
  versionId,
  current,
}: {
  documentId: string;
  versionId: string;
  current: DocumentStatus;
}) {
  async function setStatus(status: DocumentStatus) {
    const res = await fetch(`/api/documents/${documentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ versionId, status }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? "Güncellenemedi");
      return;
    }
    toast.success("Durum güncellendi.");
    window.location.reload();
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button size="sm" variant={current === "INCELENIYOR" ? "default" : "outline"} onClick={() => setStatus("INCELENIYOR")}>
        İnceleniyor
      </Button>
      <Button size="sm" variant={current === "DUZELTME_GEREKLI" ? "default" : "outline"} onClick={() => setStatus("DUZELTME_GEREKLI")}>
        Düzeltme Gerekli
      </Button>
      <Button size="sm" variant={current === "ONAYLANDI" ? "default" : "outline"} onClick={() => setStatus("ONAYLANDI")}>
        Onaylandı
      </Button>
    </div>
  );
}
