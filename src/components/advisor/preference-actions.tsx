"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function PreferenceActions({ id }: { id: string }) {
  async function decide(decision: "KABUL" | "RED") {
    const res = await fetch(`/api/preferences/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? "İşlem başarısız");
      return;
    }
    toast.success(decision === "KABUL" ? "Öğrenci kabul edildi." : "Tercih reddedildi.");
    window.location.reload();
  }

  return (
    <div className="flex gap-2">
      <Button onClick={() => decide("KABUL")}>Kabul et</Button>
      <Button variant="destructive" onClick={() => decide("RED")}>
        Reddet
      </Button>
    </div>
  );
}
