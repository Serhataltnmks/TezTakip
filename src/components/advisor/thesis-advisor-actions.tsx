"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { stageLabel } from "@/lib/labels";
import { THESIS_STAGES } from "@/lib/constants";
import type { ThesisStage } from "@/lib/enums";

export function ThesisAdvisorActions({ thesisId, stage }: { thesisId: string; stage: ThesisStage }) {
  async function review(action: "ONAY" | "DUZELTME") {
    const revisionNote = action === "DUZELTME" ? window.prompt("Düzeltme notu") ?? "" : undefined;
    const res = await fetch("/api/thesis", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ thesisId, action, revisionNote }),
    });
    const data = await res.json();
    if (!res.ok) toast.error(data.error ?? "İşlem başarısız");
    else {
      toast.success("Konu değerlendirmesi kaydedildi.");
      window.location.reload();
    }
  }

  async function setStage(next: ThesisStage) {
    const res = await fetch("/api/thesis", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ thesisId, stage: next }),
    });
    const data = await res.json();
    if (!res.ok) toast.error(data.error ?? "Aşama güncellenemedi");
    else {
      toast.success("Aşama güncellendi.");
      window.location.reload();
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => review("ONAY")}>
          Konuyu onayla
        </Button>
        <Button size="sm" variant="outline" onClick={() => review("DUZELTME")}>
          Düzeltme iste
        </Button>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <span>Aşamayı değiştir:</span>
        <select
          className="h-10 rounded-md border border-input bg-background px-3"
          defaultValue={stage}
          onChange={(e) => setStage(e.target.value as ThesisStage)}
        >
          {THESIS_STAGES.map((s) => (
            <option key={s} value={s}>
              {stageLabel[s]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
